// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Register a new user
  async register(payload: { username:string; email:string; password:string; full_name:string; role?:string }) {
    const { username, email, password, full_name, role } = payload;

    // check exists
    if (await this.usersService.findByUsername(username)) {
      throw new Error('Username already taken');
    }
    if (await this.usersService.findByEmail(email)) {
      throw new Error('Email already registered');
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const res = await this.usersService.createUser({ username, email, password_hash, full_name, role });
    return { id: res.insertId, username, email, full_name, role: role || 'user' };
  }

  // Validate credentials
  async validateUser(usernameOrEmail: string, pass: string) {
    // allow login via username or email
    let user = await this.usersService.findByUsername(usernameOrEmail);
    if (!user) user = await this.usersService.findByEmail(usernameOrEmail);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password_hash || '');
    if (!match) return null;

    // remove password hash
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  async login(usernameOrEmail: string, password: string) {
    const user = await this.validateUser(usernameOrEmail, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // create JWT payload
    const payload = { sub: (user as any).id, username: (user as any).username, role: (user as any).role };
    const token = this.jwtService.sign(payload);
    // update last_login
    await this.usersService.updateLastLogin((user as any).id);
    return { access_token: token, user };
  }
}
