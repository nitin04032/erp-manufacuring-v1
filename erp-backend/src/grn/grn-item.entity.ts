import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Grn } from './grn.entity';
import { Item } from '../items/item.entity';

@Entity('grn_items')
export class GrnItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Grn, (grn) => grn.items, { onDelete: 'CASCADE' })
  grn: Grn;

  @ManyToOne(() => Item, { eager: true })
  item: Item;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  ordered_qty: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  received_qty: number;

  // ✅ ADD THIS: Store the unit price at the time of receiving
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unit_price: number;

  // ✅ ADD THIS: Store the calculated total value for this line item
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_value: number;
}