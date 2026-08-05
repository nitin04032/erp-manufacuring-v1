import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

// Mirrors erp-backend/src/suppliers/supplier.entity.ts (same conventions:
// soft delete, auto-generated code, active flag) with customer-specific
// fields (billing/shipping address split, credit terms) added on top.
@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  customer_code!: string | null;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  contact_person!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number?: string;

  @Column({ type: 'text', nullable: true })
  billing_address?: string;

  @Column({ type: 'text', nullable: true })
  shipping_address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode?: string;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  credit_limit!: number;

  // Free-form for now (e.g. "Net 30", "Due on Receipt") — matches how status
  // strings are handled elsewhere in this codebase rather than a fixed enum.
  @Column({ type: 'varchar', length: 50, default: 'Due on Receipt' })
  payment_terms!: string;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
