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
import { QualityCheckService } from './qc.service';
import { CreateQualityCheckDto } from './dto/create-qc.dto';
import { UpdateQualityCheckDto } from './dto/update-qc.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user.enum';

@Controller('quality-checks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QualityCheckController {
  constructor(private readonly service: QualityCheckService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Post()
  create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateQualityCheckDto,
  ) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: { status?: string; grn_id?: string }) {
    return this.service.findAll({
      status: query.status,
      grn_id: query.grn_id ? Number(query.grn_id) : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQualityCheckDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
