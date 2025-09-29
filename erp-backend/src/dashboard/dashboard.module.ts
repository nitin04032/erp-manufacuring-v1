import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ItemsModule } from '../items/items.module';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';

@Module({
  imports: [
    SuppliersModule,
    WarehousesModule,
    ItemsModule,
    AuthModule,
    UsersModule,
    PurchaseOrdersModule,

  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
