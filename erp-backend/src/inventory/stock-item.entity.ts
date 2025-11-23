import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({ name: 'stock_items' })
@Unique(['item_id', 'warehouse_id'])
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_id: number;

  @Column()
  warehouse_id: number;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  quantity: string; // store as string to avoid JS float rounding

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
