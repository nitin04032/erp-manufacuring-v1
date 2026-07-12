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
   * User ko ID, username, ya email se dhoondhta hai sath me unka roleRelation aur permissions load karta hai.
   * Yeh function authentication ke liye zaroori hai.
   */
  async findOne(identifier: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
      relations: ['roleRelation', 'roleRelation.permissions'], // 🚀 RBAC: Auth ke time roles aur unki permissions details sath aayengi
    });
    return user ?? undefined;
  }

  /**
   * User ko ID se dhoondhta hai (password hash ke bina).
   */
  async findById(id: number): Promise<Omit<User, 'password_hash'>> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['roleRelation'], // 🚀 RBAC: User profile fetch karte waqt dynamic role metadata dikhega
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Sabhi users ki list deta hai jisme dynamic role table bhi loaded hogi.
   */
  async listAll(): Promise<Omit<User, 'password_hash'>[]> {
    return this.usersRepository.find({
      relations: ['roleRelation'], // 🚀 RBAC: ERP list me har bande ka actual mapped Role database se uth kar dikhega
      select: {
        id: true,
        email: true,
        username: true,
        full_name: true,
        role: true, // Temporary string role tracking keep active
        status: true,
        last_login: true,
        created_at: true,
        updated_at: true,
      }
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
   */
  async deleteById(id: number): Promise<void> {
    const result = await this.usersRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  /**
   * 🔹 Refresh Token ko encrypt karke DB me save karta hai.
   * Code Hardening: Type casting (as any) ko clean kiya kyuki structure updated hai.
   */
  async updateRefreshToken(userId: number, refreshToken: string | null) {
    let hash = null;
    if (refreshToken) {
      hash = await bcrypt.hash(refreshToken, 10);
    }
    await this.usersRepository.update(userId, { refresh_token_hash: hash });
  }

  /**
   * 🔹 P0 - Refresh Token Match/Validate Logic
   * Code Hardening: Strict Type Safety implementations.
   */
  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token_hash) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refresh_token_hash);
  }
}