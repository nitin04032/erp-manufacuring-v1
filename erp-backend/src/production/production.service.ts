import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductionOrder } from './production-order.entity';
import { ProductionOrderItem } from './production-order-item.entity';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { CompleteProductionOrderDto } from './dto/complete-production-order.dto';
import { InventoryService } from '../inventory/inventory.service'; // <-- नया इम्पोर्ट जोड़ा गया

export interface ClientProductionOrder {
  id: number;
  order_number: string;
  fg_item_id: number;
  fg_code: string;
  fg_name: string;
  order_qty: number;
  warehouse_id: number;
  warehouse_name: string;
  status: string;
  remarks: string | null;
  created_at: Date;
  updated_at: Date;
  planned_start_date: Date;
  planned_end_date: Date | null;
}

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder)
    private poRepo: Repository<ProductionOrder>,
    @InjectRepository(ProductionOrderItem)
    private poItemRepo: Repository<ProductionOrderItem>,
    private dataSource: DataSource,
    private inventoryService: InventoryService, // <-- InventoryService को यहाँ जोड़ा गया
  ) {}

  private generateOrderNumber(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `PROD-${y}${m}${day}-${rnd}`;
  }

  async create(dto: CreateProductionOrderDto) {
    const po = this.poRepo.create({
      order_number: this.generateOrderNumber(),
      fg_item_id: dto.fg_item_id,
      quantity: dto.quantity,
      warehouse_id: dto.warehouse_id,
      remarks: dto.remarks || null,
      status: 'planned',
      items: dto.items.map((it) =>
        this.poItemRepo.create({
          item_id: it.item_id,
          required_qty: it.required_qty,
          issued_qty: 0,
          remarks: it.remarks || null,
        }),
      ),
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.poRepo.save(po);
  }

  private transformOrder(po: ProductionOrder): ClientProductionOrder {
    return {
      id: po.id,
      order_number: po.order_number,
      fg_item_id: po.fg_item_id,
      fg_code: po.fg_item?.sku || 'N/A',
      fg_name: po.fg_item?.name || 'N/A',
      order_qty: po.quantity,
      warehouse_id: po.warehouse_id,
      warehouse_name: po.warehouse?.name || 'N/A',
      status: po.status,
      remarks: po.remarks,
      created_at: po.created_at,
      updated_at: po.updated_at,
      // No planned_start_date in entity, assuming created_at for now or null
      planned_start_date: po.created_at,
      planned_end_date: null,
    };
  }

  async findAll(): Promise<ClientProductionOrder[]> {
    const orders = await this.poRepo.find({
      order: { created_at: 'DESC' },
      relations: ['fg_item', 'warehouse'],
    });
    return orders.map((o) => this.transformOrder(o));
  }

  async findOne(id: number): Promise<ClientProductionOrder> {
    const po = await this.poRepo.findOne({
      where: { id },
      relations: ['fg_item', 'warehouse', 'items'],
    });
    if (!po) throw new NotFoundException('Production order not found');
    return this.transformOrder(po);
  }

  async update(id: number, dto: UpdateProductionOrderDto) {
    const po: any = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (po.status === 'completed' || po.status === 'in_progress') {
      throw new BadRequestException(
        'Cannot update an order in progress or completed',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    po.fg_item_id = dto.fg_item_id ?? po.fg_item_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    po.quantity = dto.quantity ?? po.quantity;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    po.warehouse_id = dto.warehouse_id ?? po.warehouse_id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    po.remarks = dto.remarks ?? po.remarks;

    if (dto.items) {
      await this.poItemRepo.delete({ production_order_id: id });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      po.items = dto.items.map((it) =>
        this.poItemRepo.create({
          production_order_id: id,
          item_id: it.item_id,
          required_qty: it.required_qty,
          issued_qty: 0,
          remarks: it.remarks || null,
        }),
      );
    }

    return this.poRepo.save(po);
  }

  async start(id: number) {
    const po: any = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (po.status !== 'planned' && po.status !== 'draft') {
      throw new BadRequestException('Only planned orders can be started');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    po.status = 'in_progress';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.poRepo.save(po);
  }

  async cancel(id: number) {
    const po: any = await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (po.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed order');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    po.status = 'cancelled';

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.poRepo.save(po);
  }

  /**
   * Complete the production order by calling InventoryService
   * to atomically update stock and create ledger entries.
   */
  async complete(id: number, dto: CompleteProductionOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const po = await queryRunner.manager.findOne(ProductionOrder, {
        where: { id },
      });
      if (!po) throw new NotFoundException('Production order not found');
      if (po.status === 'completed')
        throw new BadRequestException('Already completed');

      const items = await queryRunner.manager.find(ProductionOrderItem, {
        where: { production_order_id: id },
      });

      // 1) Validate availability for each raw material
      for (const item of items) {
        await this.inventoryService.checkAvailability(
          item.item_id,
          po.warehouse_id,
          Number(item.required_qty),
          queryRunner,
        );
      }

      // 2) Decrease raw materials (issue to production) & update issued_qty
      for (const item of items) {
        await this.inventoryService.decreaseStock(
          item.item_id,
          po.warehouse_id,
          Number(item.required_qty),
          {
            reference_type: 'production_issue',
            reference_id: id,
            remarks: `Issued to production ${po.order_number}`,
            queryRunner,
          },
        );

        item.issued_qty = Number(item.required_qty);
        await queryRunner.manager.save(item);
      }

      // 3) Increase FG stock
      const targetWarehouse = dto.warehouse_id ?? po.warehouse_id;
      await this.inventoryService.increaseStock(
        po.fg_item_id,
        targetWarehouse,
        Number(dto.produced_qty),
        {
          reference_type: 'production_fg_receipt',
          reference_id: id,
          remarks: `FG produced for ${po.order_number}`,
          queryRunner,
        },
      );

      // 4) Mark PO completed
      po.status = 'completed';
      await queryRunner.manager.save(po);

      await queryRunner.commitTransaction();

      // return fresh PO

      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
