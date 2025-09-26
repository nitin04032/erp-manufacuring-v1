// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 🔹 Register a new user
  async register(payload: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }) {
    const { username, email, password, full_name, role } = payload;

    // ✅ Basic validation
    if (!password || password.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    if (await this.usersService.findByUsername(username)) {
      throw new BadRequestException('Username already taken');
    }

    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already registered');
    }

    // ✅ Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ Save user
    const res = await this.usersService.createUser({
      username,
      email,
      password_hash,
      full_name,
      role,
    });

    // ✅ Return safe user object
    return {
      id: (res as any).id,
      username,
      email,
      full_name,
      role: role || 'user',
    };
  }

  // 🔹 Validate credentials (for login)
  async validateUser(usernameOrEmail: string, pass: string) {
    let user = await this.usersService.findByUsername(usernameOrEmail);
    if (!user) user = await this.usersService.findByEmail(usernameOrEmail);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password_hash || '');
    if (!match) return null;

    // Remove password_hash before returning
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  // 🔹 Login
  async login(usernameOrEmail: string, password: string) {
    const user = await this.validateUser(usernameOrEmail, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: (user as any).id,
      username: (user as any).username,
      role: (user as any).role,
    };

    const token = this.jwtService.sign(payload);

    // ✅ Track last login
    await this.usersService.updateLastLogin((user as any).id);

    return { access_token: token, user };
  }
}
