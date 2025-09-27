// MODULE MEIN YE CHANGES KAREIN

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { Supplier } from '../suppliers/supplier.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Supplier, 
      User, 
      // ... baaki entities jinka count chahiye
    ])
  ],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}