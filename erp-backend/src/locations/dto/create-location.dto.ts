import { IsString, IsNotEmpty, IsOptional, IsIn, IsInt } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  location_code: string;

  @IsString()
  @IsNotEmpty()
  location_name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  warehouse_id?: number;

  @IsOptional()
  @IsString()
  @IsIn(['active', 'inactive'])
  status?: string = 'active';
}
