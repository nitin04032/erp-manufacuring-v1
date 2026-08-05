import { Controller, Get, UseGuards } from '@nestjs/common';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// 🛡️ Phase 1 hardening: this returns per-module record counts (suppliers, users,
// warehouses, items), not just a bare health check — it must not be publicly reachable.
@Controller('system')
@UseGuards(JwtAuthGuard)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // ✅ GET /system
  @Get()
  async getRootStatus() {
    return this.systemService.getStatus();
  }

  // ✅ GET /system/status (extra route bhi available rahega)
  @Get('status')
  async getStatus() {
    return this.systemService.getStatus();
  }
}
