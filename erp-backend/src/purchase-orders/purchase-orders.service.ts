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

  // यह फंक्शन डेटा को फ्रंटएंड के लिए ट्रांसफॉर्म करता है
  private transformPoForClient(po: PurchaseOrder): any {
    return {
      id: po.id,
      po_number: po.po_number,
      order_date: po.order_date,
      expected_date: po.expected_date,
      status: po.status,
      total_amount: po.total_amount,
      supplier_name: po.supplier?.name || 'N/A',
      warehouse_name: po.warehouse?.name || 'N/A',
      supplier_id: po.supplier?.id,
      warehouse_id: po.warehouse?.id,
      terms_and_conditions: po.terms_and_conditions,
      remarks: po.remarks,
      items: po.items?.map(item => ({
        id: item.id,
        item_id: item.item?.id,
        item_name: item.item?.item_name || 'N/A',
        item_code: item.item?.item_code || 'N/A',
        ordered_qty: item.ordered_qty,
        unit_price: item.unit_price,
        uom: item.uom,
        discount_percent: item.discount_percent,
        tax_percent: item.tax_percent,
        total_amount: item.total_amount,
      })),
    };
  }

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
      poItem.uom = itemDto.uom ?? '';
      
      // ✅ डिस्काउंट और टैक्स प्रतिशत को सेव करें (अगर नहीं है तो 0)
      poItem.discount_percent = itemDto.discount_percent || 0;
      poItem.tax_percent = itemDto.tax_percent || 0;

      // ✅ हर आइटम का टोटल अमाउंट सही से कैलकुलेट करें
      const lineAmount = itemDto.ordered_qty * itemDto.unit_price;
      const discountAmount = (lineAmount * poItem.discount_percent) / 100;
      const taxableAmount = lineAmount - discountAmount;
      const taxAmount = (taxableAmount * poItem.tax_percent) / 100;
      
      poItem.total_amount = taxableAmount + taxAmount;
      poItems.push(poItem);
      
      // ✅ ग्रैंड टोटल में इस आइटम का टोटल अमाउंट जोड़ें
      calculatedTotalAmount += poItem.total_amount;
    }

    po.po_number = dto.po_number;
    po.supplier = supplier;
    po.warehouse = warehouse;
    po.order_date = new Date(dto.order_date);
    po.expected_date = dto.expected_date ? new Date(dto.expected_date) : undefined;
    po.status = dto.status || 'draft';
    po.terms_and_conditions = dto.terms_and_conditions;
    po.remarks = dto.remarks;
    po.total_amount = calculatedTotalAmount;
    po.items = poItems;

    return this.repo.save(po);
  }

  async findAll(query: { status?: string; supplier?: string }): Promise<any[]> {
    const options: FindManyOptions<PurchaseOrder> = {
      order: { order_date: 'DESC' },
      relations: ['supplier', 'warehouse', 'items', 'items.item'],
      where: {},
    };
    if (query.status) {
      options.where = { ...options.where, status: query.status };
    }
    if (query.supplier) {
      options.where = { ...options.where, supplier: { id: parseInt(query.supplier, 10) } };
    }
    const purchaseOrders = await this.repo.find(options);
    return purchaseOrders.map(po => this.transformPoForClient(po));
  }

  async findOne(id: number): Promise<any> {
    const po = await this.repo.findOne({
      where: { id },
      relations: ['supplier', 'warehouse', 'items', 'items.item'],
    });
    if (!po) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return this.transformPoForClient(po);
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const poToUpdate = await this.repo.preload({ id, ...dto });
    if (!poToUpdate) {
        throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
    return this.repo.save(poToUpdate);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
  }
}