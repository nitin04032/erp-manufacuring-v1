import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectRepository(Item) private readonly repo: Repository<Item>) {}

  private async generateSku(): Promise<string> {
    const last = await this.repo.findOne({ order: { id: 'DESC' }, withDeleted: false });
    const nextNum = last?.sku ? parseInt(String(last.sku).split('-').pop() || '0', 10) + 1 : 1;
    return `ITEM-${String(nextNum).padStart(5, '0')}`;
  }

  async create(dto: CreateItemDto): Promise<Item> {
    if (!dto.sku) dto.sku = await this.generateSku();

    const existing = await this.repo.findOne({ where: [{ sku: dto.sku }, { name: dto.name }] });
    if (existing) throw new ConflictException('Item with same SKU or name already exists.');

    const entity = this.repo.create(dto as any) as unknown as Item;
    return this.repo.save(entity);
  }

  async findAll(params?: { search?: string; status?: string; limit?: number; offset?: number }): Promise<Item[]> {
    const where: any = {};
    if (params?.status) where.is_active = params.status === 'active';

    if (params?.search) {
      const q = params.search;
      return this.repo.find({
        where: [
          { ...where, name: ILike(`%${q}%`) },
          { ...where, sku: ILike(`%${q}%`) },
          { ...where, description: ILike(`%${q}%`) },
        ],
        order: { name: 'ASC' },
        take: params.limit,
        skip: params.offset,
      });
    }

    return this.repo.find({
      where,
      order: { name: 'ASC' },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found.');
    return item;
  }

  async update(id: number, dto: UpdateItemDto): Promise<Item> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found.');

    if (dto.sku && dto.sku !== item.sku) {
      const skuExists = await this.repo.findOne({ where: { sku: dto.sku } });
      if (skuExists) throw new ConflictException('SKU already in use.');
    }

    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Item not found.');
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
