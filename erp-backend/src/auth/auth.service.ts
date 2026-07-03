// erp-backend/src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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

  async register(payload: RegisterDto): Promise<Omit<User, 'password_hash'>> {
    const { username, email, password, full_name } = payload;
    if (!password || password.trim().length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }
    const password_hash = await (bcrypt as any).hash(password, 10);

    const createdUser = await this.usersService.create({
      username,
      email,
      password_hash,
      full_name,
      role: 'USER',
      refresh_token_hash: null,
    });
    return createdUser;
  }

  async validateUser(usernameOrEmail: string, pass: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.usersService.findOne(usernameOrEmail);
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) return null;

    const { password_hash, ...result } = user;
    return result;
  }

  // 🔹 Commit 2 & 3: Generate Access + Refresh Token
  async login(userPayload: Omit<User, 'password_hash'>) {
    const accessTokenPayload = {
      sub: userPayload.id,
      username: userPayload.username,
      email: userPayload.email,
      role: userPayload.role,
      type: 'access',
    };

    const refreshTokenPayload = {
      sub: userPayload.id,
      type: 'refresh',
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: '15m' });
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, { expiresIn: '7d' });

    // Save refresh token hash into DB
    await this.usersService.updateRefreshToken(userPayload.id, refreshToken);

    this.usersService.updateLastLogin(userPayload.id);

    return {
      accessToken,
      refreshToken,
      user: userPayload,
    };
  }

  // 🔹 Commit 4: Handle Refresh Logic
  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId); // use findById from UsersService
    if (!user || !user.refresh_token_hash) {
      throw new UnauthorizedException('Access Denied');
    }

    const isTokenMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);
    if (!isTokenMatch) {
      throw new UnauthorizedException('Access Denied');
    }

    const accessTokenPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      type: 'access',
    };

    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, { expiresIn: '15m' });
    return { accessToken: newAccessToken };
  }

  // 🔹 Commit 6: Enterprise Logout
  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}