import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { StocksService } from './stocks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StocksController {
  constructor(private readonly service: StocksService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('warehouse/:name')
  findByWarehouse(@Param('name') warehouse_name: string) {
    return this.service.findByWarehouse(warehouse_name);
  }

  @Get(':item_code/:warehouse')
  findOne(@Param('item_code') item_code: string, @Param('warehouse') warehouse: string) {
    return this.service.findOne(item_code, warehouse);
  }
}
