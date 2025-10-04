// erp-backend/src/warehouses/warehouses.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { FindManyOptions } from 'typeorm';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    
    // Automatic code generation logic
    if (!dto.code) {
        const lastWarehouse = await this.warehouseRepository.findOne({
            order: { id: 'DESC' },
            where: {}, // Empty where condition is required for TypeORM v0.3.x
        });

        let newCode = 'WH-001';
        if (lastWarehouse && lastWarehouse.code) {
            const lastNum = parseInt(lastWarehouse.code.split('-')[1]);
            const nextNum = lastNum + 1;
            newCode = `WH-${String(nextNum).padStart(3, '0')}`;
        }
        dto.code = newCode;
    }

    // Duplicate code check
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { code: dto.code },
    });

    if (existingWarehouse) {
      throw new ConflictException('Warehouse with this code already exists');
    }

    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  // findAll function with filtering
  findAll(query?: { status?: string, search?: string }): Promise<Warehouse[]> {
    const options: FindManyOptions<Warehouse> = {
        order: { name: 'ASC' }
    };
    
    const where: any = {};

    if (query?.status) {
      where.is_active = query.status === 'active';
    }
    
    if (query?.search) {
      const searchQuery = Like(`%${query.search}%`);
      options.where = [
          { ...where, name: searchQuery },
          { ...where, code: searchQuery },
          { ...where, contact_person: searchQuery }
      ];
    } else if (Object.keys(where).length > 0) {
        options.where = where;
    }

    return this.warehouseRepository.find(options);
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