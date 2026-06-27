import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateOpenclassDto {
  @IsOptional()
  @IsDateString()
  registrationStartDate?: string;

  @IsOptional()
  @IsDateString()
  registrationEndDate?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
