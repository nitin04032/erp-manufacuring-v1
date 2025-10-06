import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
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

  // ✅ FIX: Endpoint ab ':item_id' use karta hai
  @Get(':item_id/:warehouse')
  findOne(
    @Param('item_id', ParseIntPipe) itemId: number, 
    @Param('warehouse') warehouse: string
  ) {
    return this.service.findOne(itemId, warehouse);
  }
}