// erp-backend/src/users/users.service.ts (UPDATED)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // Pehle aap raw query use kar rahe the
  // async findAll() {
  //   const [rows] = await db.pool.query('SELECT id, email, role FROM users');
  //   return rows;
  // }

  // Ab TypeORM use karein
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
        select: ["id", "email", "role"], // Sirf zaroori columns select karein
    });
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  // ... baaki functions (create, update, delete) bhi aise hi update karein
}