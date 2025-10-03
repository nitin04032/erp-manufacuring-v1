import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    // ✅ Check for duplicates before saving to prevent errors
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code: dto.code },
    });

    if (existingWarehouse) {
      throw new ConflictException('Warehouse with this code already exists');
    }

    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  findAll(): Promise<Warehouse[]> {
    // ✅ Sort by the correct 'name' field
    return this.warehouseRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOneBy({ id });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID #${id} not found`);
    }
    return warehouse;
  }

  async update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.preload({ id, ...dto });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID #${id} not found`);
    }
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: number): Promise<void> {
    const result = await this.warehouseRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Warehouse with ID #${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.warehouseRepository.count();
  }
}