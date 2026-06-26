import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExportreceiptlogDto {
  @ApiProperty() @IsNumber() receiptId: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() userId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() ip?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() device?: string;
}
