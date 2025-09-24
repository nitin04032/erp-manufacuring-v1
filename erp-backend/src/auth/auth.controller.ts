// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

class RegisterDto {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: string;
}

class LoginDto {
  usernameOrEmail: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      const user = await this.authService.register(body);
      return { message: 'User registered', user };
    } catch (err) {
      throw new HttpException({ error: err.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      const { usernameOrEmail, password } = body;
      const res = await this.authService.login(usernameOrEmail, password);
      return res;
    } catch (err) {
      throw new HttpException({ error: err.message || 'Unauthorized' }, HttpStatus.UNAUTHORIZED);
    }
  }
}
