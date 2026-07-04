// erp-backend/src/users/users.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Ek naya user banata hai.
   */
  async create(
    payload: Omit<User, 'id' | 'last_login' | 'created_at' | 'updated_at'>,
  ): Promise<Omit<User, 'password_hash'>> {
    const existing = await this.usersRepository.findOne({
      where: [{ email: payload.email }, { username: payload.username }],
    });

    if (existing) {
      throw new ConflictException('Username or email already exists');
    }

    const newUser = this.usersRepository.create(payload);
    const savedUser = await this.usersRepository.save(newUser);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = savedUser;
    return result;
  }

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Sabhi users ki list deta hai (password hash ke bina).
   */
  async listAll(): Promise<Omit<User, 'password_hash'>[]> {
    return this.usersRepository.find({
      select: [
        'id',
        'email',
        'username',
        'full_name',
        'role',
        'last_login',
        'created_at',
        'updated_at',
      ],
    });
  }

  /**
   * User ka last login time update karta hai.
   */
  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() });
  }

  /**
   * User ko update karta hai (Dynamic DTO / Partial support ke sath).
   */
  async updateUser(id: number, updates: Partial<User>): Promise<any> {
    // Security check: Password update karne se rokein is function se
    delete (updates as any).password_hash;
    return this.usersRepository.update(id, updates);
  }

  /**
   * User ko delete karta hai (Hard delete ki jagah Soft Delete).
   * Table se row completely udegi nahi, sirf deleted_at flag set hoga.
   */
  async deleteById(id: number): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * 🔹 Refresh Token ko encrypt karke DB me save karta hai (ya null karta hai logout par)
   */
  async updateRefreshToken(userId: number, refreshToken: string | null) {
    let hash = null;
    if (refreshToken) {
      hash = await bcrypt.hash(refreshToken, 10);
    }
    // Make sure aapki User entity me 'refresh_token_hash' column ho
    await this.usersRepository.update(userId, { refresh_token_hash: hash } as any);
  }

  /**
   * 🔹 P0 - Refresh Token Match/Validate Logic
   * Database ke hash se incoming clear token compare karta hai.
   */
  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    // User ya unka refresh_token_hash check karein (Type casting used in case entity structure differs slightly)
    if (!user || !(user as any).refresh_token_hash) {
      return false;
    }
    return bcrypt.compare(refreshToken, (user as any).refresh_token_hash);
  }
}