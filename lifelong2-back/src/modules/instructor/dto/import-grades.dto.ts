import { IsArray, IsInt, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportGradeItemDto {
  @IsString()
  @MaxLength(10)
  userCode: string;

  @IsString()
  @MaxLength(3)
  gradeText: string;

  @IsInt()
  gradeItemId: number;
}

export class ImportGradesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportGradeItemDto)
  items: ImportGradeItemDto[];
}

export interface ImportGradesResult {
  saved: number;
  failed: number;
  errors: Array<{ userCode: string; reason: string }>;
}
