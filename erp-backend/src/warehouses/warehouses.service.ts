import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly repo: Repository<Warehouse>,
  ) {}

  /**
   * Create a warehouse. If no code provided, auto-generate as WH-001 style.
   */
  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    // 1. Create a new object to hold all data, starting with the DTO.
    const dataToSave: Partial<Warehouse> = { ...dto };

    // 2. Generate the code and add it to our new object.
    if (!dataToSave.code) {
      const last = await this.repo.findOne({
        order: { id: 'DESC' },
        withDeleted: false,
      });
      const nextNum = last?.code
        ? parseInt(String(last.code).split('-').pop() || '0', 10) + 1
        : 1;
      dataToSave.code = `WH-${String(nextNum).padStart(3, '0')}`;
    }

    // 3. Check for conflicts using the final code.
    const existing = await this.repo.findOne({
      where: [{ code: dataToSave.code }, { name: dataToSave.name }],
    });
    if (existing) {
      throw new ConflictException(
        'Warehouse with same code or name already exists.',
      );
    }

    // 4. Pass the complete object directly to save().
    // This creates and saves the entity in one step and correctly returns a single Warehouse.
    return this.repo.save(dataToSave);
  }

  /**
   * Find all warehouses with optional filters: status (active/inactive), search (name/code/city)
   */
  async findAll(params?: {
    status?: string;
    search?: string;
  }): Promise<Warehouse[]> {
    const where: any = {};

    if (params?.status) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      where.is_active = params.status === 'active';
    }

    if (params?.search) {
      const q = params.search;
      return this.repo.find({
        where: [
          { ...where, name: ILike(`%${q}%`) },

          { ...where, code: ILike(`%${q}%`) },

          { ...where, city: ILike(`%${q}%`) },
        ],
        order: { name: 'ASC' },
      });
    }

    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Warehouse> {
    const w = await this.repo.findOne({ where: { id } });
    if (!w) throw new NotFoundException('Warehouse not found.');
    return w;
  }

  async update(id: number, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Warehouse not found.');

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.repo.findOne({ where: { code: dto.code } });
      if (codeExists) throw new ConflictException('Code already in use.');
    }

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  /**
   * Soft delete (keeps data for audits)
   */
  async remove(id: number): Promise<void> {
    const res = await this.repo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Warehouse not found');
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
