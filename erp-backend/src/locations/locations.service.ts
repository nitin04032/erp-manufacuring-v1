import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  async create(dto: CreateLocationDto): Promise<Location> {
    // Duplicate check on code
    const existing = await this.repo.findOne({ where: { location_code: dto.location_code } });
    if (existing) throw new ConflictException('Location code already exists');

    const loc = this.repo.create({
      ...dto,
      warehouse_id: dto.warehouse_id ?? null,
    });
    return this.repo.save(loc);
  }

  findAll(): Promise<Location[]> {
    return this.repo.find({ order: { location_name: 'ASC' } });
  }

  async findOne(id: number): Promise<Location> {
    const loc = await this.repo.findOne({ where: { id } });
    if (!loc) throw new NotFoundException(`Location with ID ${id} not found`);
    return loc;
  }

  async update(id: number, dto: UpdateLocationDto): Promise<Location> {
    const loc = await this.repo.preload({ id, ...dto });
    if (!loc) throw new NotFoundException(`Location with ID ${id} not found`);
    return this.repo.save(loc);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.delete(id);
    if (res.affected === 0) throw new NotFoundException(`Location with ID ${id} not found`);
  }

  count(): Promise<number> {
    return this.repo.count();
  }
}
