import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuppliersService } from '../suppliers/suppliers.service';
import { WarehousesService } from '../warehouses/warehouses.service';
// import { ItemsService } from '../items/items.service'; // Jab items module bana loge

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(
    private readonly suppliersService: SuppliersService,
    private readonly warehousesService: WarehousesService,
    // private readonly itemsService: ItemsService,
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    // ✅ Stats from services
    const supplierCount = await this.suppliersService.count();
    const warehouseCount = await this.warehousesService.count();
    const itemCount = 0; // await this.itemsService.count(); // (baad me hook karo)

    // ✅ Status counts (for purchase orders etc. — abhi dummy)
    const statusCounts = {
      pending: 5,
      approved: 10,
      ordered: 8,
      received: 3,
      cancelled: 2,
    };

    // ✅ Recent activities (abhi static, baad me DB driven karenge)
    const recentActivities = [
      {
        title: 'New Supplier Added',
        description: 'Shree Ram Steels added.',
        date: new Date().toISOString(),
        status: 'approved',
      },
      {
        title: 'New Warehouse Created',
        description: 'Delhi Main Warehouse created.',
        date: new Date().toISOString(),
        status: 'active',
      },
    ];

    return {
      stats: {
        suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
      },
      statusCounts,
      recentActivities,
    };
  }
}
