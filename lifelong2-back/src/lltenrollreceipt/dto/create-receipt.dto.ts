import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReceiptDto {
  @ApiProperty({ description: 'R (Real) or D (Copy)' })
  @IsString()
  @IsIn(['R', 'D'])
  type: string;

  @ApiProperty({ description: 'S (Student) or P (Personnel)' })
  @IsString()
  @IsIn(['S', 'P'])
  createdBy: string;
}
