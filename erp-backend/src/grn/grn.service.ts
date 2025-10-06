import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grn } from './grn.entity';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { StocksService } from '../stocks/stocks.service'; // 👈 Import StocksService

@Injectable()
export class GrnService {
  constructor(
    @InjectRepository(Grn)
    private repo: Repository<Grn>,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    // Inject the StocksService to manage inventory
    private stocksService: StocksService,
  ) { }

  async create(dto: CreateGrnDto): Promise<Grn> {
    // 1. Find the related Purchase Order
    const po = await this.poRepo.findOneBy({ id: dto.purchaseOrderId });
    if (!po) throw new NotFoundException(`Purchase Order #${dto.purchaseOrderId} not found`);

    // 2. Create the GRN instance
    const grn = this.repo.create({
      ...dto,
      purchaseOrder: po,
      received_date: new Date(dto.received_date),
    });

    // 3. Save the new GRN to the database
    const savedGrn = await this.repo.save(grn);

    // 4. After saving the GRN, update the stock for each item
    for (const item of dto.items) {
      // DTO uses item_code and received_qty; resolve to item id
      const it = await (this.stocksService as any).itemsService.findByCode(item.item_code);
      await this.stocksService.increaseStock(
        it.id,
        dto.warehouse_name,
        item.received_qty,
      );
    }

    return savedGrn;
  }

  findAll(): Promise<Grn[]> {
    return this.repo.find({
      relations: ['purchaseOrder'],
      order: { received_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Grn> {
    const grn = await this.repo.findOne({ where: { id }, relations: ['purchaseOrder'] });
    if (!grn) throw new NotFoundException(`GRN #${id} not found`);
    return grn;
  }

  async update(id: number, dto: UpdateGrnDto): Promise<Grn> {
    // Note: A real-world update might need to reverse old stock changes
    // and apply new ones, which can be complex. This is a basic update.
    const existing = await this.findOne(id);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    // Note: A real-world delete should reverse the stock additions.
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`GRN #${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}