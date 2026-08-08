import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { Trim } from '../../common/transformers/trim.transformer';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Trim()
  sku?: string; // optional, auto-generate if missing

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Trim()
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Trim()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Trim()
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  reorder_level?: number;

  // Feeds InventoryService.getTotalStockValue() (dashboard summary + stock
  // report) — item.entity.ts has had this column for a while but it was
  // never exposed on the create/update DTO, so it could never actually be set.
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  purchase_rate?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    const v: unknown = value;
    return v === undefined ? true : v;
  })
  is_active?: boolean = true;
}
