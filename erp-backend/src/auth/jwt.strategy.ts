// erp-backend/src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * JwtStrategy JWTs ko validate karne ke liye responsible hai.
   * Yeh Bearer Token ko header se nikaalta hai aur verify karta hai.
   */
  constructor(private readonly configService: ConfigService) {
    super({
      // 1. Request ke 'Authorization' header se Bearer Token ko nikaalo.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. Expired tokens ko reject karo.
      ignoreExpiration: false,

      // 3. Token ko verify karne ke liye strict secret key check.
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET environment variable is required.');
        }
        return secret;
      })(),
    });
  }

  /**
   * Token safalta se verify hone ke baad yeh function chalta hai.
   * Iska return value NestJS dwara 'request.user' object mein daal diya jaata hai.
   */
  validate(payload: {
    sub: number;
    username: string;
    email: string;
    role: string;
  }): { id: number; username: string; email: string; role: string } {
    return {
      id: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}