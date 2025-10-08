// erp-backend/src/purchase-orders/purchase-orders.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrdersController } from './purchase-orders.controller';
import { Supplier } from '../suppliers/supplier.entity';
import { Item } from '../items/item.entity';
import { Warehouse } from '../warehouses/warehouse.entity'; // 👈 1. Import Warehouse

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder, 
      Supplier, 
      Item,
      Warehouse // 👈 2. Add Warehouse here
    ])
  ],
  providers: [PurchaseOrdersService],
  controllers: [PurchaseOrdersController],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}