import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Improvement: Added supplier_code
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  supplier_code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_person: string;
  
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  // ✅ Improvement: Added gst_number
  @Column({ type: 'varchar', length: 50, nullable: true })
  gst_number: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // ✅ Improvement: Added detailed address fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pincode: string;
  
  // ✅ Improvement: Added status field (as a boolean for efficiency)
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}