import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CentralFinanceFacultyReportExportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by class start date from (supports YYYY-MM-DD or DD/MM/YYYY)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by class start date to (supports YYYY-MM-DD or DD/MM/YYYY)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by faculty or organization id', example: 3 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  facultyId?: number;

  @ApiPropertyOptional({ description: 'Filter by course type id', example: 2 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  typeCourseId?: number;

  @ApiPropertyOptional({ description: 'Filter by fee type (free or paid)', enum: ['free', 'paid'] })
  @IsOptional()
  @IsString()
  feeType?: 'free' | 'paid';
}
