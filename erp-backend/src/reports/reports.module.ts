// src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { Grn } from '../grn/grn.entity';
import { DispatchOrder } from '../dispatch/dispatch.entity';
import { Stock } from '../stocks/stock.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, Grn, DispatchOrder, Stock])],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
