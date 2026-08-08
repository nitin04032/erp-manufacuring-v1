/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ItemsService } from './items.service';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';

// Written alongside the TenantScopedRepository migration (see
// items.service.ts's class comment, V2_ARCHITECTURE.md §3) — this module
// had no test coverage before that refactor. Every case here doubles as a
// regression check that wrapping the repository didn't change observable
// behavior, and confirms company_id scoping actually reaches the
// underlying repository call on every method.
const COMPANY_A = 1;

describe('ItemsService', () => {
  let service: ItemsService;
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    softDelete: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((v: unknown) => v),
      save: jest.fn((v: Record<string, unknown>) =>
        Promise.resolve({ id: 1, ...v }),
      ),
      softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
      count: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsService,
        { provide: getRepositoryToken(Item), useValue: repo },
      ],
    }).compile();

    service = module.get<ItemsService>(ItemsService);
  });

  describe('create', () => {
    it("scopes the duplicate-check and the save to the caller's company", async () => {
      const dto: CreateItemDto = { sku: 'SKU-1', name: 'Widget' };
      await service.create(dto, COMPANY_A);

      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: [
            { company_id: COMPANY_A, sku: 'SKU-1' },
            { company_id: COMPANY_A, name: 'Widget' },
          ],
        }),
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: COMPANY_A,
          sku: 'SKU-1',
          name: 'Widget',
        }),
      );
    });

    it('throws ConflictException when an item with the same SKU/name already exists in this company', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 9, sku: 'SKU-1' });
      const dto: CreateItemDto = { sku: 'SKU-1', name: 'Widget' };
      await expect(service.create(dto, COMPANY_A)).rejects.toThrow(
        ConflictException,
      );
    });

    it('auto-generates a SKU scoped to this company when none is supplied', async () => {
      repo.findOne
        .mockResolvedValueOnce({ sku: 'ITEM-00003' })
        .mockResolvedValueOnce(null);
      const dto: CreateItemDto = { name: 'Widget' };
      await service.create(dto, COMPANY_A);

      // First call is generateSku()'s "last item for this company" lookup.
      expect(repo.findOne).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ where: { company_id: COMPANY_A } }),
      );
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ sku: 'ITEM-00004', company_id: COMPANY_A }),
      );
    });
  });

  describe('findAll', () => {
    it("scopes a plain list query to the caller's company", async () => {
      await service.findAll(COMPANY_A);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { company_id: COMPANY_A } }),
      );
    });

    it("scopes every OR clause of a search query to the caller's company", async () => {
      await service.findAll(COMPANY_A, { search: 'bolt' });
      // Cast right after `.mock.calls` (still `any` there, from jest.Mock's
      // untyped default generic) rather than on the final indexed result —
      // casting only the end value still leaves each intermediate [0]
      // index operating on `any`, which is what was actually flagged.
      const calls = repo.find.mock.calls as {
        where: { company_id: number }[];
      }[][];
      const call = calls[0][0];
      expect(call.where).toHaveLength(3);
      for (const clause of call.where) {
        expect(clause.company_id).toBe(COMPANY_A);
      }
    });
  });

  describe('findOne', () => {
    it('scopes the lookup by id and company', async () => {
      repo.findOne.mockResolvedValueOnce({ id: 5, company_id: COMPANY_A });
      const result = await service.findOne(5, COMPANY_A);
      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 5, company_id: COMPANY_A } }),
      );
      expect(result.id).toBe(5);
    });

    it('throws NotFoundException — including when the row exists but belongs to a different company', async () => {
      // The mocked repo can't itself enforce scoping (that's the real
      // TenantScopedRepository's job, already unit-tested in isolation);
      // this confirms the service always asks for it scoped and surfaces
      // a 404 rather than the row when the repo (correctly) finds nothing
      // for this company.
      repo.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne(5, COMPANY_A)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it("scopes the soft-delete to the caller's company", async () => {
      await service.remove(5, COMPANY_A);
      expect(repo.softDelete).toHaveBeenCalledWith({
        id: 5,
        company_id: COMPANY_A,
      });
    });

    it('throws NotFoundException when nothing matched (wrong id or wrong company)', async () => {
      repo.softDelete.mockResolvedValueOnce({ affected: 0 });
      await expect(service.remove(5, COMPANY_A)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('count', () => {
    it("scopes the count to the caller's company", async () => {
      await service.count(COMPANY_A);
      expect(repo.count).toHaveBeenCalledWith(
        expect.objectContaining({ where: { company_id: COMPANY_A } }),
      );
    });
  });
});
