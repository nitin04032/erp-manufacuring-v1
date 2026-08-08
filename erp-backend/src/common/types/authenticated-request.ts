import { Request } from 'express';
import { UserRole } from '../../users/enums/user.enum';

/**
 * Shape JwtStrategy.validate() (src/auth/jwt.strategy.ts) actually returns
 * and attaches to `req.user` on every authenticated request. Used to type
 * `@Req() req` in controllers/guards that need `req.user` beyond what the
 * `@CompanyId()`/`@Roles()` decorators already extract for them, instead of
 * `@Req() req: any` (which turns off type-checking on every `req.user.*`
 * access — flagged by @typescript-eslint/no-unsafe-member-access).
 */
export interface RequestUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  roleId: number | null;
  companyId: number;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}
