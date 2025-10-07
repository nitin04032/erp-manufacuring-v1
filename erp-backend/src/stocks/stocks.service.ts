import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
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

  async increaseStock(itemId: number, warehouse_name: string, qty: number): Promise<Stock> {
    const item = await this.itemRepo.findOneBy({ id: itemId });
    if (!item) throw new NotFoundException(`Item with ID ${itemId} not found.`);

    let stock = await this.repo.findOne({ where: { item: { id: itemId }, warehouse_name } });

    if (!stock) {
      stock = this.repo.create({
        warehouse_name,
        quantity: qty,
        item_name: item.item_name,
        item_code: item.item_code,
        uom: item.unit,
        item: { id: itemId } as Item,
      });
    } else {
      stock.quantity = Number(stock.quantity) + Number(qty);
    }

    return this.repo.save(stock);
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
        `Insufficient stock for item ${stock.item.item_code}. Available: ${stock.quantity}, Required: ${qty}`,
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
