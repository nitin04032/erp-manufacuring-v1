import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const exists = await this.warehouseRepo.findOne({ where: { code: dto.code } });
    if (exists) {
      throw new ConflictException('Warehouse code already exists');
    }
    const warehouse = this.warehouseRepo.create({ ...dto, is_active: dto.is_active ?? true });
    return this.warehouseRepo.save(warehouse);
  }

  findAll(): Promise<Warehouse[]> {
    return this.warehouseRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Warehouse> {
    const wh = await this.warehouseRepo.findOneBy({ id });
    if (!wh) throw new NotFoundException(`Warehouse with ID ${id} not found`);
    return wh;
  }

  async update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const wh = await this.warehouseRepo.preload({ id, ...dto });
    if (!wh) throw new NotFoundException(`Warehouse with ID ${id} not found`);
    return this.warehouseRepo.save(wh);
  }

  async remove(id: number): Promise<void> {
    const res = await this.warehouseRepo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Warehouse with ID ${id} not found`);
  }

  count(): Promise<number> {
    return this.warehouseRepo.count();
  }
}
