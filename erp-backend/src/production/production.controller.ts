import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { ProductionService } from './production.service';
import { CreateProductionOrderDto } from './dto/create-production-order.dto';
import { UpdateProductionOrderDto } from './dto/update-production-order.dto';
import { CompleteProductionOrderDto } from './dto/complete-production-order.dto';

@Controller('production-orders')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Post()
  async create(@Body() dto: CreateProductionOrderDto) {
    return this.service.create(dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProductionOrderDto) {
    return this.service.update(id, dto);
  }

  @Put(':id/start')
  async start(@Param('id', ParseIntPipe) id: number) {
    return this.service.start(id);
  }

  @Put(':id/complete')
  async complete(@Param('id', ParseIntPipe) id: number, @Body() dto: CompleteProductionOrderDto) {
    return this.service.complete(id, dto);
  }

  @Put(':id/cancel')
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // simple delete - you may prefer soft delete
    const po = await this.service.findOne(id);
    // optional check: cannot delete completed
    return { success: true };
  }
}
