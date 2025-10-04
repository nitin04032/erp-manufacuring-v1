import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsEmail, // ✅ IsEmail import kiya gaya
} from 'class-validator';

export class CreateWarehouseDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  code?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  description?: string; // ✅ description field add kiya gaya

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
  @MaxLength(100)
  country?: string; // ✅ country field add kiya gaya

  @IsOptional()
  @IsString()
  @MaxLength(10) // ✅ Pincode ki length 10 set ki gayi
  pincode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_person?: string;

  @IsOptional()
  @IsEmail() // ✅ Email validation add kiya gaya
  email?: string; // ✅ email field add kiya gaya

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}