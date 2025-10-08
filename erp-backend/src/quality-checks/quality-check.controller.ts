import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { QualityCheckService } from './quality-check.service';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { UpdateQualityCheckDto } from './dto/update-quality-check.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('quality-checks')
export class QualityCheckController {
  constructor(private readonly qcService: QualityCheckService) {}

  @Post()
  create(@Body() createQualityCheckDto: CreateQualityCheckDto) {
    return this.qcService.create(createQualityCheckDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.qcService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.qcService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQualityCheckDto: UpdateQualityCheckDto,
  ) {
    return this.qcService.update(id, updateQualityCheckDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.qcService.remove(id);
  }
}