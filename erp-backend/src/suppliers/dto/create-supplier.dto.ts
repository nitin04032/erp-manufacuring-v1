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

export function Trim() {
  return Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
}

export class CreateSupplierDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Trim()
  supplier_code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Trim()
  name: string;

  @IsString()
  @IsNotEmpty() // Contact person is now required
  @MaxLength(255)
  @Trim()
  contact_person: string;

  @IsEmail()
  @IsNotEmpty()
  @Trim()
  email: string;

  @IsOptional()
  @IsPhoneNumber('IN') // Validates Indian phone numbers
  phone?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format.',
  })
  @Trim()
  gst_number?: string;

  @IsString()
  @IsOptional()
  @Trim()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Trim()
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Trim()
  state?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Trim()
  country?: string;

  @IsOptional()
  @IsPostalCode('IN') // Validates Indian pincodes
  pincode?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}