import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Bom } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { CreateBomDto } from './dto/create-bom.dto';
import { UpdateBomDto } from './dto/update-bom.dto';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(Bom) private bomRepo: Repository<Bom>,
    @InjectRepository(BomItem) private bomItemRepo: Repository<BomItem>,
    private dataSource: DataSource, // DataSource को Inject करें
  ) {}

  async create(createDto: CreateBomDto) {
    // सारे ऑपरेशन्स को एक ट्रांजैक्शन में चलाएं
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const bom = transactionalEntityManager.create(Bom, {
        name: createDto.name,
        code: createDto.code,
        description: createDto.description,
        status: createDto.status || 'active',
      });
      const savedBom = await transactionalEntityManager.save(bom);

      const items = createDto.items.map((it) =>
        transactionalEntityManager.create(BomItem, {
          bom_id: savedBom.id,
          item_id: it.item_id,
          qty: it.qty,
          uom: it.uom,
          remarks: it.remarks,
        }),
      );
      await transactionalEntityManager.save(items);

      // ट्रांजैक्शन से ही फाइनल डेटा पाएं
      return transactionalEntityManager.findOne(Bom, {
        where: { id: savedBom.id },
        relations: ['items'],
      });
    });
  }

  async findAll() {
    return this.bomRepo.find({ relations: ['items'], order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const bom = await this.bomRepo.findOne({ where: { id }, relations: ['items'] });
    if (!bom) {
      throw new NotFoundException('BOM not found');
    }
    return bom;
  }

  async update(id: number, updateDto: UpdateBomDto) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const bom = await transactionalEntityManager.findOne(Bom, { where: { id } });
      if (!bom) {
        throw new NotFoundException('BOM not found');
      }

      transactionalEntityManager.merge(Bom, bom, updateDto);
      await transactionalEntityManager.save(Bom, bom);

      // अगर items अपडेट हो रहे हैं, तो पुराने डिलीट करके नए सेव करें
      if (updateDto.items) {
        await transactionalEntityManager.delete(BomItem, { bom_id: id });
        const items = updateDto.items.map((it) =>
          transactionalEntityManager.create(BomItem, {
            bom_id: id,
            item_id: it.item_id,
            qty: it.qty,
            uom: it.uom,
            remarks: it.remarks,
          }),
        );
        await transactionalEntityManager.save(BomItem, items);
      }

      return transactionalEntityManager.findOne(Bom, {
        where: { id },
        relations: ['items'],
      });
    });
  }

  async remove(id: number) {
    // डिलीट करने से पहले चेक करें कि BOM मौजूद है या नहीं
    await this.findOne(id);
    
    // **नोट**: सबसे अच्छे तरीके के लिए, अपनी Bom Entity में onDelete: 'CASCADE' सेट करें।
    // इससे संबंधित सभी BomItem अपने आप डिलीट हो जाएंगे।
    
    // अब BOM को डिलीट करें
    const res = await this.bomRepo.delete(id);
    
    // Optional chaining (?) का उपयोग करना ज्यादा सुरक्षित है
    return !!(res && res.affected && res.affected > 0);
  }
}