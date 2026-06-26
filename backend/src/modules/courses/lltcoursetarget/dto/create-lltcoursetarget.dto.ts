import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Length, Min } from 'class-validator';

export class CreateLltcoursetargetDto {
  @ApiProperty({ description: 'รหัสรายวิชา / (LLTCOURSE)', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  courseId: number;

  @ApiProperty({ description: 'รหัสกลุ่มเป้าหมาย / (LLTTARGET)', example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  targetId: number;

  @ApiProperty({
    description: 'รหัสกลุ่มเป้าหมายย่อย / (LLTSUBTARGET)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  subtargetId?: number;

  @ApiProperty({ description: 'ลำดับความสำคัญของกลุ่มเป้าหมาย', example: 1, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  sequence?: number;

  @ApiProperty({
    description: 'อื่น ระบุ',
    example: 'กลุ่มเป้าหมายพิเศษ',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  other?: string;
}
