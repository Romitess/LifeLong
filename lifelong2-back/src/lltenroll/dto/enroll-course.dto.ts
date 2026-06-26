import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EnrollCourseDto {
  @IsNotEmpty()
  @IsString()
  courseCode: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  citizen?: string;

  @IsOptional()
  @IsString()
  nameReceipt?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: 'pending' | 'paid' | 'free';
}
