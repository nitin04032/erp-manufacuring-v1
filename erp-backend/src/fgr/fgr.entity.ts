import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('finished_goods_receipts')
export class FinishedGoodsReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  receipt_number: string;

  @Column({ type: 'varchar', length: 255 })
  production_order_no: string;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 50 })
  uom: string;

  @Column({ type: 'varchar', length: 255 })
  warehouse_name: string;

  @Column({ type: 'date' })
  receipt_date: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'confirmed'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
