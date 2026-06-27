import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCourseSettingsDto {
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsNumber()
  maxSeats?: number | null;

  @IsOptional()
  @IsString()
  coverImageUrl?: string | null;

  @IsOptional()
  @IsNumber()
  price?: number | null;

  @IsOptional()
  @IsString()
  deliveryMode?: string | null;
}
