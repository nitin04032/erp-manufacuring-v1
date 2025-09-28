// erp-backend/src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { SuppliersModule } from '../suppliers/suppliers.module'; // SuppliersModule ko import karein
// import { ItemsModule } from '../items/items.module'; // Agar ItemsModule hai to use import karein
// ... baaki zaroori modules

@Module({
  imports: [
    SuppliersModule, // Taaki SuppliersService available ho
    // ItemsModule,
    // ...
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}