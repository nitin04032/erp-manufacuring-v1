import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stock } from './stock.entity';
import { StocksController } from './stocks.controller';
import { StocksService } from './stocks.service';
import { ItemsModule } from '../items/items.module'; // ✅ IMPROVEMENT: ItemsModule ko import karein

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock]),
    ItemsModule, // ✅ IMPROVEMENT: ItemsModule ko yahan add karein
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService], // To make it available for DashboardModule
})
export class StocksModule {}