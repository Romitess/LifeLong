import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollreceiptDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() enrollId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() enrollCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() userId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() userFnameTh?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() userLnameTh?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() openclassId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() openclassGen?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() openclassGroup?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() coseId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() coseCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coseNameTh?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coseNameEn?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() facId?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() facName?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() amount?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() payDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() payTime?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() transCode?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() effectiveDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() budYear?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() receiptNo?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() receiptName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() cashierName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bookNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() runNo?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() payCompanyAccount?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() payCompanyName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() payServiceCode?: string;
}
