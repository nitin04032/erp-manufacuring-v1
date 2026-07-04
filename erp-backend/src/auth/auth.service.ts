// erp-backend/src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/user.entity';
import { UserRole, UserStatus } from '../users/enums/user.enum';

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
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      created_by: null,
      updated_by: null,
      refresh_token_hash: null,
      deleted_at: null,
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

  // 🔹 Generate Access + Refresh Token
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

  // 🔹 Optimized Refresh Logic using UsersService validation flow
  async refreshTokens(userId: number, refreshToken: string) {
    // P0 - Strictly using validateRefreshToken from UsersService
    const isTokenValid = await this.usersService.validateRefreshToken(userId, refreshToken);
    if (!isTokenValid) {
      throw new UnauthorizedException('Access Denied - Invalid Refresh Token');
    }

    // Gaining user data safely through current UsersService method (findById)
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
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

  // 🔹 Enterprise Logout
  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}