import { IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateGrnDto {
  @IsString()
  grn_number: string;

  @IsNumber()
  purchaseOrderId: number;

  @IsDateString()
  received_date: string;

  @IsOptional()
  @IsEnum(['draft', 'verified', 'rejected'])
  status?: string;

  @IsOptional()
  @IsNumber()
  total_received_value?: number;

  @IsOptional()
  remarks?: string;
}
