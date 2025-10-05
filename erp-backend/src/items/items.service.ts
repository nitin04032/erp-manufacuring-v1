import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
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
    const existingItem = await this.itemsRepository.findOne({ where: { item_code: dto.item_code } });
    if (existingItem) {
      throw new ConflictException('Item with this code already exists');
    }
    const item = this.itemsRepository.create(dto);
    return this.itemsRepository.save(item);
  }

  // ✅ Improvement: Implemented server-side filtering and searching
  findAll(query?: { status?: string, search?: string }): Promise<Item[]> {
    const options: FindManyOptions<Item> = { order: { item_name: 'ASC' } };
    const where: any = {};

    if (query?.status) {
      where.is_active = query.status === 'active';
    }
    
    if (query?.search) {
      const searchQuery = Like(`%${query.search}%`);
      options.where = [
        { ...where, item_name: searchQuery },
        { ...where, item_code: searchQuery },
        { ...where, category: searchQuery },
        { ...where, hsn_code: searchQuery },
      ];
    } else if (Object.keys(where).length > 0) {
      options.where = where;
    }

    return this.itemsRepository.find(options);
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
    return item;
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
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
}