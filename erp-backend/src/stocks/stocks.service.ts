import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, EntityManager } from 'typeorm';
import { Stock } from './stock.entity';
import { Item } from '../items/item.entity';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private repo: Repository<Stock>,

    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
  ) {}

  // --- Stock Management ---

  async increaseStock(
    itemId: number,
    warehouse_name: string,
    qty: number,
    manager?: EntityManager,
  ): Promise<void> {
    // Use provided manager's repository when inside a transaction, otherwise use the service repo
    const repo = manager ? manager.getRepository(Stock) : this.repo;

    const stock = await repo.findOne({ where: { item: { id: itemId }, warehouse_name } });
    if (stock) {
      stock.quantity = (stock.quantity || 0) + qty;
      await repo.save(stock);
    } else {
      // create new stock record
      const newStock = repo.create({
        item: { id: itemId },
        warehouse_name,
        quantity: qty,
      });
      await repo.save(newStock);
    }
  }

  async decreaseStock(itemId: number, warehouse_name: string, qty: number): Promise<Stock> {
    const stock = await this.repo.findOne({
      where: { item: { id: itemId }, warehouse_name },
      relations: ['item'],
    });

    if (!stock)
      throw new NotFoundException(`Stock not found for item ID ${itemId} in warehouse ${warehouse_name}`);
    if (stock.quantity < qty)
      throw new BadRequestException(
        `Insufficient stock for item ${stock.item.sku}. Available: ${stock.quantity}, Required: ${qty}`,
      );

    stock.quantity = Number(stock.quantity) - Number(qty);
    return this.repo.save(stock);
  }

  // --- Data Retrieval ---

  async findAll(): Promise<Stock[]> {
    return this.repo.find({
      relations: ['item'],
      order: { item_name: 'ASC' },
    });
  }

  async findByWarehouse(warehouse_name: string): Promise<Stock[]> {
    return this.repo.find({
      where: { warehouse_name: Like(`%${warehouse_name}%`) },
      relations: ['item'],
      order: { item_name: 'ASC' },
    });
  }

  async findOne(itemId: number, warehouse_name: string): Promise<Stock> {
    const stock = await this.repo.findOne({
      where: { item: { id: itemId }, warehouse_name },
      relations: ['item'],
    });

    if (!stock)
      throw new NotFoundException(`No stock found for item ID ${itemId} in warehouse ${warehouse_name}`);
    return stock;
  }

  // --- Dashboard & Analytics ---

  count(): Promise<number> {
    return this.repo.count();
  }

  async getTotalStockValue(): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('stock')
      .leftJoin('stock.item', 'item')
      .select('SUM(stock.quantity * item.purchase_rate)', 'totalValue')
      .getRawOne();

    return parseFloat(result.totalValue) || 0;
  }

  async getLowStockItems(): Promise<Stock[]> {
    return this.repo
      .createQueryBuilder('stock')
      .leftJoinAndSelect('stock.item', 'item')
      .where('stock.quantity <= item.reorder_level AND item.reorder_level > 0')
      .orderBy('stock.quantity', 'ASC')
      .take(10)
      .getMany();
  }
}
