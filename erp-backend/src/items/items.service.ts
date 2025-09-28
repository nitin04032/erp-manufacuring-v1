import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(dto: CreateItemDto): Promise<Item> {
    // ✅ Check for duplicates before saving to prevent errors
    const existingItem = await this.itemsRepository.findOne({
      where: { item_code: dto.item_code },
    });

    if (existingItem) {
      throw new ConflictException('Item with this code already exists');
    }

    const item = this.itemsRepository.create(dto);
    return this.itemsRepository.save(item);
  }

  findAll(): Promise<Item[]> {
    return this.itemsRepository.find({ order: { item_name: 'ASC' } });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    // The preload method safely merges the DTO with the existing entity
    const item = await this.itemsRepository.preload({ id, ...dto });
    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
    return this.itemsRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const result = await this.itemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.itemsRepository.count();
  }
}