// erp-backend/src/users/user.entity.ts (NEW FILE)
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users') // Database table ka naam
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ nullable: true })
  full_name: string;

  @Column()
  password_hash: string;

  @Column({ default: 'user' }) // Default role
  role: string;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;
}