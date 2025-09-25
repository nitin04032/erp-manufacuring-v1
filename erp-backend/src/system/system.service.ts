import { Injectable } from '@nestjs/common';
import { pool } from '@/lib/db.pool';
  // ✅ tumhara mysql2 pool

@Injectable()
export class SystemService {
  async getStatus() {
    try {
      // ✅ Check DB connection
      const [rows] = await pool.query('SELECT 1');
      const dbStatus = rows ? true : false;

      // ✅ Dummy stats (replace with real table counts)
      const [suppliers] = await pool.query('SELECT COUNT(*) as c FROM suppliers');
      const [items] = await pool.query('SELECT COUNT(*) as c FROM items');
      const [warehouses] = await pool.query('SELECT COUNT(*) as c FROM warehouses');
      const [locations] = await pool.query('SELECT COUNT(*) as c FROM locations');

      return {
        dbStatus,
        stats: {
          suppliers: suppliers[0]?.c || 0,
          items: items[0]?.c || 0,
          warehouses: warehouses[0]?.c || 0,
          locations: locations[0]?.c || 0,
        },
      };
    } catch (err) {
      return { dbStatus: false, stats: {} };
    }
  }
}
