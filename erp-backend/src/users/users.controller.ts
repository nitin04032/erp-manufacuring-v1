// src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  Delete,
  Put,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ Sirf admin role ko saare users dekhne ka access
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.listAll();
  }

  // ✅ Admin & store dono dekh sakte hain ek user
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'store')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  // ✅ Sirf admin update kar sakta hai
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.usersService.updateUser(id, body);
    return { message: 'User updated successfully' };
  }

  // ✅ Sirf admin delete kar sakta hai
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteById(id);
    return { message: 'User deleted successfully' };
  }
}
