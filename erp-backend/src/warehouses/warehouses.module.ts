import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse])],
  providers: [WarehousesService],
  controllers: [WarehousesController],
  // Export the service so other modules (like Dashboard) can use it
  exports: [WarehousesService],
})
export class WarehousesModule {}