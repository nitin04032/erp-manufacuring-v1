import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_.]+$/, {
    message:
      'Username can contain only letters, numbers, underscore and dot.',
  })
  username: string;

  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  full_name: string;
}