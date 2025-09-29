import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  po_number: string;

  @ManyToOne(() => Supplier, { eager: true })
  supplier: Supplier;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_date?: Date;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'ordered', 'received', 'cancelled'], default: 'pending' })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
