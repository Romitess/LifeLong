import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CreateLltcategoryDto {
  @ApiProperty({ example: 'หมวดหมู่ทั่วไป' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ example: 'General Category' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nameEn?: string;

  @ApiPropertyOptional({ example: 'Y' })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  activeFlag?: string;

  @ApiPropertyOptional({ example: 'general-category' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;

  @ApiPropertyOptional({ example: 'school' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ example: '#F5A623' })
  @IsOptional()
  @IsString()
  @Length(4, 7)
  color?: string;
}
