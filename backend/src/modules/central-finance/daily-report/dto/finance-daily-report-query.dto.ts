import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FinanceDailyReportQueryDto {
  @ApiPropertyOptional({
    description: 'วันที่ใบเสร็จ เริ่มต้น (DD/MM/YYYY)',
    example: '01/05/2569',
  })
  @IsOptional()
  @IsString()
  receiptDateStart?: string;

  @ApiPropertyOptional({ description: 'วันที่ใบเสร็จ สิ้นสุด (DD/MM/YYYY)', example: '31/05/2569' })
  @IsOptional()
  @IsString()
  receiptDateEnd?: string;

  @ApiPropertyOptional({
    description: 'กรองตามชื่อส่วนงาน/คณะ (FAC_NAME)',
    example: 'สำนักคอมพิวเตอร์',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  facName?: string;

  @ApiPropertyOptional({ description: 'กรองตามรหัสส่วนงาน (FAC_ID)' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  facId?: number;

  @ApiPropertyOptional({ description: 'ค้นหาชื่อโครงการ/อบรม/หลักสูตร (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  courseName?: string;
}
