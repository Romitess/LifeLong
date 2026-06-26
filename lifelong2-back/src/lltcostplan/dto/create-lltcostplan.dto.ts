import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateLltcostplanDto {
  @ApiProperty({ description: 'รหัสคณะ/ส่วนงานที่รับผิดชอบ / (LLTFACULTY)', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  facId: number;

  @ApiProperty({ description: 'รหัสผังแหล่งเงิน', example: '42245' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  costplanCode: string;

  @ApiProperty({ description: 'ชื่อผังแหล่งเงิน', example: 'งบดำเนินการสำนักคอมพิวเตอร์' })
  @IsNotEmpty()
  @IsString()
  @Length(1, 200)
  costplanName: string;

  @ApiProperty({
    description: 'สถานะการใช้งาน Y=เปิด N=ปิด',
    example: 'Y',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(1, 1)
  costplanStatus?: string;
}
