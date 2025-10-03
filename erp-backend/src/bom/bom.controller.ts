import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { BomService } from './bom.service';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // Guard को यहाँ एक बार क्लास लेवल पर लगाएं
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Post()
  create(@Body() createDto: CreateBomDto) {
    return this.bomService.create(createDto);
  }

  @Get()
  findAll() {
    return this.bomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bomService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateBomDto) {
    return this.bomService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bomService.remove(id);
  }
}