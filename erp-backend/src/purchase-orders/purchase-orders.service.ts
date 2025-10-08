// erp-backend/src/purchase-orders/purchase-orders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Supplier } from '../suppliers/supplier.entity';
import { Item } from '../items/item.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private repo: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepo: Repository<Warehouse>,
  ) {}

  /**
   * ✅ 1. DATA TRANSFORMER FUNCTION
   * Yeh function database PurchaseOrder object ko frontend-friendly format mein badalta hai.
   * Isse nested objects (like supplier, warehouse) ke naam seedhe mil jaate hain.
   */
  private transformPoForClient(po: PurchaseOrder): any {
    return {
      id: po.id,
      po_number: po.po_number,
      order_date: po.order_date,
      expected_date: po.expected_date,
      status: po.status,
      total_amount: po.total_amount,
      // Nested objects se seedhe naam nikal kar bhejenge
      supplier_name: po.supplier?.name || 'N/A',
      warehouse_name: po.warehouse?.name || 'N/A',
      // findOne ke liye poori details bhi bhejenge
      supplier_id: po.supplier?.id,
      warehouse_id: po.warehouse?.id,
      items: po.items?.map(item => ({
        id: item.id,
        item_id: item.item?.id,
        item_name: item.item?.item_name || 'N/A',
        item_code: item.item?.item_code || 'N/A',
        ordered_qty: item.ordered_qty,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        tax_percent: item.tax_percent,
        total_amount: item.total_amount,
      })),
    };
  }

  // --- Create Method (No changes needed here) ---
  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplier_id });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${dto.supplier_id} not found`);
    }

    const warehouse = await this.warehouseRepo.findOneBy({ id: dto.warehouse_id });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${dto.warehouse_id} not found`);
    }

    if (!dto.po_number) {
      const lastPO = await this.repo.findOne({ where: {}, order: { id: 'DESC' } });
      const nextId = (lastPO?.id || 0) + 1;
      dto.po_number = `PO-${String(nextId).padStart(4, '0')}`;
    }

    const po = new PurchaseOrder();
    let calculatedTotalAmount = 0;

    const poItems: PurchaseOrderItem[] = [];
    for (const itemDto of dto.items) {
      const item = await this.itemRepo.findOneBy({ id: itemDto.item_id });
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemDto.item_id} not found`);
      }
      const poItem = new PurchaseOrderItem();
      poItem.item = item;
      poItem.ordered_qty = itemDto.ordered_qty;
      poItem.unit_price = itemDto.unit_price;
      poItem.total_amount = itemDto.ordered_qty * itemDto.unit_price;
      poItems.push(poItem);
      calculatedTotalAmount += poItem.total_amount;
    }

    po.po_number = dto.po_number;
    po.supplier = supplier;
    po.warehouse = warehouse;
    po.order_date = new Date(dto.order_date);
    po.expected_date = dto.expected_date ? new Date(dto.expected_date) : undefined;
    po.status = dto.status || 'draft';
    po.total_amount = calculatedTotalAmount;
    po.items = poItems;

    return this.repo.save(po);
  }

  /**
   * ✅ 2. UPDATED FINDALL METHOD
   * Ab yeh method transformer function use karta hai.
   * Return type `Promise<any[]>` hai kyunki ab hum custom objects bhej rahe hain.
   */
  async findAll(query: { status?: string; supplier?: string }): Promise<any[]> {
    const options: FindManyOptions<PurchaseOrder> = {
      order: { order_date: 'DESC' },
      relations: ['supplier', 'warehouse'], // Relations zaroori hain transformer ke liye
      where: {},
    };

    if (query.status) {
      options.where = { ...options.where, status: query.status };
    }

    if (query.supplier) {
      options.where = { ...options.where, supplier: { id: parseInt(query.supplier, 10) } };
    }

    const purchaseOrders = await this.repo.find(options);
    // Har PO ko transform karke bhejein
    return purchaseOrders.map(po => this.transformPoForClient(po));
  }

  /**
   * ✅ 3. UPDATED FINDONE METHOD
   * Yeh method bhi ab transformer use karta hai.
   * Return type `Promise<any>` hai.
   */
  async findOne(id: number): Promise<any> {
    const po = await this.repo.findOne({
      where: { id },
      relations: ['supplier', 'warehouse', 'items', 'items.item'], // Saare relations load karein
    });

    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    
    // Single PO ko transform karke bhejein
    return this.transformPoForClient(po);
  }

  // --- Update and Remove Methods ---

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    // IMPORTANT: `findOne` ab transformed object deta hai. `merge` ke liye original entity chahiye.
    // Isliye hum yahan seedhe repo se entity find karenge.
    const existingPoEntity = await this.repo.findOneBy({ id });
    if (!existingPoEntity) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }

    const poToUpdate = this.repo.merge(existingPoEntity, dto);
    return this.repo.save(poToUpdate);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
  }

  // --- Other Helper Methods ---

  count(): Promise<number> {
    return this.repo.count();
  }

  async getStatusCounts(): Promise<Record<string, number>> {
    const counts = await this.repo
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(po.id)', 'count')
      .groupBy('po.status')
      .getRawMany();

    const formattedCounts: Record<string, number> = {};
    counts.forEach(item => {
      formattedCounts[item.status] = parseInt(item.count, 10);
    });

    return formattedCounts;
  }

  async getRecent(limit: number = 5): Promise<any[]> {
    const recentPOs = await this.repo.find({
      order: {
        created_at: 'DESC',
      },
      take: limit,
      relations: ['supplier', 'warehouse'],
    });
    // Inhe bhi transform karna behtar hai for UI consistency
    return recentPOs.map(po => this.transformPoForClient(po));
  }
}