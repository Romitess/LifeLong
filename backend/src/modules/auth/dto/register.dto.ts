import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstNameTh: string;

  @IsNotEmpty()
  @IsString()
  lastNameTh: string;

  @IsNotEmpty()
  @IsString()
  firstNameEn: string;

  @IsNotEmpty()
  @IsString()
  lastNameEn: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?:(?=.*[A-Z])(?=.*[a-z])|(?=.*[A-Z])(?=.*\d)|(?=.*[a-z])(?=.*\d))/, {
    message: 'password must contain at least 2 of: uppercase letter, lowercase letter, digit',
  })
  password: string;

  @IsNotEmpty()
  @Matches(/^\d{13}$/, { message: 'citizenId must be exactly 13 digits' })
  citizenId: string;
}
