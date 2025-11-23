import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Grn } from '../grn/entities/grn.entity';
import { QualityCheckItem } from './quality-check-item.entity';

@Entity('quality_checks')
export class QualityCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  qc_number: string;

  @Column({ type: 'date' })
  qc_date: Date;

  @ManyToOne(() => Grn, { eager: true })
  grn: Grn;

  @Column()
  inspector: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => QualityCheckItem, (item) => item.qualityCheck, {
    cascade: true,
    eager: true,
  })
  items: QualityCheckItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
