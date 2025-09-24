// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      const user = await this.authService.register(body);
      return { message: 'User registered', user };
    } catch (err: any) {
      const message = err?.message || 'Failed to register user';
      throw new HttpException({ error: message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      const { usernameOrEmail, password } = body;
      const res = await this.authService.login(usernameOrEmail, password);
      return res;
    } catch (err: any) {
      const message = err?.message || 'Unauthorized';
      throw new HttpException({ error: message }, HttpStatus.UNAUTHORIZED);
    }
  }
}
