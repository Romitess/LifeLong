import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class SetStatusDto {
  @ApiProperty({ enum: ['A', 'P', 'H'], description: 'A=Approved, P=Pending, H=Hidden' })
  @IsIn(['A', 'P', 'H'])
  status: 'A' | 'P' | 'H';
}
