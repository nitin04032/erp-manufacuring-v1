import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dispatch_orders')
export class DispatchOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  dispatch_number: string;

  @Column({ type: 'varchar', length: 255 })
  customer_name: string;

  @Column({ type: 'date' })
  dispatch_date: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'dispatched', 'delivered', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_value: number;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
