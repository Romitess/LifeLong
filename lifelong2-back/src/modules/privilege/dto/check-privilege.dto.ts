import { IsOptional, Matches } from 'class-validator';

export class CheckPrivilegeDto {
  @IsOptional()
  @Matches(/^\d{13}$/, { message: 'citizenId must be exactly 13 digits' })
  citizenId?: string;
}
