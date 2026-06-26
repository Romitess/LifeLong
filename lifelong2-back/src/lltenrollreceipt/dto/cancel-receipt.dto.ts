import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelReceiptDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cancelRemark: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  cancelUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancelUserName?: string;
}
