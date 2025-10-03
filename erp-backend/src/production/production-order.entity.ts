import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// Use a type-only import to avoid circular/runtime resolution issues

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

  @OneToMany(
    // require at runtime to avoid circular import problems during type checking
    () => require('./production-order-item.entity').ProductionOrderItem,
  (item: any) => item.productionOrder,
    {
      cascade: true,
      eager: true,
    },
  )
  items: any[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
