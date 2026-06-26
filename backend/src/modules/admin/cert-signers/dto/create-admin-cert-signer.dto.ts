import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminCertSignerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsIn(['Y', 'N'])
  status: string;
}
