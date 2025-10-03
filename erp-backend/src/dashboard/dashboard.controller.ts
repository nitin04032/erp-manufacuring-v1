import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { GrnService } from '../grn/grn.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { FgrService } from '../fgr/fgr.service';
import { StocksService } from '../stocks/stocks.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly itemsService: ItemsService,
    private readonly warehousesService: WarehousesService,
    private readonly purchaseOrdersService: PurchaseOrdersService,
    private readonly grnService: GrnService,
    private readonly dispatchService: DispatchService,
    private readonly fgrService: FgrService,
    private readonly stocksService: StocksService,
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    const [
      // Core Stats
      supplierCount,
      itemCount,
      warehouseCount,
      poCount,
      grnCount,
      dispatchCount,
      fgrCount,
      
      // Detailed Summaries
      poStatusSummary,
      recentPurchaseOrders,
      totalStockValue,
      lowStockItems,
    ] = await Promise.all([
      this.suppliersService.count(),
      this.itemsService.count(),
      this.warehousesService.count(),
      this.purchaseOrdersService.count(),
      this.grnService.count(),
      this.dispatchService.count(),
      this.fgrService.count(),
      this.purchaseOrdersService.getStatusCounts(),
      this.purchaseOrdersService.getRecent(),
      this.stocksService.getTotalStockValue(),
      this.stocksService.getLowStockItems(),
    ]);

    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        purchase_orders: poCount,
        grn: grnCount,
        dispatch_orders: dispatchCount,
        fgr: fgrCount,
      },
      stockSummary: {
        totalValue: totalStockValue,
        lowStockItems: lowStockItems,
      },
      poStatusSummary: poStatusSummary,
      recentPurchaseOrders: recentPurchaseOrders,
    };
  }
}