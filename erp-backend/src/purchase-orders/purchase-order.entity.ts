// erp-backend/src/purchase-orders/purchase-order.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';
import { Warehouse } from '../warehouses/warehouse.entity'; // 👈 1. Import Warehouse
import { PurchaseOrderItem } from './purchase-order-item.entity';

@Entity('purchase_orders')
export class PurchaseOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  po_number: string;

  @ManyToOne(() => Supplier, { eager: true, onDelete: 'RESTRICT' })
  supplier: Supplier;

  // ✅ 2. ADDED THE NEW RELATIONSHIP TO WAREHOUSE
  @ManyToOne(() => Warehouse, { eager: true, onDelete: 'RESTRICT' })
  warehouse: Warehouse;

  @Column({ type: 'date' })
  order_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_date?: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'acknowledged', 'partial', 'completed', 'cancelled'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_amount: number;

  @OneToMany(() => PurchaseOrderItem, (item) => item.purchaseOrder, {
    cascade: true, // Important for automatically saving/updating items with the PO
    eager: true, // Load items automatically when fetching a PO
  })
  items: PurchaseOrderItem[];
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}