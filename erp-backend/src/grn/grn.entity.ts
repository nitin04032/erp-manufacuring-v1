import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';

@Entity('grn')
export class Grn {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  grn_number: string;

  @ManyToOne(() => PurchaseOrder, { eager: true })
  purchaseOrder: PurchaseOrder;

  @Column({ type: 'date' })
  received_date: Date;

  @Column({ type: 'enum', enum: ['draft', 'verified', 'rejected'], default: 'draft' })
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
