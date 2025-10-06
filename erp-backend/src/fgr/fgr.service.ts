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
    private stocksService: StocksService,
  ) {}

  async create(dto: CreateFgrDto): Promise<FinishedGoodsReceipt> {
    // Resolve item by code to get its id
    const item = await this.stocksService['itemsService'].findByCode(dto.item_code);

    const fgr = this.repo.create({
      receipt_number: dto.receipt_number,
      production_order_no: dto.production_order_no,
      item_name: dto.item_name,
      quantity: dto.quantity,
      uom: dto.uom,
      warehouse_name: dto.warehouse_name,
      receipt_date: new Date(dto.receipt_date),
      status: dto.status ?? 'draft',
      remarks: dto.remarks ?? undefined,
    } as Partial<FinishedGoodsReceipt>);

    const savedFgr = await this.repo.save(fgr);

    // Update stock using item id resolved from item_code
    await this.stocksService.increaseStock(item.id, dto.warehouse_name, dto.quantity);

    return savedFgr;
  }

  findAll(): Promise<FinishedGoodsReceipt[]> {
    // ✅ IMPROVEMENT: Item ki details saath mein fetch karein
    return this.repo.find({ 
        relations: ['item'],
        order: { receipt_date: 'DESC' } 
    });
  }

  async findOne(id: number): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id }, relations: ['item'] });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return rec;
  }

  async update(id: number, dto: UpdateFgrDto): Promise<FinishedGoodsReceipt> {
    // Note: Updating FGR is complex as it requires reversing/adjusting stock.
    // This is a simplified update.
    const rec = await this.repo.preload({ id, ...dto });
    if (!rec) throw new NotFoundException(`FGR #${id} not found`);
    return this.repo.save(rec);
  }

  async remove(id: number): Promise<void> {
    // Note: A real remove would need to reverse the stock transaction.
    // ✅ IMPROVEMENT: Hard delete ki jagah soft delete use karein
    const res = await this.repo.softDelete(id);
    if (res.affected === 0) throw new NotFoundException(`FGR #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}