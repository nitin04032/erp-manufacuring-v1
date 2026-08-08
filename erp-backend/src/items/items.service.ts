import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { TenantScopedRepository } from '../common/tenant-scoped.repository';

/**
 * Reference implementation of TenantScopedRepository
 * (../common/tenant-scoped.repository.ts) — see that file's class-level
 * comment and V2_ARCHITECTURE.md §3. Every method still takes an explicit
 * companyId (unchanged public API, unchanged behavior), but now builds a
 * `new TenantScopedRepository(this.repo, companyId)` instead of manually
 * spreading `company_id: companyId` into every `where` clause — the
 * scoping can no longer be forgotten on a new query added to this file.
 */
@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item) private readonly repo: Repository<Item>,
  ) {}

  private scoped(companyId: number): TenantScopedRepository<Item> {
    return new TenantScopedRepository(this.repo, companyId);
  }

  private async generateSku(companyId: number): Promise<string> {
    const last = await this.scoped(companyId).findOne({
      where: {},
      order: { id: 'DESC' },
      withDeleted: false,
    });

    const nextNum = last?.sku
      ? parseInt(String(last.sku).split('-').pop() || '0', 10) + 1
      : 1;

    return `ITEM-${String(nextNum).padStart(5, '0')}`;
  }

  async create(dto: CreateItemDto, companyId: number): Promise<Item> {
    if (!dto.sku) dto.sku = await this.generateSku(companyId);
    const scoped = this.scoped(companyId);

    const existing = await scoped.findOne({
      where: [{ sku: dto.sku }, { name: dto.name }],
    });
    if (existing)
      throw new ConflictException('Item with same SKU or name already exists.');

    const entity = scoped.create({ ...dto } as Partial<Item>);
    return scoped.save(entity);
  }

  async findAll(
    companyId: number,
    params?: {
      search?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Item[]> {
    const scoped = this.scoped(companyId);
    const extra: Partial<Item> = {};
    if (params?.status) extra.is_active = params.status === 'active';

    if (params?.search) {
      const q = params.search;
      return scoped.find({
        where: [
          { ...extra, name: ILike(`%${q}%`) },
          { ...extra, sku: ILike(`%${q}%`) },
          { ...extra, description: ILike(`%${q}%`) },
        ],
        order: { name: 'ASC' },
        take: params.limit,
        skip: params.offset,
      });
    }

    return scoped.find({
      where: extra,
      order: { name: 'ASC' },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  async findOne(id: number, companyId: number): Promise<Item> {
    const item = await this.scoped(companyId).findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found.');
    return item;
  }

  /**
   * Resolve an item by its SKU/code. Used by modules (dispatch, FGR) that
   * only know the item's code, not its numeric id.
   */
  async findByCode(code: string, companyId: number): Promise<Item> {
    const item = await this.scoped(companyId).findOne({ where: { sku: code } });
    if (!item) throw new NotFoundException(`Item with code "${code}" not found.`);
    return item;
  }

  async update(id: number, dto: UpdateItemDto, companyId: number): Promise<Item> {
    const scoped = this.scoped(companyId);
    const item = await scoped.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Item not found.');

    if (dto.sku && dto.sku !== item.sku) {
      const skuExists = await scoped.findOne({ where: { sku: dto.sku } });
      if (skuExists) throw new ConflictException('SKU already in use.');
    }

    Object.assign(item, dto);
    return scoped.save(item);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const res = await this.scoped(companyId).softDelete({ id } as Partial<Item>);
    if (!res.affected) throw new NotFoundException('Item not found.');
  }

  async count(companyId: number): Promise<number> {
    return this.scoped(companyId).count();
  }
}
