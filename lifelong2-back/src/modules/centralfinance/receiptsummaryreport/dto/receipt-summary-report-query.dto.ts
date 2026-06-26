import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReceiptSummaryReportQueryDto {
  @ApiPropertyOptional({ description: 'กรองตามชื่อส่วนงาน (FAC_NAME)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  facName?: string;

  @ApiPropertyOptional({ description: 'วันที่ใบเสร็จรับเงิน (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  receiptDateStart?: string;

  @ApiPropertyOptional({ description: 'วันที่ใบเสร็จรับเงิน สิ้นสุด (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  receiptDateEnd?: string;

  @ApiPropertyOptional({ description: 'วันที่ชำระเงิน เริ่มต้น (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  effectiveDateStart?: string;

  @ApiPropertyOptional({ description: 'วันที่ชำระเงิน สิ้นสุด (DD/MM/YYYY)' })
  @IsOptional()
  @IsString()
  effectiveDateEnd?: string;

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
