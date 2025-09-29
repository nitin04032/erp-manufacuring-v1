import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepo: Repository<Item>,
  ) {}

  async create(dto: CreateItemDto): Promise<Item> {
    // Duplicate code check
    const exists = await this.itemsRepo.findOne({ where: [{ item_code: dto.item_code }] });
    if (exists) {
      throw new ConflictException('Item code already exists');
    }
    const item = this.itemsRepo.create({
      ...dto,
      reorder_level: dto.reorder_level ?? 0,
      standard_rate: dto.standard_rate ?? 0,
      status: dto.status ?? 'active',
    });
    return this.itemsRepo.save(item);
  }

  findAll(): Promise<Item[]> {
    return this.itemsRepo.find({ order: { item_name: 'ASC' } });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepo.preload({ id, ...dto });
    if (!item) throw new NotFoundException(`Item with ID ${id} not found`);
    return this.itemsRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    const res = await this.itemsRepo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Item with ID ${id} not found`);
  }

  // useful helper: count
  count(): Promise<number> {
    return this.itemsRepo.count();
  }
}
