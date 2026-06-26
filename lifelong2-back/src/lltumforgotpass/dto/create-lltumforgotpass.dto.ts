import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateLltumforgotpassDto {
  @ApiProperty({ example: 'user@buu.ac.th', description: 'อีเมลของผู้ใช้ที่ต้องการรีเซ็ตรหัสผ่าน' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
