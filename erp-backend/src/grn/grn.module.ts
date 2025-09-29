import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grn } from './grn.entity';
import { GrnService } from './grn.service';
import { GrnController } from './grn.controller';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Grn, PurchaseOrder])],
  providers: [GrnService],
  controllers: [GrnController],
  exports: [GrnService],
})
export class GrnModule {}
