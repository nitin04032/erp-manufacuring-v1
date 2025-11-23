import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { Stock } from './stock.entity';
import { Item } from '../items/item.entity'; // ✅ Import Item entity

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, Item]), // ✅ Include both entities
  ],
  providers: [StocksService],
  controllers: [StocksController],
  exports: [StocksService], // Optional: export for Dashboard or other modules
})
export class StocksModule {}
