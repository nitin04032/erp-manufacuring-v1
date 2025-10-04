import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Not } from 'typeorm';
import { Supplier } from './supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { QuerySupplierDto } from './dto/query-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    // Auto-generate supplier code if not provided
    if (!createSupplierDto.supplier_code) {
      const lastSupplier = await this.suppliersRepository.findOne({
        order: { id: 'DESC' },
        where: {}, // Necessary for TypeORM versions < 0.3
      });
      let newCode = 'SUP-001';
      if (lastSupplier && lastSupplier.supplier_code) {
        const lastNum = parseInt(lastSupplier.supplier_code.split('-')[1]);
        const nextNum = lastNum + 1;
        newCode = `SUP-${String(nextNum).padStart(3, '0')}`;
      }
      createSupplierDto.supplier_code = newCode;
    }

    // Check for duplicate code or email before creating
    const existing = await this.suppliersRepository.findOne({
      where: [
        { email: createSupplierDto.email },
        { supplier_code: createSupplierDto.supplier_code },
      ],
    });

    if (existing) {
      throw new ConflictException(
        'Supplier with this email or code already exists',
      );
    }

    const newSupplier = this.suppliersRepository.create(createSupplierDto);
    return this.suppliersRepository.save(newSupplier);
  }

  // Server-side filtering and searching
  findAll(query: QuerySupplierDto): Promise<Supplier[]> {
    const { status, search } = query;
    const options: FindManyOptions<Supplier> = {
      order: { name: 'ASC' },
    };
    const where: any = {};

    if (status) {
      where.is_active = status === 'active';
    }

    if (search) {
      const searchQuery = Like(`%${search}%`);
      // Apply search across multiple fields, combined with status filter
      options.where = [
        { ...where, name: searchQuery },
        { ...where, supplier_code: searchQuery },
        { ...where, contact_person: searchQuery },
        { ...where, email: searchQuery },
      ];
    } else if (Object.keys(where).length > 0) {
      // Apply only the status filter if no search term is provided
      options.where = where;
    }

    return this.suppliersRepository.find(options);
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID #${id} not found`);
    }
    return supplier;
  }

  async update(
    id: number,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    // Check for email conflict on update, excluding the current supplier
    if (updateSupplierDto.email) {
      const existing = await this.suppliersRepository.findOne({
        where: { email: updateSupplierDto.email, id: Not(id) },
      });
      if (existing) {
        throw new ConflictException('Email is already in use by another supplier.');
      }
    }

    const supplier = await this.suppliersRepository.preload({
      id,
      ...updateSupplierDto,
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID #${id} not found`);
    }
    return this.suppliersRepository.save(supplier);
  }

  async remove(id: number): Promise<void> {
    const result = await this.suppliersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Supplier with ID #${id} not found`);
    }
  }

  count(): Promise<number> {
    return this.suppliersRepository.count();
  }
}