// erp-backend/src/auth/auth.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Ek naye user ko register karta hai.
   * Yeh password ko hash karta hai aur duplicate username/email check ke liye UsersService ka istemal karta hai.
   */
  async register(payload: RegisterDto): Promise<Omit<User, 'password_hash'>> {
    const { username, email, password, full_name, role } = payload;

    // 1. Password ki basic validation

    if (!password || password.trim().length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long.',
      );
    }

    // 2. Password ko hash karein

    const password_hash = await (bcrypt as any).hash(password, 10);

    // 3. UsersService ke 'create' function ka istemaal karein
    // UsersService.create ko is tarah design karna chahiye ki woh password_hash return na kare.
    const createdUser = await this.usersService.create({
      username,
      email,
      password_hash,
      full_name,
      role: role || 'user', // Default role 'user' set karein agar nahi diya hai
    });

    return createdUser;
  }

  /**
   * User ke credentials (username/email aur password) ko validate karta hai.
   * Safal hone par, password hash ke bina user object return karta hai.
   */
  async validateUser(
    usernameOrEmail: string,
    pass: string,
  ): Promise<Omit<User, 'password_hash'> | null> {
    // 1. User ko database se find karein
    const user = await this.usersService.findOne(usernameOrEmail);
    if (!user) {
      return null;
    }

    // 2. Diye gaye password ko hash ke saath compare karein
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      return null;
    }

    // 3. (Sabse Zaroori) Safal validation par, password hash ke bina user object return karein
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...result } = user;
    return result;
  }

  /**
   * User ko login karke JWT token generate karta hai.
   * Yeh last login time bhi update karta hai.
   */
  async login(userPayload: Omit<User, 'password_hash'>) {
    // 1. JWT payload taiyaar karein
    const payload = {
      sub: userPayload.id,
      username: userPayload.username,
      email: userPayload.email,
      role: userPayload.role,
    };

    // 2. JWT token asynchronously sign karein
    const token = await this.jwtService.signAsync(payload);

    // 3. User ka last login time update karein (background mein)
    // Hum iska result wait nahi karenge taaki response jaldi jaaye
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.usersService.updateLastLogin(userPayload.id);

    // 4. Token aur user data return karein
    return {
      access_token: token,
      user: userPayload,
    };
  }
}
