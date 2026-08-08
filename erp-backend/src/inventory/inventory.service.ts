import { Injectable, BadRequestException } from '@nestjs/common';
import { Repository, QueryRunner } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StockItem } from './stock-item.entity';
import { StockLedger } from './stock-ledger.entity';

/**
 * InventoryService provides simple atomic helpers:
 * - checkAvailability(item_id, warehouse_id, qty, companyId, queryRunner?)
 * - decreaseStock(item_id, warehouse_id, qty, companyId, opts)
 * - increaseStock(item_id, warehouse_id, qty, companyId, opts)
 *
 * opts: { reference_type, reference_id, remarks, queryRunner }
 *
 * Multi-company Phase 1: every method takes companyId — item_id/warehouse_id
 * alone already belong to exactly one company transitively, but stock_items/
 * stock_ledger carry their own company_id column too (see Multi-Company
 * Architecture Audit §6) so every query here filters directly on it rather
 * than trusting an unscoped item_id/warehouse_id pair.
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
    companyId: number,
    qr?: QueryRunner,
  ): Promise<StockItem | null> {
    const repo = qr ? qr.manager.getRepository(StockItem) : this.stockItemRepo;
    return repo.findOne({ where: { item_id, warehouse_id, company_id: companyId } });
  }

  // check availability (throws if not enough)
  async checkAvailability(
    item_id: number,
    warehouse_id: number,
    qty: number,
    companyId: number,
    qr?: QueryRunner,
  ) {
    const row = await this.findStockRow(item_id, warehouse_id, companyId, qr);
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
    companyId: number,
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
    let row = await repo.findOne({ where: { item_id, warehouse_id, company_id: companyId } });
    const prevQty = row ? Number(row.quantity) : 0;
    if (prevQty < qty) {
      throw new BadRequestException(
        `Insufficient stock. Item ${item_id} in warehouse ${warehouse_id}.`,
      );
    }

    const newQty = prevQty - qty;

    if (row) {
      row.quantity = newQty;
      row.updated_at = new Date();
      await repo.save(row);
    } else {
      // this case won't normally happen because prevQty < qty caught earlier,
      // but handle for safety.
      row = repo.create({ item_id, warehouse_id, company_id: companyId, quantity: 0 });
      await repo.save(row);
    }

    // push ledger
    const ledger = ledgerRepo.create({
      company_id: companyId,
      item_id,
      warehouse_id,
      qty_in: 0,
      qty_out: qty,
      balance: newQty,
      reference_type,
      reference_id: reference_id ?? null,
      remarks: remarks ?? null,
    } as StockLedger);
    await ledgerRepo.save(ledger);
    return { newQty };
  }

  // increaseStock: increment and create ledger
  async increaseStock(
    item_id: number,
    warehouse_id: number,
    qty: number,
    companyId: number,
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

    let row = await repo.findOne({ where: { item_id, warehouse_id, company_id: companyId } });
    const prevQty = row ? Number(row.quantity) : 0;
    const newQty = prevQty + qty;

    if (row) {
      row.quantity = newQty;
      row.updated_at = new Date();
      await repo.save(row);
    } else {
      row = repo.create({
        item_id,
        warehouse_id,
        company_id: companyId,
        quantity: newQty,
      });
      await repo.save(row);
    }

    const ledger = ledgerRepo.create({
      company_id: companyId,
      item_id,
      warehouse_id,
      qty_in: qty,
      qty_out: 0,
      balance: newQty,
      reference_type,
      reference_id: reference_id ?? null,
      remarks: remarks ?? null,
    } as StockLedger);
    await ledgerRepo.save(ledger);
    return { newQty };
  }

  // convenience: get balance
  async getBalance(item_id: number, warehouse_id: number, companyId: number, qr?: QueryRunner) {
    const row = await this.findStockRow(item_id, warehouse_id, companyId, qr);
    return row ? Number(row.quantity) : 0;
  }

  // --- Dashboard & Analytics ---
  // StockItem carries no TypeORM relations (just numeric item_id/warehouse_id),
  // so these join against the 'items'/'warehouses' tables directly by id.

  async getTotalStockValue(companyId: number): Promise<number> {
    const result = await this.stockItemRepo
      .createQueryBuilder('si')
      .innerJoin('items', 'item', 'item.id = si.item_id')
      .where('si.company_id = :companyId', { companyId })
      .select('SUM(si.quantity * item.purchase_rate)', 'totalValue')
      .getRawOne<{ totalValue: string | null }>();
    return parseFloat(result?.totalValue ?? '0') || 0;
  }

  /** Base query joining stock_items -> items -> warehouses, flattened for reporting/dashboard use. */
  private stockDetailsQuery(companyId: number) {
    return this.stockItemRepo
      .createQueryBuilder('si')
      .innerJoin('items', 'item', 'item.id = si.item_id')
      .innerJoin('warehouses', 'wh', 'wh.id = si.warehouse_id')
      .where('si.company_id = :companyId', { companyId })
      .select([
        'si.id AS id',
        'si.item_id AS item_id',
        'si.warehouse_id AS warehouse_id',
        'si.quantity AS quantity',
        'item.name AS item_name',
        'item.sku AS item_code',
        'item.unit AS uom',
        'item.reorder_level AS reorder_level',
        'wh.name AS warehouse_name',
      ]);
  }

  async getLowStockItems(companyId: number, limit = 10): Promise<StockDetailRow[]> {
    return this.stockDetailsQuery(companyId)
      .andWhere('si.quantity <= item.reorder_level AND item.reorder_level > 0')
      .orderBy('si.quantity', 'ASC')
      .limit(limit)
      .getRawMany();
  }

  /** All current stock rows with item/warehouse details, for the stock report and current-stock page. */
  async getAllStockWithDetails(
    companyId: number,
    filters?: {
      search?: string;
      warehouse_id?: number;
    },
  ): Promise<StockDetailRow[]> {
    const qb = this.stockDetailsQuery(companyId);
    if (filters?.warehouse_id) {
      qb.andWhere('si.warehouse_id = :warehouse_id', {
        warehouse_id: filters.warehouse_id,
      });
    }
    if (filters?.search) {
      qb.andWhere('(item.name ILIKE :q OR item.sku ILIKE :q)', {
        q: `%${filters.search}%`,
      });
    }
    return qb.orderBy('item.name', 'ASC').getRawMany();
  }

  /** Stock ledger entries with item/warehouse details, for the stock ledger page. */
  async getLedger(
    companyId: number,
    filters?: {
      search?: string;
      warehouse_id?: number;
    },
  ): Promise<LedgerRow[]> {
    const qb = this.stockLedgerRepo
      .createQueryBuilder('sl')
      .innerJoin('items', 'item', 'item.id = sl.item_id')
      .innerJoin('warehouses', 'wh', 'wh.id = sl.warehouse_id')
      .where('sl.company_id = :companyId', { companyId })
      .select([
        'sl.id AS id',
        'sl.created_at AS transaction_date',
        'item.sku AS item_code',
        'item.name AS item_name',
        'wh.name AS warehouse_name',
        'sl.qty_in AS in_qty',
        'sl.qty_out AS out_qty',
        'sl.balance AS balance_qty',
        'sl.reference_type AS reference_type',
        'sl.reference_id AS reference_id',
        'sl.remarks AS remarks',
      ]);
    if (filters?.warehouse_id) {
      qb.andWhere('sl.warehouse_id = :warehouse_id', {
        warehouse_id: filters.warehouse_id,
      });
    }
    if (filters?.search) {
      qb.andWhere('(item.name ILIKE :q OR item.sku ILIKE :q)', {
        q: `%${filters.search}%`,
      });
    }
    return qb.orderBy('sl.created_at', 'DESC').limit(500).getRawMany();
  }
}

export interface StockDetailRow {
  id: number;
  item_id: number;
  warehouse_id: number;
  quantity: number;
  item_name: string;
  item_code: string | null;
  uom: string | null;
  reorder_level: number | null;
  warehouse_name: string;
}

export interface LedgerRow {
  id: number;
  transaction_date: string;
  item_code: string | null;
  item_name: string;
  warehouse_name: string;
  in_qty: number;
  out_qty: number;
  balance_qty: number;
  reference_type: string | null;
  reference_id: number | null;
  remarks: string | null;
}
