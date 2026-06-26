import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateLltumforgotpassDto {
  @ApiPropertyOptional({ example: 'Y', description: 'สถานะ Y = เปลี่ยนรหัสสำเร็จ' })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  status: string;
}
