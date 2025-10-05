import { Warehouse } from '../warehouses/warehouse.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  location_code: string;

  @Column()
  location_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['area', 'rack', 'bin', 'floor', 'cold_storage', 'quarantine'], default: 'rack' })
  location_type: string;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  capacity: number;

  @Column({ default: false })
  is_default: boolean;

  @Column({ default: true })
  is_active: boolean;

  // Relation to Warehouse
  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Self-referencing for Parent-Child relationship
  @ManyToOne(() => Location, location => location.childLocations, { nullable: true })
  @JoinColumn({ name: 'parent_location_id' })
  // ✅ FIX: Yahan '| null' add kiya gaya hai taaki yeh null ho sake
  parentLocation: Location | null;

  @OneToMany(() => Location, location => location.parentLocation)
  childLocations: Location[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}