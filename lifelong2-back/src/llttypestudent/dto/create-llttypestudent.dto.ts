import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateLlttypestudentDto {
  @ApiProperty({ description: 'ชื่อประเภทผู้เรียน', example: 'นาย', nullable: true })
  @IsOptional()
  @IsString()
  name: string | null;

  @ApiProperty({ description: 'สถานะการใช้งาน ได้แก่ Y เปิด N ปิด', example: true })
  @IsOptional()
  @IsIn(['Y', 'N'])
  status: string | null;

  @ApiProperty({ description: 'ชื่อผู้ใช้ที่สร้างข้อมูล', example: 'admin', nullable: true })
  @IsOptional()
  @IsString()
  createUser: string | null;

  @ApiProperty({ description: 'วัน-เวลาที่สร้างข้อมูล', example: new Date(), nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createDate: Date | null;

  @ApiProperty({ description: 'ชื่อผู้ใช้ที่แก้ไขข้อมูล', example: 'admin', nullable: true })
  @IsOptional()
  @IsString()
  updateUser: string | null;

  @ApiProperty({ description: 'วัน-เวลาที่แก้ไขข้อมูลล่าสุด', example: new Date(), nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updateDate: Date | null;

  @ApiProperty({ description: 'โปรแกรมที่แก้ไขข้อมูลล่าสุด', example: 'LLTCOURSE', nullable: true })
  @IsOptional()
  @IsString()
  updateProg: string | null;
}
