import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLltcertificatelogDto {
  @ApiProperty({
    description: 'อุปกรณ์/User-Agent ที่ใช้',
    example: 'Mozilla/5.0 (Windows NT 10.0...)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  cldevice: string;
}
