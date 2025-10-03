import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
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
