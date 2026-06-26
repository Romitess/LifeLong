import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLltannouncementDto {
  @ApiProperty({ description: 'รหัสวิชา (COSE_ID)', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  courseId: number;

  @ApiProperty({ description: 'หัวข้อประกาศ', example: 'แจ้งเลื่อนการสอบกลางภาค' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'เนื้อหาประกาศ', example: 'เนื่องจาก...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Optional USER_ID list. If omitted, send to all enrolled students.',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  recipientUserIds?: number[];
}
