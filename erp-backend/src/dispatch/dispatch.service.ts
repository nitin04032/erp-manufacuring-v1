import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchOrder } from './dispatch.entity';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(DispatchOrder)
    private repo: Repository<DispatchOrder>,
    private stocksService: StocksService,
  ) {}

  async create(dto: CreateDispatchDto): Promise<DispatchOrder> {
    const dispatch = this.repo.create({
      ...dto,
      dispatch_date: new Date(dto.dispatch_date),
      // Assuming your entity can store items as JSON or has a separate relation
    });

    const savedDispatch = await this.repo.save(dispatch);

    // After saving the dispatch, decrease the stock for each item
    for (const item of dto.items) {
      // DTO uses item_code and dispatched_qty; resolve to item id
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const it = await (this.stocksService as any).itemsService.findByCode(
        item.item_code,
      );
      await this.stocksService.decreaseStock(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        it.id,
        dto.warehouse_name,
        item.dispatched_qty,
      );
    }

    return savedDispatch;
  }

  findAll(): Promise<DispatchOrder[]> {
    return this.repo.find({ order: { dispatch_date: 'DESC' } });
  }

  async findOne(id: number): Promise<DispatchOrder> {
    const order = await this.repo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Dispatch order #${id} not found`);
    return order;
  }

  async update(id: number, dto: UpdateDispatchDto): Promise<DispatchOrder> {
    // Note: A real-world update is complex. It might need to reverse old stock
    // changes before applying new ones, especially if quantities change.
    const existing = await this.findOne(id);
    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    // Note: A real-world delete should reverse the stock subtractions (i.e., add the stock back).
    const res = await this.repo.delete(id);
    if (res.affected === 0)
      throw new NotFoundException(`Dispatch order #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
