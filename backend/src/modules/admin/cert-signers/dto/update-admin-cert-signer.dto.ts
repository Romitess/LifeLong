import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAdminCertSignerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsIn(['Y', 'N'])
  status?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  deleteFile?: string;
}
