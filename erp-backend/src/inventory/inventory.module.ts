import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './stock-item.entity';
import { StockLedger } from './stock-ledger.entity';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, StockLedger])],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
