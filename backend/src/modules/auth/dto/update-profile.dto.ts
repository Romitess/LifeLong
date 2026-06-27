import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'สมชาย', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstNameTh?: string;

  @ApiPropertyOptional({ example: 'ใจดี', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastNameTh?: string;

  @ApiPropertyOptional({ example: 'SOMCHAI', maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstNameEn?: string | null;

  @ApiPropertyOptional({ example: 'JAIDEE', maxLength: 50, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastNameEn?: string | null;

  @ApiPropertyOptional({ example: '0812345678', maxLength: 30, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;
}
