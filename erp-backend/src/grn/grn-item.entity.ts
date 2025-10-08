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

  @Column()
  ordered_qty: number;

  @Column()
  received_qty: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}