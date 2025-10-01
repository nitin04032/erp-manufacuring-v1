import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { FgrService } from './fgr.service';
import { FgrController } from './fgr.controller';

// ✅ Make sure these paths exactly match your folder/file structure
import { ProductionModule } from '../production/production.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FinishedGoodsReceipt]),
    // ✅ Import the modules that provide the services/repositories you need
    ProductionModule,
    StocksModule,
  ],
  providers: [FgrService],
  controllers: [FgrController],
  exports: [FgrService],
})
export class FgrModule {}