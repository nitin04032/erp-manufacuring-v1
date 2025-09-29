import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grn } from './grn.entity';
import { GrnService } from './grn.service';
import { GrnController } from './grn.controller';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { StocksModule } from '../stocks/stocks.module'; // 👈 Import StocksModule

@Module({
  imports: [
    // Registers the Grn and PurchaseOrder entities to make their repositories
    // available for injection within this module.
    TypeOrmModule.forFeature([Grn, PurchaseOrder]),
    
    // Imports StocksModule to make StocksService available for injection.
    StocksModule,
  ],
  providers: [GrnService],
  controllers: [GrnController],
  exports: [GrnService], // Exports GrnService so other modules can use it
})
export class GrnModule {}