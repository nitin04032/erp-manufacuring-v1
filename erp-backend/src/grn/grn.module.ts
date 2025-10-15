import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grn } from './grn.entity';
import { GrnService } from './grn.service';
import { GrnController } from './grn.controller';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { StocksModule } from '../stocks/stocks.module';
import { GrnItem } from './grn-item.entity'; // ✅ 1. Import GrnItem
import { Item } from '../items/item.entity'; // ✅ 2. Import Item

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Grn, 
      GrnItem, // ✅ 3. Add GrnItem here
      Item,    // ✅ 4. Add Item here to find by code
      PurchaseOrder
    ]),
    StocksModule,
  ],
  providers: [GrnService],
  controllers: [GrnController],
  exports: [GrnService],
})
export class GrnModule {}