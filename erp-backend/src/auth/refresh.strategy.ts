// erp-backend/src/auth/refresh.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

// Shape signed in AuthService.refreshTokens's refreshTokenPayload
// (src/auth/auth.service.ts) — { sub, type: 'refresh' }.
interface RefreshTokenPayload {
  sub: number;
  type: string;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Request Body se token nikalega
      ignoreExpiration: false,
      secretOrKey: (() => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET variable is required.');
        return secret;
      })(),
      passReqToCallback: true, // Takki hum raw token ko validate function me use kar sakein
    });
  }

  validate(req: Request, payload: RefreshTokenPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    // By the time this runs, passport-jwt's Strategy has already extracted
    // this exact field (jwtFromRequest: ExtractJwt.fromBodyField above) and
    // verified it as a well-formed, signed JWT — it's a string by
    // construction, not arbitrary client input. Express types req.body as
    // `any`; this cast reflects that runtime guarantee rather than
    // asserting past a real unknown.
    const refreshToken = (req.body as { refreshToken: string }).refreshToken;
    return { id: payload.sub, refreshToken };
  }
}
