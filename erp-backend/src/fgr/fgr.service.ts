import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinishedGoodsReceipt } from './fgr.entity';
import { CreateFgrDto } from './dto/create-fgr.dto';
import { UpdateFgrDto } from './dto/update-fgr.dto';
import { StocksService } from '../stocks/stocks.service';
import { ProductionOrder } from '../production-orders/production-order.entity';

@Injectable()
export class FgrService {
  constructor(
    @InjectRepository(FinishedGoodsReceipt)
    private repo: Repository<FinishedGoodsReceipt>,
    @InjectRepository(ProductionOrder)
    private productionOrderRepo: Repository<ProductionOrder>,
    private stocksService: StocksService,
  ) {}

  async create(dto: CreateFgrDto): Promise<FinishedGoodsReceipt> {
    // 1. Find the related Production Order
    const productionOrder = await this.productionOrderRepo.findOneBy({ id: dto.productionOrderId });
    if (!productionOrder) {
      throw new NotFoundException(`Production Order #${dto.productionOrderId} not found`);
    }

    // 2. Create the FGR instance
    const fgr = this.repo.create({
      ...dto,
      productionOrder, // Link the full entity object
      receipt_date: new Date(dto.receipt_date),
    });
    
    // 3. Save the new FGR to the database
    const savedFgr = await this.repo.save(fgr);

    // 4. After saving, update the stock for the finished good
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
    return this.repo.find({ 
      relations: ['productionOrder'],
      order: { receipt_date: 'DESC' } 
    });
  }

  async findOne(id: number): Promise<FinishedGoodsReceipt> {
    const rec = await this.repo.findOne({ where: { id }, relations: ['productionOrder'] });
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