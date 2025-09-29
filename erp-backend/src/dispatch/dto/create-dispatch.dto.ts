import { IsString, IsDateString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateDispatchDto {
  @IsString()
  dispatch_number: string;

  @IsString()
  customer_name: string;

  @IsDateString()
  dispatch_date: string;

  @IsOptional()
  @IsEnum(['draft', 'dispatched', 'delivered', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsNumber()
  total_value?: number;

  @IsOptional()
  remarks?: string;
}
