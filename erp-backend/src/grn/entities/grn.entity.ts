import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Warehouse } from '../..//warehouses/warehouse.entity'; // adjust path per project
import { GrnItem } from '../grn-item.entity';

export type GRNStatus = 'pending' | 'received' | 'closed' | 'cancelled';

@Entity('grns')
export class Grn {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  @Index()
  grn_number!: string;

  @Column({ type: 'date' })
  grn_date!: string;

  @ManyToOne(() => Warehouse, { eager: true })
  warehouse!: Warehouse;

  @Column({ type: 'varchar', length: 100, nullable: true })
  supplier_ref?: string;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: GRNStatus;

  @OneToMany(() => GrnItem, (item) => item.grn, { cascade: true, eager: true })
  items!: GrnItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
