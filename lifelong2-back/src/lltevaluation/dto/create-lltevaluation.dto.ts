import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateLltevaluationDto {
  @ApiProperty({ example: 'ตัดเกรดอิงเกณฑ์' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: 'N' })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  other?: string;
}
