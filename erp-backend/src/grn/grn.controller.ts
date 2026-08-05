import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GrnService } from './grn.service';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user.enum';

@Controller('grn')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrnController {
  constructor(private readonly service: GrnService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Post()
  create(@Body(new ValidationPipe({ transform: true })) dto: CreateGrnDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: { status?: string; search?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateGrnDto) {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
