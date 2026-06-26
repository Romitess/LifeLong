import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FeedbackResponseFieldDto {
  @IsString()
  name!: string;

  @IsString()
  value!: string;
}

export class ProcessFeedbackPageDto {
  @IsInt()
  @Min(0)
  page!: number;

  @IsOptional()
  @IsBoolean()
  goNext?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackResponseFieldDto)
  responses!: FeedbackResponseFieldDto[];
}
