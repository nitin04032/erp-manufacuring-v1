import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { CreateFgrDto } from './dto/create-fgr.dto';
import { UpdateFgrDto } from './dto/update-fgr.dto';

@Injectable()
export class FgrService {
  constructor(
    @InjectRepository(FinishedGoodsReceipt)
    private repo: Repository<FinishedGoodsReceipt>,
  ) {}

  async create(dto: CreateFgrDto): Promise<FinishedGoodsReceipt> {
    const fgr = this.repo.create({
      ...dto,
      receipt_date: new Date(dto.receipt_date),
    });
    return this.repo.save(fgr);
  }

  findAll(): Promise<FinishedGoodsReceipt[]> {
    return this.repo.find({ order: { receipt_date: 'DESC' } });
  }

  async findOne(id: number): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return rec;
  }

  async update(id: number, dto: UpdateFgrDto): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);

    Object.assign(rec, dto);
    return this.repo.save(rec);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`FGR #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
