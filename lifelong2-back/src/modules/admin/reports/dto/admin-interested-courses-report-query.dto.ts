import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class AdminInterestedCoursesReportQueryDto {
  @ApiPropertyOptional({
    description: 'Search by course code, course name, or responsible person',
    example: 'AI',
  })
  @IsOptional()
  @IsString()
  search?: string = '';

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
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;
}
