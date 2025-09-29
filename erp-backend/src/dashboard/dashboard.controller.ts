import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';
import { GrnService } from '../grn/grn.service'; // 👈 Import the Service
import { DispatchService } from '../dispatch/dispatch.service'; // 👈 Import the Service

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly itemsService: ItemsService,
    private readonly warehousesService: WarehousesService,
    private readonly purchaseOrdersService: PurchaseOrdersService,
    // ✅ FIX 1: Inject Services, not Modules
    private readonly grnService: GrnService,
    private readonly dispatchService: DispatchService,
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
      grnCount,       // 👈 Add variable for GRN count
      dispatchCount,  // 👈 Add variable for Dispatch count
    ] = await Promise.all([
      this.suppliersService.count(),
      this.itemsService.count(),
      this.warehousesService.count(),
      this.purchaseOrdersService.count(),
      this.purchaseOrdersService.getStatusCounts(),
      this.purchaseOrdersService.getRecent(),
      // ✅ FIX 2: Add the service calls to Promise.all
      this.grnService.count(),
      this.dispatchService.count(),
    ]);

    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        purchase_orders: poCount,
        // ✅ FIX 3: Add the new counts to the return object
        grn: grnCount,
        dispatch_orders: dispatchCount,
      },
      statusCounts,
      recentActivities,
    };
  }
}