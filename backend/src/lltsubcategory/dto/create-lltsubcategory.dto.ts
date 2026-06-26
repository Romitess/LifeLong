import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateLltsubcategoryDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoryId: number;

  @ApiProperty({ example: 'หมู่ย่อย 1' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiPropertyOptional({ example: 'Y' })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  activeFlag?: string;

  @ApiPropertyOptional({ example: 'general-category-sub-1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  url?: string;
}
