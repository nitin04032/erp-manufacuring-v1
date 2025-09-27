// NAYA AUR SUDHARA HUA CODE

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../suppliers/supplier.entity';
import { User } from '../users/user.entity';
// ... import other entities as needed

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // Inject repositories for items, warehouses, etc. here
  ) {}

  async getStatus() {
    try {
      // ✅ Check DB connection by running a simple query
      await this.usersRepository.query('SELECT 1');
      const dbStatus = true;

      // ✅ Get stats using TypeORM repositories (yeh zyaada safe hai)
      const supplierCount = await this.suppliersRepository.count();
      const userCount = await this.usersRepository.count();
      // Add counts for other entities here

      return {
        dbStatus,
        stats: {
          suppliers: supplierCount,
          users: userCount,
          // items: itemCount,
          // warehouses: warehouseCount,
        },
      };
    } catch (err) {
      console.error('System status check failed:', err);
      return { dbStatus: false, stats: {} };
    }
  }
}