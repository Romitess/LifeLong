import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLltcoursesubchapterDto {
  @ApiProperty({ example: 1, description: 'รหัสหัวข้อหลัก (LLTCOURSECHAPTER)' })
  @IsInt()
  @Min(1)
  chapterId: number;

  @ApiPropertyOptional({
    example: 'หัวข้อย่อยบทที่ 1',
    description: 'เนื้อหาและรายละเอียดของหัวข้อย่อย',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  subject?: string;

  @ApiPropertyOptional({ example: 1, description: 'ลำดับ' })
  @IsOptional()
  @IsInt()
  @Min(1)
  seq?: number;
}
