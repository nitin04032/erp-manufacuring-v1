import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StockItem } from './stock-item.entity';
import { StockLedger } from './stock-ledger.entity';

/**
 * InventoryService provides simple atomic helpers:
 * - checkAvailability(item_id, warehouse_id, qty, queryRunner?)
 * - decreaseStock(item_id, warehouse_id, qty, opts)
 * - increaseStock(item_id, warehouse_id, qty, opts)
 *
 * opts: { reference_type, reference_id, remarks, queryRunner }
 */
@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepo: Repository<StockItem>,
    @InjectRepository(StockLedger)
    private stockLedgerRepo: Repository<StockLedger>,
  ) {}

  // helper: fetch StockItem with optional queryRunner
  private async findStockRow(
    item_id: number,
    warehouse_id: number,
    qr?: QueryRunner,
  ): Promise<StockItem | null> {
    const repo = qr ? qr.manager.getRepository(StockItem) : this.stockItemRepo;
    return repo.findOne({ where: { item_id, warehouse_id } });
  }

  // check availability (throws if not enough)
  async checkAvailability(
    item_id: number,
    warehouse_id: number,
    qty: number,
    qr?: QueryRunner,
  ) {
    const row = await this.findStockRow(item_id, warehouse_id, qr);
    const available = row ? Number(row.quantity) : 0;
    if (available < qty) {
      throw new BadRequestException(
        `Insufficient stock for item ${item_id} in warehouse ${warehouse_id}. Available ${available}, required ${qty}`,
      );
    }
    return true;
  }

  // decreaseStock: will create or update stock_items row and create a stock_ledger entry
  async decreaseStock(
    item_id: number,
    warehouse_id: number,
    qty: number,
    opts: {
      reference_type?: string;
      reference_id?: number;
      remarks?: string;
      queryRunner?: QueryRunner;
    } = {},
  ) {
    if (qty <= 0) throw new BadRequestException('Quantity must be > 0');

    const {
      reference_type = 'unknown',
      reference_id = null,
      remarks = null,
      queryRunner,
    } = opts;
    const repo = queryRunner
      ? queryRunner.manager.getRepository(StockItem)
      : this.stockItemRepo;
    const ledgerRepo = queryRunner
      ? queryRunner.manager.getRepository(StockLedger)
      : this.stockLedgerRepo;

    // lock/select for update if queryRunner used (depends on DB isolation)
    let row = await repo.findOne({ where: { item_id, warehouse_id } });
    const prevQty = row ? Number(row.quantity) : 0;
    if (prevQty < qty) {
      throw new BadRequestException(
        `Insufficient stock. Item ${item_id} in warehouse ${warehouse_id}.`,
      );
    }

    const newQty = prevQty - qty;

    if (row) {
      row.quantity = newQty.toFixed(3);
      row.updated_at = new Date();
      await repo.save(row);
    } else {
      // this case won't normally happen because prevQty < qty caught earlier,
      // but handle for safety.
      row = repo.create({ item_id, warehouse_id, quantity: (0).toFixed(3) });
      await repo.save(row);
    }

    // push ledger
    const ledger = ledgerRepo.create({
      item_id: item_id,
      warehouse_id: warehouse_id,
      qty_in: (0).toFixed(3),
      qty_out: qty.toFixed(3),
      balance: newQty.toFixed(3),
      reference_type: reference_type,
      reference_id: reference_id ?? null,
      remarks: remarks ?? null,
    });
    await ledgerRepo.save(ledger);
    return { newQty };
  }

  // increaseStock: increment and create ledger
  async increaseStock(
    item_id: number,
    warehouse_id: number,
    qty: number,
    opts: {
      reference_type?: string;
      reference_id?: number;
      remarks?: string;
      queryRunner?: QueryRunner;
    } = {},
  ) {
    if (qty <= 0) throw new BadRequestException('Quantity must be > 0');

    const {
      reference_type = 'unknown',
      reference_id = null,
      remarks = null,
      queryRunner,
    } = opts;
    const repo = queryRunner
      ? queryRunner.manager.getRepository(StockItem)
      : this.stockItemRepo;
    const ledgerRepo = queryRunner
      ? queryRunner.manager.getRepository(StockLedger)
      : this.stockLedgerRepo;

    let row = await repo.findOne({ where: { item_id, warehouse_id } });
    const prevQty = row ? Number(row.quantity) : 0;
    const newQty = prevQty + qty;

    if (row) {
      row.quantity = newQty.toFixed(3);
      row.updated_at = new Date();
      await repo.save(row);
    } else {
      row = repo.create({ item_id, warehouse_id, quantity: newQty.toFixed(3) });
      await repo.save(row);
    }

    const ledger = ledgerRepo.create({
      item_id: item_id,
      warehouse_id: warehouse_id,
      qty_in: qty.toFixed(3),
      qty_out: (0).toFixed(3),
      balance: newQty.toFixed(3),
      reference_type: reference_type,
      reference_id: reference_id ?? null,
      remarks: remarks ?? null,
    });
    await ledgerRepo.save(ledger);
    return { newQty };
  }

  // convenience: get balance
  async getBalance(item_id: number, warehouse_id: number, qr?: QueryRunner) {
    const row = await this.findStockRow(item_id, warehouse_id, qr);
    return row ? Number(row.quantity) : 0;
  }
}
