import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly itemsService: ItemsService,
    private readonly warehousesService: WarehousesService,
    // 1. Inject the PurchaseOrdersService
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    // --- Fetch all data in parallel for the best performance ---
    const [
      supplierCount,
      itemCount,
      warehouseCount,
      purchaseOrderCount,
      statusCounts,
      recentActivities,
    ] = await Promise.all([
      this.suppliersService.count(),
      this.itemsService.count(),
      this.warehousesService.count(),
      // 2. Call the new service methods
      this.purchaseOrdersService.count(),
      this.purchaseOrdersService.getStatusCounts(),
      this.purchaseOrdersService.getRecent(),
    ]);

    // 3. Return the complete, real data
    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        purchase_orders: purchaseOrderCount,
      },
      statusCounts,
      recentActivities,
    };
  }
}