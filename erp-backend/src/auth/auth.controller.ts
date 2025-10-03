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
      // class-validator errors might be arrays; make a readable message
      const message = err?.response?.message || err?.message || 'Failed to register user';
      throw new HttpException({ error: Array.isArray(message) ? message.join(', ') : message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    try {
      // Validate credentials and get the user object
      const user = await this.authService.validateUser(body.usernameOrEmail, body.password);
      if (!user) {
        throw new HttpException({ error: 'Invalid credentials' }, HttpStatus.UNAUTHORIZED);
      }
      // Pass the user object (without password_hash) to login
      const res = await this.authService.login(user);
      return res;
    } catch (err: any) {
      const message = err?.message || 'Unauthorized';
      throw new HttpException({ error: message }, HttpStatus.UNAUTHORIZED);
    }
  }
}
