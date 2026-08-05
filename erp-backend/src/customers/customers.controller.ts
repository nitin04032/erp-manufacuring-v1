import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, QueryCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user.enum';

// Mirrors erp-backend/src/suppliers/suppliers.controller.ts
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Post()
  create(@Body() dto: CreateCustomerDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query(new ValidationPipe({ transform: true })) query: QueryCustomerDto,
  ) {
    return this.service.findAll(query);
  }

  @Get('count')
  count() {
    return this.service.count();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.service.update(id, dto);
  }

  @Roles(UserRole.SUPERADMIN, UserRole.COMPANY_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
