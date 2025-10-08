import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { GrnItem } from './grn-item.entity';

@Entity('grn')
export class Grn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  grn_number: string;

  @ManyToOne(() => PurchaseOrder, { eager: true })
  purchaseOrder: PurchaseOrder;

  /**
   * Represents all the items included in this Goods Received Note.
   * Each GRN can have multiple items.
   */
  @OneToMany(() => GrnItem, (item) => item.grn, { cascade: true, eager: true })
  items: GrnItem[];

  @Column({ type: 'date' })
  received_date: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_received_value: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}