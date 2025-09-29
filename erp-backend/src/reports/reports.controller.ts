// src/reports/reports.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('purchase')
  getPurchaseReport(@Query('status') status?: string) {
    return this.reportsService.getPurchaseReport(status);
  }

  @Get('grn')
  getGrnReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getGrnReport(from, to);
  }

  @Get('dispatch')
  getDispatchReport(@Query('customer') customer?: string) {
    return this.reportsService.getDispatchReport(customer);
  }

  @Get('stock-movement')
  getStockMovementReport(@Query('item') item?: string) {
    return this.reportsService.getStockMovementReport(item);
  }
}
