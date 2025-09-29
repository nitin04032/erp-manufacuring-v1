// erp-backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DashboardModule } from './dashboard/dashboard.module'; // Naye module ko import karein
import { ItemsModule } from './items/items.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { GrnModule } from './grn/grn.module';
import { DispatchModule } from './dispatch/dispatch.module';

@Module({
  imports: [
    // Step 1: Configure ConfigModule to be global
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),

    // Step 2: Configure TypeORM for the database connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule to use its service
      inject: [ConfigService],  // Inject ConfigService into the factory
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: parseInt(configService.get<string>('DB_PORT') ?? '3306', 10),
        username: configService.get<string>('DB_USERNAME') ?? 'root',
        password: configService.get<string>('DB_PASSWORD') ?? '',
        database: configService.get<string>('DB_DATABASE') ?? 'erp',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // IMPORTANT: Set to false in production!
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}