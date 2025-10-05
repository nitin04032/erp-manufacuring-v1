import { IsString, IsOptional, IsNotEmpty, MaxLength, IsNumber, Min, IsIn, IsBoolean } from 'class-validator';
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

  // ✅ Improvement: Added validation for ALL fields
  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['raw_material', 'semi_finished', 'finished_goods', 'consumable', 'service'])
  item_type?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  item_category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  hsn_code?: string;
  
  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  sale_rate?: number;
  
  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  gst_rate?: number;

  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  purchase_rate?: number;

  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  minimum_stock?: number;
  
  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  maximum_stock?: number;

  @Type(() => Number) @IsNumber() @Min(0) @IsOptional()
  reorder_level?: number;
  
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}