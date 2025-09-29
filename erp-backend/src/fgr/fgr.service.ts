import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { CreateFgrDto } from './dto/create-fgr.dto';
import { UpdateFgrDto } from './dto/update-fgr.dto';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class FgrService {
  constructor(
    @InjectRepository(FinishedGoodsReceipt)
    private repo: Repository<FinishedGoodsReceipt>,
    // The ProductionOrderRepository is removed as there is no formal relationship
    private stocksService: StocksService,
  ) {}

  async create(dto: CreateFgrDto): Promise<FinishedGoodsReceipt> {
    // 1. Create the FGR instance directly from the DTO
    const fgr = this.repo.create({
      ...dto,
      receipt_date: new Date(dto.receipt_date),
    });
    
    // 2. Save the new FGR to the database
    const savedFgr = await this.repo.save(fgr);

    // 3. After saving, update the stock for the finished good
    await this.stocksService.increaseStock(
      dto.item_code,
      dto.warehouse_name,
      dto.quantity,
      dto.uom,
      dto.item_name,
    );

    return savedFgr;
  }

  findAll(): Promise<FinishedGoodsReceipt[]> {
    // Removed `relations` as there is no formal relationship defined
    return this.repo.find({ order: { receipt_date: 'DESC' } });
  }

  async findOne(id: number): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id } });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return rec;
  }

  async update(id: number, dto: UpdateFgrDto): Promise<FinishedGoodsReceipt> {
    const rec = await this.findOne(id);
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