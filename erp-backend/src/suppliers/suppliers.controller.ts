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
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard) // ✅ Secure all routes in this controller
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // POST /suppliers
  @Post()
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  // GET /suppliers
  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  // GET /suppliers/count -> Useful for dashboard stats
  @Get('count')
  async getCount() {
    const count = await this.suppliersService.count();
    return { totalSuppliers: count };
  }

  // GET /suppliers/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.findOne(id);
  }

  // PATCH /suppliers/:id
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  // DELETE /suppliers/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suppliersService.remove(id);
  }
}