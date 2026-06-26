import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminCoursesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  facultyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  typeCourseId?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['free', 'paid'])
  feeType?: 'free' | 'paid';
}
