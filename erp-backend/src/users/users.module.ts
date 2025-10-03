// erp-backend/src/users/users.module.ts (UPDATED)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Is line ko add karein
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], // Agar AuthModule isko istemal kar raha hai
})
export class UsersModule {}