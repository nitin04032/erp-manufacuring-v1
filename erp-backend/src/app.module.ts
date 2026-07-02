// erp-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DashboardModule } from './dashboard/dashboard.module'; 
import { ItemsModule } from './items/items.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GrnModule } from './grn/grn.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { FgrModule } from './fgr/fgr.module';
import { BomModule } from './bom/bom.module';
import { ProductionModule } from './production/production.module';
import { StocksModule } from './stocks/stocks.module';
import { InventoryModule } from './inventory/inventory.module';
import { LocationsModule } from './locations/locations.module';
import { QualityCheckModule } from './quality-checks/quality-check.module';

@Module({
  imports: [
    // Step 1: Configure ConfigModule to be global
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),

    // Step 2: Configure TypeORM for the Supabase (PostgreSQL) connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // <--- Yahan 'mysql' se badalkar 'postgres' kar diya
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10), // <--- Default port 5432 kar diya
        username: configService.get<string>('DB_USERNAME') ?? 'postgres',
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE') ?? 'postgres',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // Pehli baar connect karte waqt ise true kar dete hain taaki Supabase me saare tables automatic ban jayein
        synchronize: true, 
      }),
    }),

    // Step 3: Import all your application's feature module
    AuthModule,
    UsersModule,
    SuppliersModule,
    DashboardModule,
    ItemsModule,
    WarehousesModule,
    PurchaseOrdersModule,
    GrnModule,
    DispatchModule,
    FgrModule,
    BomModule,
    ProductionModule,
    StocksModule,
    InventoryModule,
    LocationsModule,
    QualityCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}