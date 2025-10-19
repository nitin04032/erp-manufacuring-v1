import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsPostalCode,
  IsBoolean,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class CreateWarehouseDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Trim()
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Trim()
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Trim()
  description?: string;

  @IsOptional()
  @IsString()
  @Trim()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Trim()
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Trim()
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Trim()
  country?: string;

  @IsOptional()
  @IsPostalCode('IN')
  pincode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Trim()
  contact_person?: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Trim()
  email?: string;

  @IsOptional()
  @IsBoolean()
  @ValidateIf(o => o.is_active !== undefined)
  is_active?: boolean = true;
}
