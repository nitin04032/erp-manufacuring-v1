import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { Supplier } from '../suppliers/supplier.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private repo: Repository<PurchaseOrder>,
    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  // --- Standard CRUD Methods ---

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) throw new NotFoundException(`Supplier with ID ${dto.supplierId} not found`);

    const po = this.repo.create({
      ...dto,
      supplier,
      order_date: new Date(dto.order_date),
      expected_date: dto.expected_date ? new Date(dto.expected_date) : undefined,
    });
    return this.repo.save(po);
  }

  findAll(): Promise<PurchaseOrder[]> {
    return this.repo.find({ order: { order_date: 'DESC' } });
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const po = await this.repo.findOne({ where: { id } });
    if (!po) throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    return po;
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    const existing = await this.findOne(id); // Re-uses findOne to ensure it exists
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Purchase Order with ID ${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.repo.count();
  }

  // --- Dashboard-Specific Methods ---

  /**
   * Gets the count of purchase orders for each status.
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    const counts = await this.repo
      .createQueryBuilder('po')
      .select('po.status', 'status')
      .addSelect('COUNT(po.id)', 'count')
      .groupBy('po.status')
      .getRawMany();

    // Initialize a default object to ensure all statuses are present in the response
    const formattedCounts = { pending: 0, approved: 0, ordered: 0, received: 0, cancelled: 0 };
    
    // Populate with real data from the database
    counts.forEach(item => {
      if (formattedCounts.hasOwnProperty(item.status)) {
        formattedCounts[item.status] = parseInt(item.count, 10);
      }
    });

    return formattedCounts;
  }

  /**
   * Gets the most recent purchase orders.
   */
  async getRecent(limit: number = 5): Promise<PurchaseOrder[]> {
    return this.repo.find({
      order: {
        created_at: 'DESC', // Sort by creation date, newest first
      },
      take: limit, // Get only the top 'limit' records
    });
  }
}