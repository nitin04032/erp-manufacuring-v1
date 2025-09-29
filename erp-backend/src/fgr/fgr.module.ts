import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { FgrService } from './fgr.service';
import { FgrController } from './fgr.controller';

// ✅ Make sure these paths exactly match your folder/file structure
import { ProductionOrdersModule } from '../production-orders/production-orders.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinishedGoodsReceipt]),
    // ✅ Import the modules that provide the services/repositories you need
    ProductionOrdersModule,
    StocksModule,
  ],
  providers: [FgrService],
  controllers: [FgrController],
  exports: [FgrService],
})
export class FgrModule {}