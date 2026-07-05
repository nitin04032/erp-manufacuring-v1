import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    dto.name = dto.name.trim();

    const exists = await this.repo.findOne({
      where: {
        name: ILike(dto.name),
      },
    });

    if (exists) {
      throw new ConflictException(
        'Role with same name already exists.',
      );
    }

    const entity = this.repo.create(dto);

    return this.repo.save(entity);
  }

  async findAll(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Role[]> {
    if (params?.search) {
      return this.repo.find({
        where: {
          name: ILike(`%${params.search}%`),
        },
        relations: {
          permissions: true,
        },
        order: {
          name: 'ASC',
        },
        take: params.limit,
        skip: params.offset,
      });
    }

    return this.repo.find({
      relations: {
        permissions: true,
      },
      order: {
        name: 'ASC',
      },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.repo.findOne({
      where: { id },
      relations: {
        permissions: true,
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }

  async update(
    id: number,
    dto: UpdateRoleDto,
  ): Promise<Role> {
    const role = await this.findOne(id);

    if (
      dto.name &&
      dto.name.toLowerCase() !== role.name.toLowerCase()
    ) {
      const exists = await this.repo.findOne({
        where: {
          name: ILike(dto.name),
        },
      });

      if (exists) {
        throw new ConflictException(
          'Role name already exists.',
        );
      }
    }

    Object.assign(role, dto);

    return this.repo.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);

    if (role.is_system) {
      throw new ForbiddenException(
        'System roles cannot be deleted.',
      );
    }

    const result = await this.repo.softDelete(id);

    if (!result.affected) {
      throw new NotFoundException('Role not found.');
    }
  }

  async count(): Promise<number> {
    return this.repo.count();
  }
}