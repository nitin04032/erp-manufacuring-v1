import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Item } from '../items/item.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => PurchaseOrder, (po) => po.items)
  purchaseOrder: PurchaseOrder;

  @ManyToOne(() => Item, { eager: true })
  item: Item;
  
  // ✅ ADD THIS COLUMN
  @Column({ type: 'varchar', length: 50, nullable: true })
  uom: string;

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