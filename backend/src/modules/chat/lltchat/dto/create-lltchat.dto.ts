import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLltchatDto {
  @ApiProperty({ description: 'รหัสการลงทะเบียน/(LLTENROLL)', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  enrollId?: number | null;

  @ApiProperty({
    description: 'รหัสของผู้ส่งข้อความ/(PSNTPERSON,LLTUMUSER)',
    example: 123,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sender?: number | null;

  @ApiProperty({ description: 'รหัสผู้สอน/(PSNTPERSON)', example: 'P0001', required: false })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  psnId?: string | null;

  @ApiProperty({ description: 'รหัสผู้เรียน/(LLTUMUSER)', example: 'U0001', required: false })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  userId?: string | null;

  @ApiProperty({ description: 'ข้อความ', example: 'สวัสดีครับอาจารย์', required: false })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  message?: string | null;

  @ApiProperty({ description: 'เวลาส่งข้อความ', example: '2026-05-25T13:40:00Z', required: false })
  @IsDateString()
  @IsOptional()
  chatTime?: Date | string | null;

  @ApiProperty({ description: 'สถานะการอ่านข้อความ', example: 'N', required: false })
  @IsString()
  @MaxLength(1)
  @IsOptional()
  status?: string | null;

  @ApiProperty({ description: 'ผู้ส่งข้อความ U=ผู้เรียน, T=ผู้สอน', example: 'U', required: false })
  @IsString()
  @MaxLength(1)
  @IsOptional()
  typeSender?: string | null;

  @ApiProperty({ description: 'ชื่อผู้ใช้ที่สร้างข้อมูล', example: 'system', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  createUser?: string | null;

  @ApiProperty({
    description: 'วัน-เวลาที่สร้างข้อมูล',
    example: '2026-05-25T13:40:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  createDate?: Date | string | null;

  @ApiProperty({
    description: 'ชื่อผู้ใช้ที่แก้ไขข้อมูลล่าสุด',
    example: 'system',
    required: false,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  updateUser?: string | null;

  @ApiProperty({
    description: 'วัน-เวลาที่แก้ไขข้อมูลล่าสุด',
    example: '2026-05-25T13:40:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  updateDate?: Date | string | null;

  @ApiProperty({ description: 'โปรแกรมที่แก้ไขข้อมูลล่าสุด', example: 'lltchat', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  updateProgram?: string | null;
}
