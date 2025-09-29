// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { Grn } from '../grn/grn.entity';
import { DispatchOrder } from '../dispatch/dispatch.entity';
import { Stock } from '../stocks/stock.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Grn)
    private grnRepo: Repository<Grn>,
    @InjectRepository(DispatchOrder)
    private dispatchRepo: Repository<DispatchOrder>,
    @InjectRepository(Stock)
    private stockRepo: Repository<Stock>,
  ) {}

  async getPurchaseReport(status?: string) {
    if (status) {
      return this.poRepo.find({ where: { status } });
    }
    return this.poRepo.find();
  }

  async getGrnReport(from?: string, to?: string) {
    let query = this.grnRepo.createQueryBuilder('grn');
    if (from && to) {
      query = query.where('grn.receipt_date BETWEEN :from AND :to', { from, to });
    }
    return query.getMany();
  }

  async getDispatchReport(customer?: string) {
    if (customer) {
      return this.dispatchRepo.find({ where: { customer_name: customer } });
    }
    return this.dispatchRepo.find();
  }

  async getStockMovementReport(item?: string) {
    if (item) {
      return this.stockRepo.find({ where: { item_name: item } });
    }
    return this.stockRepo.find();
  }
}
