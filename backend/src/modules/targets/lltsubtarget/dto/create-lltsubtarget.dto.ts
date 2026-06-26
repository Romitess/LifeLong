import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min, IsIn } from 'class-validator';

export class CreateLltsubtargetDto {
  @ApiProperty({ description: 'รหัสกลุ่มเป้าหมายย่อย', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ description: 'รหัสกลุ่มเป้าหมาย', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  targetId: number;

  @ApiProperty({ description: 'ชื่อกลุ่มเป้าหมายย่อย', example: 'ตรี' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({
    description: 'อื่นๆ ได้แก่ Y ให้ระบุข้อมูลเพิ่มเติมได้, N ไม่ต้องระบุข้อมูลเพิ่มเติม',
    example: 'N',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['Y', 'N'])
  other?: string;

  @ApiProperty({ description: 'ลำดับ', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;
}
