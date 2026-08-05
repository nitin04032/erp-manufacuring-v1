import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { CreateFgrDto } from './dto/create-fgr.dto';
import { UpdateFgrDto } from './dto/update-fgr.dto';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class FgrService {
  constructor(
    @InjectRepository(FinishedGoodsReceipt)
    private repo: Repository<FinishedGoodsReceipt>,
    private itemsService: ItemsService,
    private warehousesService: WarehousesService,
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateFgrDto): Promise<FinishedGoodsReceipt> {
    // Resolve item by code and warehouse by name up front.
    const item = await this.itemsService.findByCode(dto.item_code);
    const warehouse = await this.warehousesService.findByName(dto.warehouse_name);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const fgr = queryRunner.manager.create(FinishedGoodsReceipt, {
        receipt_number: dto.receipt_number,
        production_order_no: dto.production_order_no,
        item_name: dto.item_name,
        quantity: dto.quantity,
        uom: dto.uom,
        warehouse_name: dto.warehouse_name,
        receipt_date: new Date(dto.receipt_date),
        status: dto.status ?? 'draft',
        remarks: dto.remarks ?? undefined,
      } as Partial<FinishedGoodsReceipt>);

      const savedFgr = await queryRunner.manager.save(FinishedGoodsReceipt, fgr);

      await this.inventoryService.increaseStock(item.id, warehouse.id, dto.quantity, {
        reference_type: 'fgr_receipt',
        reference_id: savedFgr.id,
        remarks: `FGR ${savedFgr.receipt_number}`,
        queryRunner,
      });

      await queryRunner.commitTransaction();
      return savedFgr;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll(): Promise<FinishedGoodsReceipt[]> {
    return this.repo.find({
      order: { receipt_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return rec;
  }

  async update(id: number, dto: UpdateFgrDto): Promise<FinishedGoodsReceipt> {
    // Note: Updating FGR is complex as it requires reversing/adjusting stock.
    // This is a simplified update. Phase 1 scope: header-only, no stock re-adjustment.
    const rec = await this.repo.preload({ id, ...dto });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return this.repo.save(rec);
  }

  async remove(id: number): Promise<void> {
    // Note: A real remove would need to reverse the stock transaction.
    // Phase 1 scope: not implemented — flagged as a Phase 2 follow-up.
    const res = await this.repo.softDelete(id);
    if (res.affected === 0) throw new NotFoundException(`FGR #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
