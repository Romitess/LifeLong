import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminCertTemplateDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsIn(['Y', 'N'])
  status: string;

  @IsOptional()
  @IsString()
  layout?: string;
}
