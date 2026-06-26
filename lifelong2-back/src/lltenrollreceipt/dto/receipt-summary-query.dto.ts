import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ReceiptSummaryQueryDto {
  @ApiPropertyOptional({ description: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  receiptDateStart?: string;

  @ApiPropertyOptional({ description: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  receiptDateEnd?: string;

  @ApiPropertyOptional({ description: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  effectiveDateStart?: string;

  @ApiPropertyOptional({ description: 'DD/MM/YYYY' })
  @IsOptional()
  @IsString()
  effectiveDateEnd?: string;

  @ApiPropertyOptional({ description: 'true = ดึงข้อมูลทั้งหมด ไม่กรองตามคณะ' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  allFaculties?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  limit?: number;
}
