import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DispatchOrder } from './dispatch.entity';
import { CreateDispatchDto } from './dto/create-dispatch.dto';
import { UpdateDispatchDto } from './dto/update-dispatch.dto';

@Injectable()
export class DispatchService {
  constructor(
    @InjectRepository(DispatchOrder)
    private repo: Repository<DispatchOrder>,
  ) {}

  async create(dto: CreateDispatchDto): Promise<DispatchOrder> {
    const dispatch = this.repo.create({
      ...dto,
      dispatch_date: new Date(dto.dispatch_date),
    });
    return this.repo.save(dispatch);
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
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Dispatch order #${id} not found`);

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Dispatch order #${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
