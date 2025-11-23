import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { QualityCheck } from './quality-check.entity';
import { Item } from '../items/item.entity';

@Entity('quality_check_items')
export class QualityCheckItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => QualityCheck, (qc) => qc.items, { onDelete: 'CASCADE' })
  qualityCheck: QualityCheck;

  @ManyToOne(() => Item, { eager: true })
  item: Item;

  @Column()
  received_qty: number;

  @Column()
  checked_qty: number;

  @Column()
  passed_qty: number;

  @Column()
  failed_qty: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;
}
