import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLltcoursechapterDto {
  @ApiProperty({ example: 1, description: 'รหัสรายวิชา (LLTCOURSE)' })
  @IsInt()
  @Min(1)
  courseId: number;

  @ApiPropertyOptional({ example: 'บทนำสู่การเรียนรู้', description: 'เนื้อหาและรายละเอียด' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  name?: string;

  @ApiPropertyOptional({ example: 2.5, description: 'จำนวนชั่วโมงการเรียนรู้' })
  @IsOptional()
  @IsNumber()
  hour?: number;

  @ApiPropertyOptional({ example: 1, description: 'ลำดับ' })
  @IsOptional()
  @IsInt()
  @Min(1)
  seq?: number;
}
