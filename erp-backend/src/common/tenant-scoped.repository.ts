import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
  UpdateResult,
} from 'typeorm';

/**
 * V2_ARCHITECTURE.md §3 (audit fix, structural half): every V1 service
 * method takes an explicit `companyId` and manually ANDs `company_id`
 * into its `where` clause — consistent everywhere it was checked
 * (AUDIT_REPORT.md §1.4), but nothing stops a new method, in this module
 * or a future one, from being written without that filter. The failure
 * mode is silent: company A sees company B's data.
 *
 * TenantScopedRepository wraps an existing `Repository<T>` (the one a
 * service already gets via @InjectRepository — no DI changes needed) and
 * a `companyId`, and makes every read/write go through `company_id`
 * automatically. A developer has to actively reach for `.unscoped()` to
 * opt out, rather than remembering to opt in on every call.
 *
 * This is deliberately just the application-layer half of the plan.
 * Postgres Row-Level Security as the structural backstop (so a bypass of
 * this class — raw SQL, a hand-written QueryBuilder, a future ORM
 * migration — still can't cross tenants) needs a real Postgres
 * environment to develop and verify the accompanying `SET LOCAL
 * app.current_company_id` request interceptor against before an
 * RLS-enabling migration ships; auto-run migrations
 * (`migrationsRun: true` in app.module.ts) mean getting that wrong on
 * first try returns zero rows for every tenant query in production.
 * Deferred until there's a real DB to validate against — see
 * V2_ARCHITECTURE.md §3 point 2.
 *
 * Usage (see items.service.ts for the reference migration of an existing
 * V1 service onto this pattern):
 *
 *   const scoped = new TenantScopedRepository(this.repo, companyId);
 *   return scoped.find({ order: { name: 'ASC' } }); // company_id already applied
 *
 * Migrating other V1 modules onto this is opportunistic, not a forced
 * rewrite — the existing "companyId param + manual where filter" pattern
 * and this one produce identical queries; both can coexist during the
 * transition (V2_ARCHITECTURE.md §3).
 */
export class TenantScopedRepository<Entity extends { company_id: number }> {
  constructor(
    private readonly repo: Repository<Entity>,
    private readonly companyId: number,
  ) {}

  private scopeWhere(
    where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
  ): FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[] {
    const scope = { company_id: this.companyId } as FindOptionsWhere<Entity>;
    if (!where) return scope;
    // scope spreads *last* in every merge below — a caller-supplied
    // company_id (however it got there) must never be able to override
    // the value this repository is actually scoped to.
    if (Array.isArray(where)) {
      return where.map((clause) => ({ ...clause, ...scope }));
    }
    return { ...where, ...scope };
  }

  find(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repo.find({
      ...options,
      where: this.scopeWhere(options?.where),
    });
  }

  findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repo.findOne({
      ...options,
      where: this.scopeWhere(options.where),
    });
  }

  count(options?: FindManyOptions<Entity>): Promise<number> {
    return this.repo.count({
      ...options,
      where: this.scopeWhere(options?.where),
    });
  }

  /** Stamps company_id onto the new entity — never trust a caller-supplied value here. */
  create(entityLike: DeepPartial<Entity>): Entity {
    return this.repo.create({
      ...entityLike,
      company_id: this.companyId,
    } as DeepPartial<Entity>);
  }

  /**
   * Refuses to silently save a row stamped with a *different* company_id
   * than this repository is scoped to — that would be exactly the kind
   * of cross-tenant write this class exists to make impossible. Throws
   * rather than quietly overwriting it, so the bug surfaces at the call
   * site that produced the wrong value, not as corrupted data.
   */
  // async (not a plain function returning this.repo.save(...)) so the
  // guard's throw below becomes a rejected Promise, matching every other
  // method's async-error contract, rather than a synchronous throw a
  // caller doing `scoped.save(...).catch(...)` wouldn't expect.
  async save(entity: DeepPartial<Entity>): Promise<Entity> {
    const existingCompanyId = (entity as Partial<Entity>).company_id;
    if (
      existingCompanyId !== undefined &&
      existingCompanyId !== this.companyId
    ) {
      throw new Error(
        `TenantScopedRepository: refusing to save a row with company_id=${String(existingCompanyId)} ` +
          `through a repository scoped to company_id=${this.companyId}.`,
      );
    }
    return this.repo.save({
      ...entity,
      company_id: this.companyId,
    } as DeepPartial<Entity>);
  }

  softDelete(where: FindOptionsWhere<Entity>): Promise<UpdateResult> {
    return this.repo.softDelete(
      this.scopeWhere(where) as FindOptionsWhere<Entity>,
    );
  }

  /**
   * Escape hatch for legitimately cross-tenant operations (e.g. a
   * SUPERADMIN-only path, matching the small set already identified in
   * companies.controller.ts). Returns the underlying, unscoped
   * Repository — using this bypasses the guarantee this class exists to
   * provide, so every call site should carry a comment explaining why.
   */
  unscoped(): Repository<Entity> {
    return this.repo;
  }
}
