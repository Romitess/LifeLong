import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'รหัสสำหรับยืนยันการเปลี่ยนรหัสผ่าน' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ description: 'รหัสผ่านใหม่ (ขั้นต่ำ 8 ตัวอักษร)', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
