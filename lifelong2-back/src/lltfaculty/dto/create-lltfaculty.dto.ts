import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateLltfacultyDto {
  @ApiProperty({ example: 1, description: 'รหัสคณะ/ส่วนงานฝั่งระบบทะเบียน' })
  @IsInt()
  id: number;

  @ApiPropertyOptional({ example: 'คณะวิทยาศาสตร์', description: 'ชื่อคณะ/ส่วนงาน' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'SCI', description: 'รหัสคณะ/ส่วนงานฝั่งระบบบุคลากร' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  facIdPsn?: string;

  @ApiPropertyOptional({ example: 1, description: 'รหัสวิทยาเขต' })
  @IsOptional()
  @IsInt()
  campusId?: number;

  @ApiPropertyOptional({ example: 'วิทยาเขตบางแสน', description: 'ชื่อวิทยาเขต' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  campusName?: string;

  @ApiPropertyOptional({ example: 1, description: 'ลำดับข้อมูล' })
  @IsOptional()
  @IsInt()
  facSeq?: number;

  @ApiPropertyOptional({ example: 'Y', description: 'สถานะการเปิดใช้งาน ได้แก่ Y เปิด N ปิด' })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  facActive?: string;

  @ApiPropertyOptional({ example: 'F', description: 'ประเภท ได้แก่ O ส่วนงาน F คณะ' })
  @IsOptional()
  @IsString()
  @MaxLength(1)
  facType?: string;

  @ApiPropertyOptional({ example: '10200', description: 'Com Code ของคณะ' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  compCode?: string;

  @ApiPropertyOptional({ example: 'SC', description: 'Suffix ของคณะ' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  suffix?: string;
}
