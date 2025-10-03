import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export type StockMovementType = 'IN' | 'OUT';

@Entity('stock_ledger')
export class StockLedger {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @Column({ nullable: true })
  warehouse_id?: number;

  @Column({ type: 'varchar', length: 10 })
  movement_type: StockMovementType;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0 })
  qty: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  reference?: string; // e.g., 'PO-123', 'GRN-456', 'PROD-789', 'DISP-111'

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @CreateDateColumn()
  created_at: Date;
}
