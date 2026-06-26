import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class LltenrollQueryDto {
  @ApiPropertyOptional({
    description: 'Search by learner ref, app ref, learner name, phone, or course',
    example: '6600001',
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({
    description: 'Filter payment status',
    enum: ['Paid', 'Pending'],
  })
  @IsOptional()
  @IsIn(['Paid', 'Pending'])
  status?: 'Paid' | 'Pending';

  @ApiPropertyOptional({
    description: 'Filter receipt status',
    enum: ['Issued', 'NotIssued', 'All'],
  })
  @IsOptional()
  @IsIn(['Issued', 'NotIssued', 'All'])
  receiptStatus?: 'Issued' | 'NotIssued' | 'All';

  @ApiPropertyOptional({
    description: 'Filter enrollments with payment notification only (pending paid courses)',
    example: true,
  })
  @Transform(({ value }) => value === true || value === 'true')
  @IsOptional()
  @IsBoolean()
  notifyOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Enrollment date from (DD/MM/YYYY)',
    example: '01/01/2026',
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'Enrollment date to (DD/MM/YYYY)',
    example: '31/01/2026',
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by faculty ID',
    example: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  facId?: number;

  @ApiPropertyOptional({
    description: 'Requested page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of rows per page',
    example: 100,
    default: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  pageSize?: number = 100;
}
