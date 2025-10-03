import { IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreatePurchaseOrderDto {
  @IsString()
  po_number: string;

  @IsNumber()
  supplierId: number;

  @IsDateString()
  order_date: string;

  @IsOptional()
  @IsDateString()
  expected_date?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'ordered', 'received', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  total_amount?: number;
}
