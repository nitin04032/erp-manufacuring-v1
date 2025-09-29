import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { Grn } from '../grn/grn.entity';
import { DispatchOrder } from '../dispatch/dispatch.entity';
import { Stock } from '../stocks/stock.entity';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Grn) private grnRepo: Repository<Grn>,
    @InjectRepository(DispatchOrder) private dispatchRepo: Repository<DispatchOrder>,
    @InjectRepository(Stock) private stockRepo: Repository<Stock>,
  ) {}

  // --- Data Fetching Methods ---

  getPurchaseReport(status?: string): Promise<PurchaseOrder[]> {
    const query = status ? { where: { status } } : {};
    return this.poRepo.find(query);
  }

  getGrnReport(from?: Date, to?: Date): Promise<Grn[]> {
    const query = (from && to) ? { where: { received_date: Between(from, to) } } : {};
    return this.grnRepo.find(query);
  }

  getDispatchReport(customer?: string): Promise<DispatchOrder[]> {
    const query = customer ? { where: { customer_name: customer } } : {};
    return this.dispatchRepo.find(query);
  }

  getStockReport(): Promise<Stock[]> {
    // A full stock movement report would be more complex, likely involving
    // a separate transaction log table. This is a current stock report.
    return this.stockRepo.find({ order: { item_name: 'ASC' } });
  }

  // --- Excel Export Utility Method ---

  async exportToExcel(res: Response, data: any[], sheetName: string, columns: any[]) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Add columns with headers and define keys
    worksheet.columns = columns;

    // Add data rows
    worksheet.addRows(data);
    
    // Set response headers for Excel download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${sheetName}.xlsx`);

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
  }
}