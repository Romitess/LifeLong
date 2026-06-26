import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApproveGradesDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  approveDetail?: string;

  @IsOptional()
  @IsString()
  approveDate?: string;
}

export interface ApproveGradesResult {
  approved: number;
  skipped: number;
  approvedBy: string;
  approvedAt: Date;
}
