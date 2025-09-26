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
  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ select: ['id', 'email', 'username', 'role', 'full_name', 'last_login'] });
  }

  // Backwards-compatible alias used in controllers
  listAll(): Promise<User[]> {
    return this.findAll();
  }

  findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByUsername(username: string): Promise<User | null> {
    if (!username) return Promise.resolve(null);
    return this.usersRepository.findOneBy({ username });
  }

  findByEmail(email: string): Promise<User | null> {
    if (!email) return Promise.resolve(null);
    return this.usersRepository.findOneBy({ email });
  }

  async createUser(payload: {
    username?: string;
    email: string;
    password_hash: string;
    full_name?: string;
    role?: string;
  }): Promise<User> {
    const user = this.usersRepository.create({
      username: payload.username,
      email: payload.email,
      password_hash: payload.password_hash,
      full_name: payload.full_name,
      role: payload.role || 'user',
    } as any);

    const saved = await this.usersRepository.save(user as any);
    return saved as User;
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.usersRepository.update(id, { last_login: new Date() } as any);
  }

  async updateUser(id: number, body: Partial<User>): Promise<void> {
    await this.usersRepository.update(id, body as any);
  }

  async deleteById(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}