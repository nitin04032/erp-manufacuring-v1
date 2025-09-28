import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { ItemsService } from '../items/items.service';
import { WarehousesService } from '../warehouses/warehouses.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly itemsService: ItemsService,
    private readonly warehousesService: WarehousesService,
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    // --- Fetch all counts in parallel for better performance ---
    const [supplierCount, itemCount, warehouseCount] = await Promise.all([
      this.suppliersService.count(),
      this.itemsService.count(),
      this.warehousesService.count(),
    ]);

    // TODO: Replace these with real data from their respective services later
    const statusCounts = { pending: 0, approved: 0, ordered: 0, received: 0, cancelled: 0 };
    const recentActivities = [];

    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        // TODO: Add purchase_orders count later
        purchase_orders: 0, 
      },
      statusCounts,
      recentActivities,
    };
  }
}