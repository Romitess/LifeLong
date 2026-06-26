import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportPaymentDto {
  @ApiProperty() @IsString() learnerRef: string;
  @ApiProperty() @IsString() applicationRef: string;
  @ApiProperty() @IsString() payerName: string;
  @ApiProperty() @IsString() paymentDate: string; // DD-MM-YYYY
  @ApiProperty() @IsString() paymentTime: string; // HH:mm:ss
  @ApiProperty() @IsNumber() amount: number;
}
