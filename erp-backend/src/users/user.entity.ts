// erp-backend/src/users/user.entity.ts (CORRECTED CODE)

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users') // This should match your database table name
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

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;

  @CreateDateColumn() // Automatically set the creation date
  created_at: Date;

  @UpdateDateColumn() // Automatically update the date on change
  updated_at: Date;
}
