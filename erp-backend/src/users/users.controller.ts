// src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  Delete,
  Patch, // Put ki jagah Patch use kar rahe hain partial update ke liye
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto'; // 🔹 Imported UpdateUserDto

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Controller level par guard laga hai, isliye routes par bar-bar likhne ki zaroorat nahi hai
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * Sirf admin role ko saare users dekhne ka access
   */
  @Roles('admin')
  @Get()
  async findAll() {
    return this.usersService.listAll();
  }

  /**
   * GET /users/:id
   * Admin & store dono dekh sakte hain ek user
   */
  @Roles('admin', 'store')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  /**
   * PATCH /users/:id
   * Sirf admin update kar sakta hai - P0 (No any rule applied)
   */
  @Roles('admin')
  @Patch(':id') // Changed from @Put to @Patch for cleaner restful partial updates
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto // 🔹 'any' hatakar strict DTO use kiya
  ) {
    await this.usersService.updateUser(id, updateUserDto);
    return { message: 'User updated successfully' };
  }

  /**
   * DELETE /users/:id
   * Sirf admin delete (soft delete) kar sakta hai
   */
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteById(id);
    return { message: 'User deleted successfully' };
  }
}