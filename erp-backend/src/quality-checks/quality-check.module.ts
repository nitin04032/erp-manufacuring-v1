import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityCheckService } from './quality-check.service';
import { QualityCheckController } from './quality-check.controller';
import { QualityCheck } from './quality-check.entity';
import { QualityCheckItem } from './quality-check-item.entity';
import { Grn } from '../grn/grn.entity';
import { Item } from '../items/item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QualityCheck,
      QualityCheckItem,
      Grn,
      Item,
    ]),
    // StockModule // Agar aap stock integration kar rahe hain
  ],
  controllers: [QualityCheckController],
  providers: [QualityCheckService],
})
export class QualityCheckModule {}