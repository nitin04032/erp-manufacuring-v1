import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { FgrService } from './fgr.service';
import { FgrController } from './fgr.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FinishedGoodsReceipt])],
  providers: [FgrService],
  controllers: [FgrController],
  exports: [FgrService],
})
export class FgrModule {}
