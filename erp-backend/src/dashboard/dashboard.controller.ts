import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { GrnService } from '../grn/grn.service';
import { DispatchService } from '../dispatch/dispatch.service';
import { FgrService } from '../fgr/fgr.service'; // 1. Import the new FgrService

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
    private readonly fgrService: FgrService, // 2. Inject the FgrService
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    const [
      supplierCount,
      itemCount,
      warehouseCount,
      poCount,
      statusCounts,
      recentActivities,
      grnCount,
      dispatchCount,
      fgrCount, // 3. Add a variable for the FGR count
    ] = await Promise.all([
      this.suppliersService.count(),
      this.itemsService.count(),
      this.warehousesService.count(),
      this.purchaseOrdersService.count(),
      this.purchaseOrdersService.getStatusCounts(),
      this.purchaseOrdersService.getRecent(),
      this.grnService.count(),
      this.dispatchService.count(),
      this.fgrService.count(), // 4. Call the fgrService.count() method
    ]);

    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        purchase_orders: poCount,
        grn: grnCount,
        dispatch_orders: dispatchCount,
        fgr: fgrCount, // 5. Add the fgrCount to the response
      },
      statusCounts,
      recentActivities,
    };
  }
}