import { ApiProperty } from '@nestjs/swagger';

export class LltannouncementResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  courseId: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  createUser: string;

  @ApiProperty()
  createDate: Date;

  @ApiProperty({ description: 'จำนวนเมลที่ส่งสำเร็จ' })
  emailsSent: number;

  @ApiProperty({ description: 'จำนวนเมลที่ส่งไม่สำเร็จ' })
  emailsFailed: number;

  @ApiProperty({ description: 'จำนวนนักศึกษาที่ไม่มี email' })
  emailsSkipped: number;
}
