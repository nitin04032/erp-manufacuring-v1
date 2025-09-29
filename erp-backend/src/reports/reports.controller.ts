import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Response } from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('purchase-orders')
  async getPurchaseReport(
    @Res() res: Response,
    @Query('status') status?: string,
    @Query('export') exportType?: string,
  ) {
    const data = await this.reportsService.getPurchaseReport(status);

    if (exportType === 'excel') {
      const columns = [
        { header: 'PO Number', key: 'po_number', width: 20 },
        { header: 'Order Date', key: 'order_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Total Amount', key: 'total_amount', width: 15, style: { numFmt: '#,##0.00' } },
      ];
      return this.reportsService.exportToExcel(res, data, 'Purchase_Orders', columns);
    }

    return res.json(data);
  }

  @Get('grn')
  async getGrnReport(
    @Res() res: Response,
    @Query('from') from?: Date,
    @Query('to') to?: Date,
    @Query('export') exportType?: string,
  ) {
    const data = await this.reportsService.getGrnReport(from, to);

    if (exportType === 'excel') {
      const columns = [
        { header: 'GRN Number', key: 'grn_number', width: 20 },
        { header: 'Received Date', key: 'received_date', width: 15 },
        { header: 'PO Number', key: 'purchaseOrder.po_number', width: 20 },
        { header: 'Remarks', key: 'remarks', width: 30 },
      ];
      // Note: For nested data like 'purchaseOrder.po_number', you may need to flatten the data before exporting.
      return this.reportsService.exportToExcel(res, data, 'GRN_Report', columns);
    }

    return res.json(data);
  }

  @Get('dispatch')
  async getDispatchReport(
    @Res() res: Response,
    @Query('customer') customer?: string,
    @Query('export') exportType?: string,
  ) {
    const data = await this.reportsService.getDispatchReport(customer);
    
    if (exportType === 'excel') {
      const columns = [
        { header: 'Dispatch Number', key: 'dispatch_number', width: 20 },
        { header: 'Customer', key: 'customer_name', width: 25 },
        { header: 'Dispatch Date', key: 'dispatch_date', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];
      return this.reportsService.exportToExcel(res, data, 'Dispatch_Report', columns);
    }

    return res.json(data);
  }

  @Get('stock')
  async getStockReport(@Res() res: Response, @Query('export') exportType?: string) {
    const data = await this.reportsService.getStockReport();

    if (exportType === 'excel') {
      const columns = [
        { header: 'Item Code', key: 'item_code', width: 20 },
        { header: 'Item Name', key: 'item_name', width: 30 },
        { header: 'Warehouse', key: 'warehouse_name', width: 20 },
        { header: 'Quantity', key: 'quantity', width: 15, style: { numFmt: '#,##0.00' } },
        { header: 'UOM', key: 'uom', width: 10 },
      ];
      return this.reportsService.exportToExcel(res, data, 'Stock_Report', columns);
    }

    return res.json(data);
  }
}