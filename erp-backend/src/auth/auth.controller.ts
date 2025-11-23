// erp-backend/src/auth/auth.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';

// '/auth' route par saare requests yahan aayenge
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Naye user ko register karne ke liye endpoint.
   */
  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<{ message: string; user: Omit<User, 'password_hash'> }> {
    try {
      // AuthService ko register karne ke liye kehte hain.
      // Service layer mein hi password hash ho jaayega.
      const user = await this.authService.register(registerDto);

      // Safal registration par ek saaf message aur user data (bina password) bhejte hain.
      return {
        message: 'User registered successfully',
        user,
      };
    } catch (error: any) {
      // Agar 'users.service' se 'ConflictException' (409) aati hai (duplicate email/username)
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }

      // Agar class-validator se koi validation error aata hai
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.response?.message) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const messages = Array.isArray(error.response.message)
          ? error.response.message.join(', ') // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          : error.response.message; // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        throw new HttpException(messages, HttpStatus.BAD_REQUEST);
      }

      // Baaki sabhi errors ke liye ek general error bhejte hain.
      throw new HttpException(
        'Could not register user.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * POST /auth/login
   * User ko login karke JWT token generate karne ke liye endpoint.
   */
  @Post('login')
  // Safal login par hamesha '200 OK' status code bhejenge.
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // 1. Pehle user ke credentials ko validate karte hain.
    const user = await this.authService.validateUser(
      loginDto.usernameOrEmail,
      loginDto.password,
    );

    // 2. Agar validateUser 'null' return karta hai, matlab credentials galat hain.
    if (!user) {
      // Standard 'UnauthorizedException' (401) throw karte hain.
      throw new UnauthorizedException('Invalid credentials. Please try again.');
    }

    // 3. Agar user valid hai, toh authService.login se token aur user data generate karke bhejte hain.
    return this.authService.login(user);
  }
}
