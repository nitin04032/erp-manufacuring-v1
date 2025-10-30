import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Grn } from './entities/grn.entity';
import { GrnItem } from './entities/grn-item.entity';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { Item } from '../items/item.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

@Injectable()
export class GrnService {
  constructor(
    @InjectRepository(Grn) private readonly grnRepo: Repository<Grn>,
    @InjectRepository(GrnItem) private readonly grnItemRepo: Repository<GrnItem>,
    @InjectRepository(Item) private readonly itemRepo: Repository<Item>,
    @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
    private readonly dataSource: DataSource,
  ) {}

  private async generateGrnNumber(): Promise<string> {
    const last = await this.grnRepo.findOne({ order: { id: 'DESC' } });
    const next = last ? last.id + 1 : 1;
    return `GRN-${String(next).padStart(6, '0')}`;
  }

  async create(dto: CreateGrnDto): Promise<Grn> {
    const warehouse = await this.warehouseRepo.findOne({ where: { id: dto.warehouse_id } });
    if (!warehouse) throw new NotFoundException('Warehouse not found.');

    // Validate items exist
    const itemIds = dto.items.map(i => i.item_id);
    const items = await this.itemRepo.findByIds(itemIds);
    if (items.length !== itemIds.length) throw new BadRequestException('One or more items not found.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const grnNumber = await this.generateGrnNumber();
      const grn = this.grnRepo.create({
        grn_number: grnNumber,
        grn_date: dto.grn_date,
        warehouse,
        supplier_ref: dto.supplier_ref,
        status: 'pending' as any,
      });

      const savedGrn = await queryRunner.manager.save(Grn, grn);

      const grnItems: GrnItem[] = dto.items.map(i => {
        const item = items.find(it => it.id === i.item_id)!;
        return this.grnItemRepo.create({
          grn: savedGrn,
          item,
          received_qty: i.received_qty,
          remarks: i.remarks,
        });
      });

      await queryRunner.manager.save(GrnItem, grnItems);
      await queryRunner.commitTransaction();

      return this.grnRepo.findOne({ where: { id: savedGrn.id } });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params?: { status?: string; search?: string }): Promise<Grn[]> {
    const qb = this.grnRepo.createQueryBuilder('grn').leftJoinAndSelect('grn.items', 'items').leftJoinAndSelect('grn.warehouse', 'warehouse');
    if (params?.status) qb.andWhere('grn.status = :status', { status: params.status });
    if (params?.search) qb.andWhere('(grn.grn_number ILIKE :q OR warehouse.name ILIKE :q)', { q: `%${params.search}%` });
    qb.orderBy('grn.grn_date', 'DESC');
    return qb.getMany();
  }

  async findOne(id: number): Promise<Grn> {
    const grn = await this.grnRepo.findOne({ where: { id } });
    if (!grn) throw new NotFoundException('GRN not found.');
    return grn;
  }

  async update(id: number, dto: UpdateGrnDto): Promise<Grn> {
    const grn = await this.grnRepo.findOne({ where: { id } });
    if (!grn) throw new NotFoundException('GRN not found.');

    if (dto.warehouse_id) {
      const warehouse = await this.warehouseRepo.findOne({ where: { id: dto.warehouse_id } });
      if (!warehouse) throw new NotFoundException('Warehouse not found.');
      grn.warehouse = warehouse;
    }

    if (dto.grn_date) grn.grn_date = dto.grn_date;
    if (dto.supplier_ref !== undefined) grn.supplier_ref = dto.supplier_ref;
    if (dto.status) grn.status = dto.status as any;

    return this.grnRepo.save(grn);
  }

  async remove(id: number): Promise<void> {
    const res = await this.grnRepo.delete(id);
    if (!res.affected) throw new NotFoundException('GRN not found.');
  }
}
