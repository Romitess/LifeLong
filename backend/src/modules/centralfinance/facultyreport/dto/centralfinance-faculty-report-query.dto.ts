import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CentralFinanceFacultyReportQueryDto {
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

  @ApiPropertyOptional({ description: 'Requested page number', example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of rows per page', example: 10, default: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}
