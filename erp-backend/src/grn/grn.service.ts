import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grn } from './grn.entity';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';

@Injectable()
export class GrnService {
  constructor(
    @InjectRepository(Grn) private repo: Repository<Grn>,
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
  ) {}

  async create(dto: CreateGrnDto): Promise<Grn> {
    const po = await this.poRepo.findOneBy({ id: dto.purchaseOrderId });
    if (!po) throw new NotFoundException(`Purchase Order #${dto.purchaseOrderId} not found`);

    const grn = this.repo.create({
      ...dto,
      purchaseOrder: po,
      received_date: new Date(dto.received_date),
    });

    return this.repo.save(grn);
  }

  findAll(): Promise<Grn[]> {
    return this.repo.find({ order: { received_date: 'DESC' } });
  }

  async findOne(id: number): Promise<Grn> {
    const grn = await this.repo.findOne({ where: { id } });
    if (!grn) throw new NotFoundException(`GRN #${id} not found`);
    return grn;
  }

  async update(id: number, dto: UpdateGrnDto): Promise<Grn> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`GRN #${id} not found`);

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`GRN #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
