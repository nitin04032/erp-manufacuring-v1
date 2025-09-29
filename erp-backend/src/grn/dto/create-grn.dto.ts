import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

// A helper DTO for each item in the GRN
class GrnItemDto {
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @IsString()
  @IsNotEmpty()
  item_name: string;

  @IsNumber()
  @IsPositive()
  received_qty: number;

  @IsString()
  @IsNotEmpty()
  uom: string;
}

export class CreateGrnDto {
  @IsString()
  @IsNotEmpty()
  grn_number: string;

  @IsInt()
  @IsPositive()
  purchaseOrderId: number;

  @IsDateString()
  received_date: string;

  @IsString()
  @IsNotEmpty()
  warehouse_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrnItemDto)
  items: GrnItemDto[];

  @IsOptional()
  @IsString()
  remarks?: string;
}