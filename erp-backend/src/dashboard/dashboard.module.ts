import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ItemsModule } from '../items/items.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { GrnModule } from '../grn/grn.module';
import { DispatchModule } from '../dispatch/dispatch.module';
import { FgrModule } from '../fgr/fgr.module'; // 👈 1. Import FgrModule
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SuppliersModule,
    WarehousesModule,
    ItemsModule,
    PurchaseOrdersModule,
    GrnModule,
    DispatchModule,
    FgrModule, // 👈 2. Add FgrModule to the imports array
    AuthModule,
    UsersModule,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}