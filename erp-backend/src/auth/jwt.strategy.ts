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

      // 2. Expired tokens ko reject karo. true karne par expired token bhi pass ho jaate.
      ignoreExpiration: false,

      // 3. Token ko verify karne ke liye secret key.
      // Yeh key .env file se aani chahiye taaki yeh secure rahe.
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'secretKey',
    });
  }

  /**
   * Token safalta se verify hone ke baad yeh function chalta hai.
   * Iska return value NestJS dwara 'request.user' object mein daal diya jaata hai.
   * @param payload - JWT token ke andar ka decoded data.
   */
  async validate(payload: {
    sub: number;
    username: string;
    email: string;
    role: string;
  }) {
    // Hum yahan se jo object return karenge, woh hamare sabhi protected routes mein
    // @Req() req -> req.user ke roop mein available hoga.
    return {
      id: payload.sub, // 'sub' (subject) aam taur par user ID hota hai.
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}