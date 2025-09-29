import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private repo: Repository<Stock>,
  ) {}

  // --- Stock Management (Transactional) Methods ---

  async increaseStock(item_code: string, warehouse_name: string, qty: number, uom: string, item_name: string): Promise<Stock> {
    let stock = await this.repo.findOne({ where: { item_code, warehouse_name } });
    if (!stock) {
      stock = this.repo.create({ item_code, warehouse_name, quantity: qty, uom, item_name });
    } else {
      stock.quantity = Number(stock.quantity) + Number(qty); // Ensure numbers are treated correctly
    }
    return this.repo.save(stock);
  }

  async decreaseStock(item_code: string, warehouse_name: string, qty: number): Promise<Stock> {
    const stock = await this.repo.findOne({ where: { item_code, warehouse_name } });
    if (!stock) {
      throw new NotFoundException(`Stock not found for item ${item_code} in warehouse ${warehouse_name}`);
    }

    if (stock.quantity < qty) {
      throw new Error(`Insufficient stock for item ${item_code}. Available: ${stock.quantity}, Required: ${qty}`);
    }

    stock.quantity -= qty;
    return this.repo.save(stock);
  }

  // --- Data Retrieval (Finder) Methods ---

  findAll(): Promise<Stock[]> {
    return this.repo.find({ 
      relations: ['item'],
      order: { item_name: 'ASC' } 
    });
  }

  findByWarehouse(warehouse_name: string): Promise<Stock[]> {
    return this.repo.find({
      where: { warehouse_name },
      relations: ['item'],
    });
  }

  async findOne(item_code: string, warehouse_name: string): Promise<Stock> {
    const stock = await this.repo.findOne({
      where: { item_code, warehouse_name },
      relations: ['item'],
    });

    if (!stock) {
      throw new NotFoundException(`Stock not found for item ${item_code} in warehouse ${warehouse_name}`);
    }
    return stock;
  }
  
  // --- Dashboard & Analytics Methods ---

  count(): Promise<number> {
    return this.repo.count();
  }

  async getTotalStockValue(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('stock')
      .leftJoin('stock.item', 'item') // Use leftJoin if you only need item's properties for calculation
      .select('SUM(stock.quantity * item.unit_price)', 'totalValue')
      .getRawOne();
    
    return parseFloat(result.totalValue) || 0;
  }

  async getLowStockItems(threshold: number = 10): Promise<Stock[]> {
    return this.repo
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.item', 'item')
      .where('stock.quantity < :threshold AND stock.quantity > 0', { threshold })
      .orderBy('stock.quantity', 'ASC')
      .take(10)
      .getMany();
  }
}