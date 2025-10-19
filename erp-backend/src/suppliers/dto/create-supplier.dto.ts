import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsPhoneNumber,
  IsPostalCode,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export const Trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export enum SupplierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateSupplierDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Trim()
  supplier_code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Trim()
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Trim()
  contact_person!: string;

  @IsEmail()
  @IsNotEmpty()
  @Trim()
  email!: string;

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format.',
  })
  @Trim()
  gst_number?: string;

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
  @IsBoolean()
  is_active?: boolean;
}

export class QuerySupplierDto {
  @IsOptional()
  status?: SupplierStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
