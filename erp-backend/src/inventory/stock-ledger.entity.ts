import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'stock_ledger' })
export class StockLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  qty_in: string;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  qty_out: string;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  balance: string;

  @Column({ length: 64 })
  reference_type: string; // e.g. 'production', 'purchase', 'adjustment'

  @Column({ type: 'int', nullable: true })
  reference_id: number | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn()
  created_at: Date;
}
