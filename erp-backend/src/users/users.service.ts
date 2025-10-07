// erp-backend/src/users/users.service.ts (UPDATED CODE)

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Ek naya user banata hai.
   */
  // ✅ THE FIX IS IN THE LINE BELOW
  async create(payload: Omit<User, 'id' | 'last_login' | 'created_at' | 'updated_at'>): Promise<Omit<User, 'password_hash'>> {
    const existing = await this.usersRepository.findOne({
      where: [{ email: payload.email }, { username: payload.username }],
    });

    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const newUser = this.usersRepository.create(payload);
    const savedUser = await this.usersRepository.save(newUser);

    const { password_hash, ...result } = savedUser;
    return result;
  }

  // ... (rest of the file remains the same)
  /**
   * User ko ID, username, ya email se dhoondhta hai.
   * Yeh function password hash ke saath pura user object return karta hai (authentication ke liye zaroori).
   */
  async findOne(identifier: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });
    return user ?? undefined;
  }
  
  /**
   * User ko ID se dhoondhta hai (password hash ke bina).
   * Yeh public requests ke liye safe hai.
   */
  async findById(id: number): Promise<Omit<User, 'password_hash'>> {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
      }
      const { password_hash, ...safeUser } = user;
      return safeUser;
  }

  /**
   * Sabhi users ki list deta hai (password hash ke bina).
   */
  async listAll(): Promise<Omit<User, 'password_hash'>[]> {
    return this.usersRepository.find({
      // Select all columns from the User entity except 'password_hash'
        select: ['id', 'email', 'username', 'full_name', 'role', 'last_login', 'created_at', 'updated_at'],
    });
  }

  /**
   * User ka last login time update karta hai.
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  /**
   * User ko update karta hai.
   */
  async updateUser(id: number, updates: Partial<User>): Promise<void> {
    // Password update karne se rokein is function se
    delete updates.password_hash;
    await this.usersRepository.update(id, updates);
  }

  /**
   * User ko delete karta hai.
   */
  async deleteById(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}