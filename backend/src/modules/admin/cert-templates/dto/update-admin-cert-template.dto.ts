import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAdminCertTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['Y', 'N'])
  status?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  deleteFile?: string;

  @IsOptional()
  @IsString()
  layout?: string;
}
