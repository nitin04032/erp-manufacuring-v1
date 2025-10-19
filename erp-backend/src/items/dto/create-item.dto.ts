import { IsNotEmpty, IsString, IsOptional, MaxLength, IsNumber, Min, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

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

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => (value === undefined ? true : value))
  is_active?: boolean = true;
}
