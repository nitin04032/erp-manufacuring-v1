import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from './supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const newSupplier = this.suppliersRepository.create(createSupplierDto);
    return this.suppliersRepository.save(newSupplier);
  }

  findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find();
  }

  async findOne(id: number): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOneBy({ id });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID #${id} not found`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.suppliersRepository.preload({
      id: id,
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
}