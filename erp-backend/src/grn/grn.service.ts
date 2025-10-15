import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,EntityManager, DataSource } from 'typeorm';
import { Grn } from './grn.entity';
import { CreateGrnDto } from './dto/create-grn.dto';
import { UpdateGrnDto } from './dto/update-grn.dto';
import { PurchaseOrder } from '../purchase-orders/purchase-order.entity';
import { StocksService } from '../stocks/stocks.service';
import { GrnItem } from './grn-item.entity';
import { Item } from '../items/item.entity';

@Injectable()
export class GrnService {
  constructor(
    @InjectRepository(Grn)
    private repo: Repository<Grn>,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    private stocksService: StocksService,
    // Inject DataSource to manage database transactions
    private dataSource: DataSource,
  ) {}

  /**
   * Creates a new GRN and updates stock levels within a single database transaction.
   */
  async create(dto: CreateGrnDto): Promise<Grn> {
    // 1. Fetch the Purchase Order with all its related items and warehouse info.
    const po = await this.poRepo.findOne({
      where: { id: dto.purchaseOrderId },
      relations: ['items', 'items.item', 'warehouse'], // Ensure warehouse is loaded
    });
    if (!po) {
      throw new NotFoundException(
        `Purchase Order #${dto.purchaseOrderId} not found`,
      );
    }
    if (!po.warehouse) {
      throw new BadRequestException(
        `Purchase Order #${po.id} does not have a warehouse assigned.`,
      );
    }

    // Resolve a warehouse_name string from the PO's warehouse object.
    // Try common property names and fall back to the id to avoid TS errors.
    const warehouseName =
      (po.warehouse as any).warehouse_name ??
      (po.warehouse as any).name ??
      (po.warehouse as any).warehouse ??
      String((po.warehouse as any).id);

    // 2. Use a database transaction for safety.
    // This ensures that either everything succeeds or everything fails together.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. Create the main GRN entity.
      const grn = new Grn();
      grn.purchaseOrder = po;
      grn.received_date = new Date(dto.received_date);
      grn.remarks = dto.remarks;
      grn.status = 'completed'; // Set status upon creation.

      let totalReceivedValue = 0;
      const grnItems: GrnItem[] = [];

      // 4. Process each item from the incoming data.
      for (const itemDto of dto.items) {
        // Find the matching item in the original PO for validation.
        const poItem = po.items.find(
          (i) => i.item.id === Number(itemDto.item_id),
        );
        if (!poItem) {
          throw new BadRequestException(
            `Item ID #${itemDto.item_id} was not found in the original PO.`,
          );
        }

        // Validate that the received quantity is not more than ordered.
        if (itemDto.received_qty > poItem.ordered_qty) {
          throw new BadRequestException(
            `Received quantity for item '${poItem.item.item_name}' (${itemDto.received_qty}) exceeds the ordered quantity (${poItem.ordered_qty}).`,
          );
        }

        // Create a specific GRN Item entity to be saved.
        const grnItem = new GrnItem();
        grnItem.item = poItem.item;
        grnItem.ordered_qty = poItem.ordered_qty;
        grnItem.received_qty = itemDto.received_qty;
        grnItem.unit_price = poItem.unit_price; // Store price at time of GRN
        grnItem.total_value = itemDto.received_qty * poItem.unit_price;

        grnItems.push(grnItem);
        totalReceivedValue += grnItem.total_value;

        // 5. Increase the stock level for this item.
        // Pass the queryRunner's manager to make this part of the transaction.
        await this.stocksService.increaseStock(
          poItem.item.id,
          warehouseName, // resolved warehouse name (fallbacks applied)
          itemDto.received_qty,
          queryRunner.manager, // optional manager to keep operation inside the same transaction
        );
      }

      grn.items = grnItems;
      grn.total_received_value = totalReceivedValue;

      // 6. Save the new GRN and its associated GrnItems.
      const savedGrn = await queryRunner.manager.save(grn);

      // TODO: Update the PO status based on received quantities (e.g., to 'partially_received' or 'completed')

      // 7. If everything is successful, commit the transaction.
      await queryRunner.commitTransaction();
      return savedGrn;
    } catch (err) {
      // 8. If any error occurs, roll back all changes.
      await queryRunner.rollbackTransaction();
      throw err; // Re-throw the original error.
    } finally {
      // 9. Always release the query runner to free up the database connection.
      await queryRunner.release();
    }
  }

  // --- Other Methods ---

  findAll(): Promise<Grn[]> {
    return this.repo.find({
      relations: ['purchaseOrder', 'items', 'items.item'],
      order: { received_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Grn> {
    const grn = await this.repo.findOne({
      where: { id },
      relations: ['purchaseOrder', 'items', 'items.item', 'purchaseOrder.supplier', 'purchaseOrder.warehouse'],
    });
    if (!grn) throw new NotFoundException(`GRN #${id} not found`);
    return grn;
  }

  /**
   * NOTE: A real-world 'update' or 'remove' operation is highly complex.
   * It would require reversing the original stock movements and applying
   * the new ones, which can cause cascading issues in an accounting system.
   * These operations should be handled with extreme care, often by creating
   * reversal entries rather than updating or deleting records.
   */
  async update(id: number, dto: UpdateGrnDto): Promise<Grn> {
    throw new BadRequestException('Updating a completed GRN is not supported. Please create a reversal document instead.');
  }

  async remove(id: number): Promise<void> {
    throw new BadRequestException('Deleting a completed GRN is not supported. Please create a reversal document instead.');
  }
  
  count(): Promise<number> {
    return this.repo.count();
  }
}