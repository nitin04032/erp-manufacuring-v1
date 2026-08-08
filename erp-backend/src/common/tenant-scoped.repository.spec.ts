/// <reference types="jest" />
import { Repository } from 'typeorm';
import { TenantScopedRepository } from './tenant-scoped.repository';

interface FakeEntity {
  id: number;
  company_id: number;
  name: string;
}

describe('TenantScopedRepository', () => {
  const companyId = 7;
  let repo: jest.Mocked<
    Pick<
      Repository<FakeEntity>,
      'find' | 'findOne' | 'count' | 'create' | 'save' | 'softDelete'
    >
  >;
  let scoped: TenantScopedRepository<FakeEntity>;

  beforeEach(() => {
    repo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockImplementation((x: unknown) => x),
      save: jest.fn().mockImplementation((x: unknown) => Promise.resolve(x)),
      softDelete: jest
        .fn()
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] }),
    };
    scoped = new TenantScopedRepository(
      repo as unknown as Repository<FakeEntity>,
      companyId,
    );
  });

  it('find() injects company_id into an empty where', async () => {
    await scoped.find();
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { company_id: companyId } }),
    );
  });

  it('find() merges company_id into an existing where object without overriding other fields', async () => {
    await scoped.find({ where: { name: 'widget' } });
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { company_id: companyId, name: 'widget' },
      }),
    );
  });

  it('find() applies company_id across every clause of an array where (OR)', async () => {
    await scoped.find({ where: [{ name: 'a' }, { name: 'b' }] });
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: [
          { company_id: companyId, name: 'a' },
          { company_id: companyId, name: 'b' },
        ],
      }),
    );
  });

  it('findOne() scopes by company_id', async () => {
    await scoped.findOne({ where: { id: 5 } });
    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { company_id: companyId, id: 5 } }),
    );
  });

  it("a caller cannot override company_id via the where clause — the scope's value always wins", async () => {
    await scoped.findOne({ where: { company_id: 999, id: 5 } });
    expect(repo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { company_id: companyId, id: 5 } }),
    );
  });

  it('create() stamps company_id onto the new entity', () => {
    scoped.create({ name: 'widget' });
    expect(repo.create).toHaveBeenCalledWith({
      name: 'widget',
      company_id: companyId,
    });
  });

  it('save() stamps company_id when absent', async () => {
    await scoped.save({ name: 'widget' });
    expect(repo.save).toHaveBeenCalledWith({
      name: 'widget',
      company_id: companyId,
    });
  });

  it('save() allows a matching company_id through unchanged', async () => {
    await scoped.save({ name: 'widget', company_id: companyId });
    expect(repo.save).toHaveBeenCalledWith({
      name: 'widget',
      company_id: companyId,
    });
  });

  it('save() throws rather than silently cross-writing a different company_id', async () => {
    await expect(
      scoped.save({ name: 'widget', company_id: 999 }),
    ).rejects.toThrow(/refusing to save/);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('softDelete() scopes by company_id', async () => {
    await scoped.softDelete({ id: 5 });
    expect(repo.softDelete).toHaveBeenCalledWith({
      company_id: companyId,
      id: 5,
    });
  });

  it('unscoped() returns the underlying repository untouched', () => {
    expect(scoped.unscoped()).toBe(repo);
  });
});
