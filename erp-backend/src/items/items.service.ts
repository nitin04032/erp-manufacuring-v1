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
    if (!dto.item_code) {
      const type = dto.item_type || 'raw_material';
      const prefix = type.split('_').map(word => word[0]).join('').toUpperCase();
      const lastItem = await this.itemsRepository.findOne({
        where: { item_code: Like(`${prefix}-%`) },
        order: { id: 'DESC' },
      });
      let nextNum = 1;
      if (lastItem) {
        const lastNum = parseInt(lastItem.item_code.split('-')[1]);
        nextNum = lastNum + 1;
      }
      dto.item_code = `${prefix}-${String(nextNum).padStart(3, '0')}`;
    }

    const existingItem = await this.itemsRepository.findOne({ where: { item_code: dto.item_code } });
    if (existingItem) {
      throw new ConflictException(`Item with code ${dto.item_code} already exists`);
    }
    const item = this.itemsRepository.create(dto);
    return this.itemsRepository.save(item);
  }

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

  /**
   * ✅ UPDATE: Yeh method ab delete karne se pehle check karega.
   */
  async remove(id: number): Promise<void> {
    // Step 1: Item ko uske relationships ke saath find karein
    const item = await this.itemsRepository.findOne({
      where: { id },
      relations: ['salesOrderItems'], // Yahan saare relations ke naam daalein
    });

    if (!item) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }

    // Step 2: Check karein ki item kahin use ho raha hai ya nahi
    const isBeingUsed = item.salesOrderItems && item.salesOrderItems.length > 0;
    
    if (isBeingUsed) {
      // Step 3: Agar item use ho raha hai, to user-friendly error dein
      throw new ConflictException(
        'This item cannot be deleted as it is linked to existing transactions (e.g., Sales Orders).',
      );
    }

    // Step 4: Agar item use nahi ho raha, tab hi use soft-delete karein
    const result = await this.itemsRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Item with ID #${id} not found`);
    }
  }
}