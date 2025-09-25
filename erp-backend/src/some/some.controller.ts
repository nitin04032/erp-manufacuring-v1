// src/some/some.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('protected')
export class SomeController {
  // ✅ Sirf admin aur store ko access milega
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store')
  @Get('me')
  getProfile(@Req() req) {
    return { user: req.user };
  }
}
// src/some/some.controller.ts