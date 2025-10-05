import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn, // ✅ UPDATE: Ise import karein
  OneToMany,      // ✅ UPDATE: Ise import karein
} from 'typeorm';

// ✅ UPDATE: Yeh ek example import hai. Aapko apne project ke aadhar par
//           sahi entity (jaise PurchaseOrderItem, ProductionOrderItem, etc.) import karni hogi.
import { SalesOrderItem } from '../sales/sales-order-item.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  item_code: string;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, default: 'raw_material' })
  item_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'varchar', length: 20, default: 'pcs' })
  unit: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  hsn_code?: string;
  
  @Column({ name: 'standard_rate', type: 'decimal', precision: 18, scale: 2, default: 0 })
  sale_rate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  gst_rate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  purchase_rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  minimum_stock: number;
  
  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  maximum_stock: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  reorder_level: number;
  
  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  
  // ✅ UPDATE: Soft delete ke liye yeh column add karein
  @DeleteDateColumn()
  deleted_at?: Date;

  // ✅ UPDATE: Item ka dusre modules se connection.
  // Aapko har uss entity ke liye aisi @OneToMany relationship banani hogi jahan item use hota hai.
  @OneToMany(() => SalesOrderItem, (orderItem) => orderItem.item)
  salesOrderItems: SalesOrderItem[];
}