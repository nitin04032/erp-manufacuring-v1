import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductionOrderItem } from './production-order-item.entity';
import { Item } from '../items/item.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

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

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'fg_item_id' })
  fg_item: Item;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  quantity: number;

  @Column({ nullable: true })
  warehouse_id: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

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
