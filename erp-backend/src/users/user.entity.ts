// src/users/user.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  DeleteDateColumn 
} from 'typeorm';
import { UserRole, UserStatus } from './enums/user.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ nullable: true })
  full_name: string;

  // P1 - Role Enum Implementation
  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;

  // P1 - User Status Integration
  @Column({ type: 'varchar', default: UserStatus.ACTIVE })
  status: UserStatus;

  // P0 - Refresh Token Hash with safe length 255
  @Column({ type: 'varchar', length: 255, nullable: true })
  refresh_token_hash: string | null;

  @Column({ nullable: true })
  last_login: Date;

  // P2 - Audit Fields for Enterprise ERP
  @Column({ nullable: true })
  created_by: number;

  @Column({ nullable: true })
  updated_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // P1 - Soft Delete Column
  @DeleteDateColumn()
  deleted_at: Date;
}