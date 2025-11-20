import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Grn } from '../../grn/entities/grn.entity';
import { QCItem } from './qc-item.entity';

@Entity('quality_checks')
export class QualityCheck {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  qc_number!: string;

  @Column({ type: 'date' })
  qc_date!: string;

  @ManyToOne(() => Grn, { eager: true })
  grn!: Grn;

  @Column()
  inspector!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  remarks?: string;

  @OneToMany(() => QCItem, (item) => item.quality_check, {
    cascade: true,
    eager: true,
  })
  items!: QCItem[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
