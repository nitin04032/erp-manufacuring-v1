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

  async create(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) throw new NotFoundException(`Supplier #${dto.supplierId} not found`);

    const po = this.repo.create({
      ...dto,
      supplier,
      order_date: new Date(dto.order_date),
      // ✅ FIX 1: Changed null to undefined
      expected_date: dto.expected_date ? new Date(dto.expected_date) : undefined,
    });
    return this.repo.save(po);
  }

  // ✅ FIX 2: Added [] to the return type
  findAll(): Promise<PurchaseOrder[]> {
    return this.repo.find({ order: { order_date: 'DESC' } });
  }

  async findOne(id: number): Promise<PurchaseOrder> {
    const po = await this.repo.findOne({ where: { id } });
    if (!po) throw new NotFoundException(`Purchase Order #${id} not found`);
    return po;
  }

  async update(id: number, dto: UpdatePurchaseOrderDto): Promise<PurchaseOrder> {
    // Note: For update, you might need a more detailed implementation
    // to handle relationships and partial data correctly, but this is okay for now.
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Purchase Order #${id} not found`);

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Purchase Order #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}