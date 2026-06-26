import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewerDto {
  @ApiProperty({ example: 'สมชาย ใจดี' })
  name: string;
}

export class LltcoursereviewResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiPropertyOptional({ example: 'เนื้อหาดีมาก' })
  comment: string | null;

  @ApiProperty()
  createDate: Date | null;

  @ApiProperty({ type: () => ReviewerDto })
  reviewer: ReviewerDto;
}
