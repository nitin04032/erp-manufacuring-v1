import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from '../warehouses/warehouse.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  location_code: string;

  @Column({ type: 'varchar', length: 255 })
  location_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Optional relation to Warehouse (if you have warehouses table)
  @ManyToOne(() => Warehouse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse?: Warehouse | null;

  @Column({ type: 'int', nullable: true })
  warehouse_id?: number | null;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
