import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  item_name: string;

  @Column()
  item_code: string;

  @Column({ type: 'varchar', length: 255 })
  warehouse_name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  uom: string;

  @UpdateDateColumn()
  updated_at: Date;
}
