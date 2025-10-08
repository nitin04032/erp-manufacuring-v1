// erp-backend/src/purchase-orders/purchase-order-item.entity.ts (NEW FILE)

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Item } from '../items/item.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items)
  purchaseOrder: PurchaseOrder; 

  @ManyToOne(() => Item, { eager: true }) // eager loads the item details
  item: Item;

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  ordered_qty: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percent: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_percent: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;
}