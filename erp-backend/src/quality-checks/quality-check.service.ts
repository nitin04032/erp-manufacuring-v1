import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { QualityCheck } from './quality-check.entity';
import { QualityCheckItem } from './quality-check-item.entity';
import { CreateQualityCheckDto } from './dto/create-quality-check.dto';
import { UpdateQualityCheckDto } from './dto/update-quality-check.dto';
import { Grn } from '../grn/grn.entity';
import { Item } from '../items/item.entity';

@Injectable()
export class QualityCheckService {
  constructor(
    @InjectRepository(QualityCheck)
    private qcRepo: Repository<QualityCheck>,
    @InjectRepository(Grn)
    private grnRepo: Repository<Grn>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
  ) {}

  private async generateQcNumber(): Promise<string> {
    const lastQc = await this.qcRepo.findOne({
      where: {},
      order: { id: 'DESC' },
    });
    const nextId = (lastQc?.id || 0) + 1;
    return `QC-${String(nextId).padStart(5, '0')}`;
  }

  async create(dto: CreateQualityCheckDto): Promise<QualityCheck> {
    // Fetch the GRN with its items relation to avoid errors
    const grn = await this.grnRepo.findOne({
      where: { id: dto.grn_id },
      relations: ['items', 'items.item'],
    });
    if (!grn) {
      throw new NotFoundException(`GRN with ID ${dto.grn_id} not found.`);
    }

    const qc = new QualityCheck();
    qc.qc_number = await this.generateQcNumber();
    qc.qc_date = new Date(dto.qc_date);
    qc.grn = grn;
    qc.inspector = dto.inspector;
    qc.remarks = dto.remarks;
    qc.status = dto.status;

    const qcItems: QualityCheckItem[] = [];
    for (const itemDto of dto.items) {
      const item = await this.itemRepo.findOneBy({ id: itemDto.item_id });
      if (!item) {
        throw new NotFoundException(`Item with ID ${itemDto.item_id} not found.`);
      }
      
      // Find the corresponding item in the GRN to get the received quantity
      const grnItem = grn.items.find((i) => i.item.id === item.id);

      const newItem = new QualityCheckItem();
      newItem.item = item;
      newItem.received_qty = grnItem?.received_qty || 0;
      newItem.checked_qty = itemDto.checked_qty;
      newItem.passed_qty = itemDto.passed_qty;
      newItem.failed_qty = itemDto.failed_qty;
      newItem.remarks = itemDto.remarks;
      qcItems.push(newItem);
    }
    qc.items = qcItems;

    return this.qcRepo.save(qc);
  }

  async findAll(status?: string): Promise<any[]> {
    // Add explicit type for query options for better type safety
    const options: FindManyOptions<QualityCheck> = {
      where: {},
      order: { qc_date: 'DESC' },
      relations: ['grn'],
    };
    if (status) {
      options.where = { status };
    }
    const qcs = await this.qcRepo.find(options);

    // Transform data for the frontend
    return qcs.map((qc) => ({
      id: qc.id,
      qc_number: qc.qc_number,
      qc_date: qc.qc_date,
      // Use the correct property name 'grn_number'
      grn_number: qc.grn?.grn_number,
      inspector: qc.inspector,
      status: qc.status,
      items_count: qc.items?.length || 0,
    }));
  }

  async findOne(id: number): Promise<QualityCheck> {
    const qc = await this.qcRepo.findOne({
      where: { id },
      relations: ['grn', 'items', 'items.item'],
    });
    if (!qc) {
      throw new NotFoundException(`Quality Check #${id} not found.`);
    }
    return qc;
  }

  async update(id: number, dto: UpdateQualityCheckDto): Promise<QualityCheck> {
    const qc = await this.findOne(id);
    if (qc.status !== 'pending') {
      throw new BadRequestException(
        `Cannot edit a QC that is already ${qc.status}.`,
      );
    }

    Object.assign(qc, {
      qc_date: dto.qc_date ? new Date(dto.qc_date) : qc.qc_date,
      inspector: dto.inspector,
      remarks: dto.remarks,
      status: dto.status,
    });

    if (dto.items) {
      for (const itemDto of dto.items) {
        const itemToUpdate = qc.items.find((i) => i.item.id === itemDto.item_id);
        if (itemToUpdate) {
          Object.assign(itemToUpdate, itemDto);
        }
      }
    }

    return this.qcRepo.save(qc);
  }

  async remove(id: number): Promise<void> {
    const result = await this.qcRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Quality Check #${id} not found.`);
    }
  }
}