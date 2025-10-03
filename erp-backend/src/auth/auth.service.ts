// erp-backend/src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity'; // User entity ko import karein

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Ek naye user ko register karta hai.
   */
  async register(payload: RegisterDto) {
    const { username, email, password, full_name, role } = payload;

    // Password ki basic validation
    if (!password || password.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Password ko hash karein
    const password_hash = await bcrypt.hash(password, 10);

    // UsersService ke 'create' function ka istemaal karein jo duplicate check bhi karta hai
    const createdUser = await this.usersService.create({
      username,
      email,
      password_hash,
      full_name,
      role: role || 'user', // Default role 'user' set karein agar nahi diya hai
    });

    // UsersService.create() se password hash pehle se hi hata hua hai
    return createdUser;
  }

  /**
   * User ke credentials ko validate karta hai.
   */
  async validateUser(
    usernameOrEmail: string,
    pass: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    // UsersService ke 'findOne' function ka istemaal karein
    const user = await this.usersService.findOne(usernameOrEmail);
    if (!user) {
      return null;
    }

    // Diye gaye password ko hash ke saath compare karein
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // Safal validation par, password hash ke bina user object return karein
    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * User ko login karke JWT token generate karta hai.
   */
  async login(userPayload: Omit<User, 'password_hash'>) {
    // JWT payload mein zaroori jaankari daalein
    const payload = {
      sub: userPayload.id,
      username: userPayload.username,
      email: userPayload.email,
      role: userPayload.role,
    };

    const token = this.jwtService.sign(payload);

    // User ka last login time update karein
    await this.usersService.updateLastLogin(userPayload.id);

    return {
      access_token: token,
      user: userPayload,
    };
  }
}