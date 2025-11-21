import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductionOrderItem } from './production-order-item.entity';

export type ProductionOrderStatus =
  | 'draft'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

@Entity({ name: 'production_orders' })
export class ProductionOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  order_number: string;

  @Column()
  fg_item_id: number; // finished good item id

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  quantity: number;

  @Column({ nullable: true })
  warehouse_id: number;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: ProductionOrderStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @OneToMany(() => ProductionOrderItem, (item) => item.productionOrder, {
    cascade: true,
    eager: true,
  })
  items: ProductionOrderItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
