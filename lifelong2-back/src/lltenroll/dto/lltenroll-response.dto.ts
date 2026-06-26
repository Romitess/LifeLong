import { ApiProperty } from '@nestjs/swagger';

export class LltenrollItemDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 123 })
  enrollId: number;

  @ApiProperty({ example: 45, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 67, nullable: true })
  courseId: number | null;

  @ApiProperty({ example: '6700017' })
  learnerRef: string;

  @ApiProperty({ example: '6751300100003' })
  appRef: string;

  @ApiProperty({ example: 'สา ทดสอบ' })
  learnerName: string;

  @ApiProperty({ example: 'บริษัท ทดสอบ จำกัด', nullable: true })
  payerName: string | null;

  @ApiProperty({ example: 1 })
  amount: number;

  @ApiProperty({ example: 'C67513001 : ทดสอบ direct link (สำนักคอมพิวเตอร์)' })
  courseInfo: string;

  @ApiProperty({ enum: ['Paid', 'Pending'], example: 'Paid' })
  status: 'Paid' | 'Pending';

  @ApiProperty({ example: '2788', nullable: true })
  contact: string | null;

  @ApiProperty({ example: '2026-05-21T00:00:00.000Z', nullable: true })
  enrollDate: string | null;

  @ApiProperty({ example: '2026-05-21T00:00:00.000Z', nullable: true })
  payDate: string | null;

  @ApiProperty({ example: '2026-05-21T07:22:21.000Z', nullable: true })
  notifyDate: string | null;

  @ApiProperty({ example: true })
  receiptIssued: boolean;
}

export class LltenrollPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 100 })
  pageSize: number;

  @ApiProperty({ example: 4 })
  total: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class LltenrollResponseDto {
  @ApiProperty({ example: '2026-05-21T07:22:21.000Z' })
  generatedAt: string;

  @ApiProperty({ type: LltenrollPaginationDto })
  pagination: LltenrollPaginationDto;

  @ApiProperty({ type: [LltenrollItemDto] })
  items: LltenrollItemDto[];
}
