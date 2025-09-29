import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
// import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    SuppliersModule,
    WarehousesModule,
    // ItemsModule
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
