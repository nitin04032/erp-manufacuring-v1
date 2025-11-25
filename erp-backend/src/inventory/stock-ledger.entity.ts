import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ name: 'stock_ledger' })
@Index(['item_id', 'warehouse_id'])
export class StockLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  qty_in: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  qty_out: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  balance: number;

  @Column({ nullable: true })
  reference_type: string;

  @Column({ nullable: true })
  reference_id: number;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
