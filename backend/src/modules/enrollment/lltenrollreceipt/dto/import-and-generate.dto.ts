import { IsArray, ValidateNested, IsString, IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ImportPaymentDto } from './import-payment.dto';

export class ImportAndGenerateDto {
  @ApiProperty({ type: [ImportPaymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportPaymentDto)
  records: ImportPaymentDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsIn(['R', 'D'])
  receiptType?: string;

  @ApiProperty()
  @IsString()
  @IsIn(['S', 'P'])
  createdBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  creatorUserId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creatorIp?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  creatorDevice?: string;
}
