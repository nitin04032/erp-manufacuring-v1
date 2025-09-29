import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  item_code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  item_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unit?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  reorder_level?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  standard_rate?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
