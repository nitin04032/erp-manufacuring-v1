// erp-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
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
      isGlobal: true,
      envFilePath: '.env', // Makes ConfigService available everywhere
    }),

    // Step 2: Configure TypeORM for the Supabase (PostgreSQL) connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbType = configService.get<string>('DB_TYPE') ?? 'postgres';
        
        // 🛡️ P0 - Production-Safe Condition Variable
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        // Production par schema automatic sync nahi hoga, migrations best strategy hain
        const shouldSynchronize = !isProduction; 

        // SQLite local/dev fallback
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get<string>('DB_DATABASE') ?? 'data/sqlite.db',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: shouldSynchronize, // 🛡️ Safe Option Applied
          } as TypeOrmModuleOptions;
        }

        // Postgres (Supabase) URL based configuration
        if (configService.get<string>('DATABASE_URL')) {
          return {
            type: 'postgres',
            url: configService.get<string>('DATABASE_URL'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: shouldSynchronize, // 🛡️ Safe Option Applied
            ssl: configService.get<string>('DB_SSL') === 'true' || false,
            extra:
              configService.get<string>('DB_SSL') === 'true'
                ? { ssl: { rejectUnauthorized: false } }
                : undefined,
          } as TypeOrmModuleOptions;
        }

        // Standard Postgres configuration block
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
          username: configService.get<string>('DB_USERNAME') ?? 'postgres',
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE') ?? 'postgres',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: shouldSynchronize, // 🛡️ Safe Option Applied
          ssl: configService.get<string>('DB_SSL') === 'true' || false,
          extra:
            configService.get<string>('DB_SSL') === 'true'
              ? { ssl: { rejectUnauthorized: false } }
              : undefined,
        };
      },
    }),

    // Step 3: Import all your application's feature modules
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