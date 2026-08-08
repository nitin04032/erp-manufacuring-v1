// src/common/transformers/trim.transformer.ts
import { Transform } from 'class-transformer';

/**
 * Was copy-pasted, byte-for-byte identical, into 5 separate DTO files
 * (companies, customers, items, suppliers, warehouses) — consolidated
 * here as the one shared implementation.
 *
 * class-transformer types Transform()'s callback `value` as `any` (its own
 * library type, TransformFnParams). Assigning it into an explicitly
 * `unknown`-typed local first, then narrowing with typeof, satisfies
 * @typescript-eslint/no-unsafe-* without a suppression comment — and, more
 * importantly, is an actual bug fix over the `value?.trim()` variant this
 * replaces in a few call sites (register.dto.ts): optional chaining only
 * guards against null/undefined, not wrong *types*. A non-string,
 * non-nullish value (e.g. a JSON number in the request body) made
 * `value?.trim()` throw an unhandled TypeError — a 500 — instead of
 * passing through untouched to @IsString() for a clean 400. The typeof
 * guard here never calls `.trim()` on anything but an actual string.
 */
export const Trim = () =>
  Transform(({ value }) => {
    const v: unknown = value;
    return typeof v === 'string' ? v.trim() : v;
  });

export const TrimLower = () =>
  Transform(({ value }) => {
    const v: unknown = value;
    return typeof v === 'string' ? v.trim().toLowerCase() : v;
  });
