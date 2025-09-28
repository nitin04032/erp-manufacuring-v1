// erp-backend/src/dashboard/dashboard.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Authentication ke liye
// import { SuppliersService } from '../suppliers/suppliers.service';
// ... baaki services ko import karein

@Controller('dashboard')
@UseGuards(AuthGuard('jwt')) // Is endpoint ko protect karein
export class DashboardController {
  constructor(
    // private readonly suppliersService: SuppliersService,
    // private readonly itemsService: ItemsService, // Apne baaki services ko inject karein
  ) {}

  @Get('summary')
  async getDashboardSummary() {
    // Alag-alag services se data fetch karein
    // const supplierCount = await this.suppliersService.count(); // Maan lete hain .count() method hai
    const itemCount = 0; // await this.itemsService.count();
    const warehouseCount = 0; // await this.warehousesService.count();
    const purchaseOrderCount = 0; // await this.purchaseOrdersService.count();
    
    // Recent activities ka logic yahan likhein (example)
    const recentActivities = [
      {
        title: "New Supplier Added",
        description: "Shree Ram Steels added.",
        date: new Date().toISOString(),
        status: "approved",
      },
    ];

    // Status counts ka logic yahan likhein (example)
    const statusCounts = {
      pending: 5,
      approved: 10,
      ordered: 8,
      received: 3,
      cancelled: 2,
    };
    
    // Saare data ko ek object mein daal kar return karein
    return {
      stats: {
        // suppliers: supplierCount,
        items: itemCount,
        warehouses: warehouseCount,
        purchase_orders: purchaseOrderCount,
      },

      recentActivities: recentActivities,
      statusCounts: statusCounts,
    };
  }
}