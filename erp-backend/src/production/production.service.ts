import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductionOrder } from './production-order.entity';
import { ProductionOrderItem } from './production-order-item.entity';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { CompleteProductionOrderDto } from './dto/complete-production-order.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(ProductionOrder)
    private poRepo: Repository<ProductionOrder>,
    @InjectRepository(ProductionOrderItem)
    private poItemRepo: Repository<ProductionOrderItem>,
    private dataSource: DataSource,
  ) {}

  private generateOrderNumber(): string {
    // e.g. PO-YYYYMMDD-XXXX
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

    return this.poRepo.save(po);
  }

  async findAll() {
    return this.poRepo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const po = await this.poRepo.findOne({ where: { id } });
    if (!po) throw new NotFoundException('Production order not found');
    return po;
  }

  async update(id: number, dto: UpdateProductionOrderDto) {
    const po = await this.findOne(id);
    if (po.status === 'completed' || po.status === 'in_progress') {
      throw new BadRequestException('Cannot update an order in progress or completed');
    }

    // simple header updates
    po.fg_item_id = dto.fg_item_id ?? po.fg_item_id;
    po.quantity = dto.quantity ?? po.quantity;
    po.warehouse_id = dto.warehouse_id ?? po.warehouse_id;
    po.remarks = dto.remarks ?? po.remarks;

    if (dto.items) {
      // Replace items (for simplicity): delete existing and add new
      await this.poItemRepo.delete({ production_order_id: id });
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
    const po = await this.findOne(id);
    if (po.status !== 'planned' && po.status !== 'draft') {
      throw new BadRequestException('Only planned orders can be started');
    }
    po.status = 'in_progress';
    return this.poRepo.save(po);
  }

  async cancel(id: number) {
    const po = await this.findOne(id);
    if (po.status === 'completed') {
      throw new BadRequestException('Cannot cancel completed order');
    }
    po.status = 'cancelled';
    return this.poRepo.save(po);
  }

  /**
   * Complete the production order:
   * - Create FG Receipt (increase FG stock)
   * - Mark raw materials consumed (decrease stock)
   * - Update PO status to completed
   *
   * NOTE: Inventory / stock ledger calls are marked as TODO - call your inventory service here.
   */
  async complete(id: number, dto: CompleteProductionOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const po = await queryRunner.manager.findOne(ProductionOrder, { where: { id } });
      if (!po) throw new NotFoundException('Production order not found');

      if (po.status === 'completed') throw new BadRequestException('Already completed');

      // load items
      const items = await queryRunner.manager.find(ProductionOrderItem, {
        where: { production_order_id: id },
      });

      // TODO: Validate stock availability for each raw material item
      // For each item: reduce stock (create stock ledger entry)
      // call: inventoryService.decreaseStock(item_id, qty, { reference: 'production', reference_id: id })
      // Also update 'issued_qty' in production_order_items

      for (const item of items) {
        // We use issued_qty = required_qty (assuming full issue)
        item.issued_qty = Number(item.required_qty);
        await queryRunner.manager.save(item);

        // Example placeholder:
        // await inventoryService.decreaseStock(item.item_id, item.required_qty, { transactionQueryRunner: queryRunner, reference_type:'production', reference_id: id });
      }

      // Create FG receipt: increase FG stock
      // await inventoryService.increaseStock(po.fg_item_id, dto.produced_qty, { transactionQueryRunner: queryRunner, reference_type:'production_fg_receipt', reference_id: id, warehouse_id: dto.warehouse_id || po.warehouse_id });

      po.status = 'completed';
      await queryRunner.manager.save(po);

      // commit
      await queryRunner.commitTransaction();

      // Optionally return updated PO with items
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
