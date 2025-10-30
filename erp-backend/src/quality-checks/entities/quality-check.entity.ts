import { IsNotEmpty, IsArray, ValidateNested, IsDateString, IsInt, Min, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class CreateQCItemDto {
  @IsNotEmpty()
  @IsInt()
  grn_item_id!: number;

  @IsInt()
  @Min(0)
  checked_qty!: number;

  @IsInt()
  @Min(0)
  passed_qty!: number;

  @IsInt()
  @Min(0)
  failed_qty!: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateQualityCheckDto {
  @IsDateString()
  qc_date!: string;

  @IsNotEmpty()
  @IsInt()
  grn_id!: number;

  @IsNotEmpty()
  @IsString()
  inspector!: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQCItemDto)
  items!: CreateQCItemDto[];

  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected';
}
