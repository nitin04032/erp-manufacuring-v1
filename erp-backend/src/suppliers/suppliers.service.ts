import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Supplier } from './supplier.entity';
import { CreateSupplierDto, QuerySupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    if (!dto.supplier_code) {
      const last = await this.repo.findOne({
        order: { id: 'DESC' },
        withDeleted: false,
      });
      const nextNum = last?.supplier_code
        ? parseInt(last.supplier_code.split('-')[1]) + 1
        : 1;
      dto.supplier_code = `SUP-${String(nextNum).padStart(3, '0')}`;
    }

    const duplicate = await this.repo.findOne({
      where: [{ email: dto.email }, { supplier_code: dto.supplier_code }],
    });
    if (duplicate)
      throw new ConflictException('Supplier with this email or code exists.');

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(query: QuerySupplierDto): Promise<Supplier[]> {
    const where: any = {};

    if (query.status)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-enum-comparison
      where.is_active = query.status === 'active' ? true : false;

    if (query.search) {
      return this.repo.find({
        where: [
          { ...where, name: ILike(`%${query.search}%`) },

          { ...where, supplier_code: ILike(`%${query.search}%`) },

          { ...where, contact_person: ILike(`%${query.search}%`) },

          { ...where, email: ILike(`%${query.search}%`) },
        ],
        order: { name: 'ASC' },
      });
    }

    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.repo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Supplier not found');

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.repo.findOne({
        where: { email: dto.email },
      });
      if (emailExists)
        throw new ConflictException('Email already used by another supplier');
    }

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Supplier not found');
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
