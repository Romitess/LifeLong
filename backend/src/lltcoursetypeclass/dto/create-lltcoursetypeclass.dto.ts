import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateLltcoursetypeclassDto {
  @ApiProperty({ example: 83, description: 'รหัสรายวิชา' })
  @IsInt()
  courseId: number;

  @ApiProperty({ example: 1, description: 'รหัสประเภทกลุ่มเรียน' })
  @IsInt()
  typeclassId: number;

  @ApiPropertyOptional({ example: 0, description: 'ค่าธรรมเนียม (0=ฟรี)' })
  @IsOptional()
  @IsInt()
  amount?: number;

  @ApiPropertyOptional({ example: 'หมายเหตุเพิ่มเติม', description: 'หมายเหตุ' })
  @IsOptional()
  @IsString()
  remark?: string;
}
