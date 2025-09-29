import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ItemsModule } from '../items/items.module';
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module';
import { GrnModule } from '../grn/grn.module';
import { DispatchModule } from '../dispatch/dispatch.module';
// Note: AuthModule and UsersModule are likely not needed here if they are global
// or imported in the root AppModule, but it's safe to keep them if needed.
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Import the modules that export the services you need.
    SuppliersModule,
    WarehousesModule,
    ItemsModule,
    PurchaseOrdersModule,
    GrnModule,
    DispatchModule,
    AuthModule,
    UsersModule,
    // The TypeOrmModule.forFeature([...]) line has been removed.
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}