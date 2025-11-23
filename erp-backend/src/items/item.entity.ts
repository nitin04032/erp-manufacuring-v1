// erp-backend/src/items/item.entity.ts (Corrected Code with purchase_rate)

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id!: number;

  // SKU: Unique index ठीक है।
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  sku!: string | null;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  name!: string;

  // --- यह नई लाइन जोड़ें (Add this new line) ---
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  purchase_rate!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit?: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  reorder_level?: number;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}