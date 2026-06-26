import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkProgressDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  enrollId: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  subChapterId: number;
}
