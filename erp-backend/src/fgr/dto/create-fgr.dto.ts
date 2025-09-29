import { IsString, IsDateString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateFgrDto {
  @IsString()
  receipt_number: string;

  @IsString()
  production_order_no: string;

  @IsString()
  item_name: string;

  @IsNumber()
  quantity: number;

  @IsString()
  uom: string;

  @IsString()
  warehouse_name: string;

  @IsDateString()
  receipt_date: string;

  @IsOptional()
  @IsEnum(['draft', 'confirmed'])
  status?: string;

  @IsOptional()
  remarks?: string;
}
