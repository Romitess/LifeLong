import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReceiptUsageReportQueryDto {
  @ApiPropertyOptional({ description: 'ปีงบประมาณ (พ.ศ.) เช่น 2568' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  fiscalYear?: string;

  @ApiPropertyOptional({ description: 'วันที่ใบเสร็จรับเงิน เริ่มต้น (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  receiptDateStart?: string;

  @ApiPropertyOptional({ description: 'วันที่ใบเสร็จรับเงิน สิ้นสุด (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  receiptDateEnd?: string;

  @ApiPropertyOptional({ description: 'กรองตามชื่อส่วนงาน (FAC_NAME)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  facName?: string;

  @ApiPropertyOptional({ description: 'ค้นหาชื่อโครงการ/อบรม/หลักสูตร (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  courseName?: string;

  @ApiPropertyOptional({ description: 'ค้นหาชื่อผู้ชำระเงิน (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  customerName?: string;

  @ApiPropertyOptional({ description: 'ค้นหาชื่อผู้รับเงิน/แคชเชียร์ (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  collector?: string;

  @ApiPropertyOptional({ description: 'ค้นหาเลขที่ใบเสร็จรับเงิน (LIKE)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  receiptNo?: string;

  @ApiPropertyOptional({ description: 'สถานะใบเสร็จ: Y = ใช้งาน, C = ยกเลิก' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'หน้าที่ต้องการ (เริ่มจาก 1)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }: { value: unknown }) => (value !== undefined ? Number(value) : undefined))
  page?: number;

  @ApiPropertyOptional({ description: 'จำนวนรายการต่อหน้า', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  @Transform(({ value }: { value: unknown }) => (value !== undefined ? Number(value) : undefined))
  pageSize?: number;
}
