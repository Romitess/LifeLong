import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLltopenclassDto {
  @IsInt()
  @IsPositive()
  courseId: number;

  @IsOptional()
  @IsIn(['Y', 'N'])
  isPublic?: string;

  @IsOptional()
  @IsDateString()
  regStartDate?: string | null;

  @IsOptional()
  @IsDateString()
  regEndDate?: string | null;

  @IsOptional()
  @IsDateString()
  payStartDate?: string | null;

  @IsOptional()
  @IsDateString()
  payEndDate?: string | null;

  @IsOptional()
  @IsDateString()
  classStartDate?: string | null;

  @IsOptional()
  @IsDateString()
  classEndDate?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  numOpen?: number | null;

  @IsOptional()
  @IsInt()
  grademId?: number | null;

  @IsOptional()
  @IsInt()
  typeclassId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  gen?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  group?: string | null;

  @IsOptional()
  @IsIn(['Y', 'N'])
  notice?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  vdo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contractTel?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contractEmail?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  contractUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  contractName2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contractTel2?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contractEmail2?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  contractUrl2?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  teachTime?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  moocUrl?: string | null;

  @IsOptional()
  @IsIn(['Y', 'N'])
  gradeStatus?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  gradeApprove?: string | null;

  @IsOptional()
  @IsInt()
  costplanId?: number | null;
}
