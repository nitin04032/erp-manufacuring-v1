import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // Import karein

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) { // Inject karein
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
  // Hardcoded secret ko .env variable se replace karein
  secretOrKey: configService.get<string>('JWT_SECRET') ?? 'default_secret',
    });
  }

  async validate(payload: any) {
    // ab payload mein wohi info hogi jo aapne login ke time di thi
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}