import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto, QueryCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

// Mirrors erp-backend/src/suppliers/suppliers.service.ts
@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly repo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    if (!dto.customer_code) {
      const last = await this.repo.findOne({
        where: {},
        order: { id: 'DESC' },
        withDeleted: false,
      });
      const nextNum = last?.customer_code
        ? parseInt(last.customer_code.split('-')[1]) + 1
        : 1;
      dto.customer_code = `CUST-${String(nextNum).padStart(3, '0')}`;
    }

    const duplicate = await this.repo.findOne({
      where: [{ email: dto.email }, { customer_code: dto.customer_code }],
    });
    if (duplicate)
      throw new ConflictException('Customer with this email or code exists.');

    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(query: QueryCustomerDto): Promise<Customer[]> {
    const where: any = {};

    if (query.status)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-enum-comparison
      where.is_active = query.status === 'active' ? true : false;

    if (query.search) {
      return this.repo.find({
        where: [
          { ...where, name: ILike(`%${query.search}%`) },
          { ...where, customer_code: ILike(`%${query.search}%`) },
          { ...where, contact_person: ILike(`%${query.search}%`) },
          { ...where, email: ILike(`%${query.search}%`) },
        ],
        order: { name: 'ASC' },
      });
    }

    return this.repo.find({ where, order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.repo.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Customer not found');

    if (dto.email && dto.email !== existing.email) {
      const emailExists = await this.repo.findOne({
        where: { email: dto.email },
      });
      if (emailExists)
        throw new ConflictException('Email already used by another customer');
    }

    Object.assign(existing, dto);
    return this.repo.save(existing);
  }

  async remove(id: number): Promise<void> {
    const res = await this.repo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Customer not found');
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}
