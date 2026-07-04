// src/rbac/roles/entities/role.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';

import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../../users/entities/user.entity'; // 🛠️ Sahi Path Fix!

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ nullable: true, length: 255 })
  description?: string;

  @Column({ default: false })
  is_system: boolean;

  @OneToMany(() => User, (user) => user.roleRelation) // 🛠️ mapped to roleRelation
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: false })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}