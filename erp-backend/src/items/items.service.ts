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

  /**
   * Creates a new item.
   * If item_code is not provided, it generates one automatically based on the item_type.
   * Example: An item_type of 'finished_goods' will generate a code like 'FG-001'.
   */
  async create(dto: CreateItemDto): Promise<Item> {
    // Logic for auto-generation if item_code is empty
    if (!dto.item_code) {
      const type = dto.item_type || 'raw_material';
      // Creates a prefix like 'RM' from 'raw_material'
      const prefix = type.split('_').map(word => word[0]).join('').toUpperCase();

      // Find the last item with the same prefix to determine the next number
      const lastItem = await this.itemsRepository.findOne({
        where: { item_code: Like(`${prefix}-%`) },
        order: { id: 'DESC' }, // Order by ID to get the most recent entry reliably
      });

      let nextNum = 1;
      if (lastItem) {
        const lastNum = parseInt(lastItem.item_code.split('-')[1]);
        nextNum = lastNum + 1;
      }
      
      // Format the new item code (e.g., 'RM-001')
      dto.item_code = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    }

    // Check for duplicates before creating
    const existingItem = await this.itemsRepository.findOne({ where: { item_code: dto.item_code } });
    if (existingItem) {
      throw new ConflictException(`Item with code ${dto.item_code} already exists`);
    }

    const item = this.itemsRepository.create(dto);
    return this.itemsRepository.save(item);
  }

  /**
   * Finds all items with optional server-side filtering and searching.
   */
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
        { ...where, item_category: searchQuery }, // Corrected field name to match entity
        { ...where, hsn_code: searchQuery },
      ];
    } else if (Object.keys(where).length > 0) {
      options.where = where;
    }

    return this.itemsRepository.find(options);
  }

  /**
   * Finds a single item by its ID.
   */
  async findOne(id: number): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
    return item;
  }

  /**
   * Updates an item's details.
   */
  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.itemsRepository.preload({ id, ...dto });
    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
    return this.itemsRepository.save(item);
  }

  /**
   * Removes an item from the database.
   */
  async remove(id: number): Promise<void> {
    const result = await this.itemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
  }
}