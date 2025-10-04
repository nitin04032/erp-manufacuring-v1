// erp-backend/src/warehouses/dto/create-warehouse.dto.ts
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  MaxLength, 
  IsBoolean 
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsOptional() // Code ko optional banaya gaya
  @MaxLength(100)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  pincode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  // ### MUKHYA SUDHAR YAHAN HAI ###
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_person?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}