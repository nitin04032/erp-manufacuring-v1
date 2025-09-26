import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  // Find user by username (returns full User including password_hash)
  async findByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const user = await this.usersRepository.findOne({ where: { username } });
    return user ?? undefined;
  }
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(payload: { username: string; email: string; full_name: string; role?: string; password_hash: string }): Promise<Omit<User, 'password_hash'>> {
    const existingUser = await this.usersRepository.findOne({ where: { email: payload.email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = this.usersRepository.create(payload as any);
    const savedUser = await this.usersRepository.save(newUser);

    // Remove password_hash from response
    const { password_hash, ...result } = savedUser as any;
    return result;
  }

  // Backwards-compatible alias used by some callers
  async createUser(payload: { username: string; email: string; full_name: string; role?: string; password_hash: string }) {
    const user = await this.create(payload);
    // Return the created user object (without password_hash)
    return user;
  }

  // Yeh function sirf auth ke liye istemal hota hai, isliye ismein password_hash return karna aacha hai.
  async findOne(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async updateLastLogin(id: number): Promise<void> {
    if (!id) return;
    await this.usersRepository.update(id, { last_login: new Date() });
  }
}