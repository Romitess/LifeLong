import { ApiProperty } from '@nestjs/swagger';

export class AdminInterestedCourseReportSummaryDto {
  @ApiProperty({ example: 34 })
  totalCourses: number;

  @ApiProperty({ example: 271 })
  totalViews: number;

  @ApiProperty({ example: 120 })
  totalEnrollments: number;
}

export class AdminInterestedCourseReportPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 34 })
  total: number;

  @ApiProperty({ example: 4 })
  totalPages: number;
}

export class AdminInterestedCourseReportItemDto {
  @ApiProperty({ example: 1 })
  courseId: number;

  @ApiProperty({ example: 'C69253001', nullable: true })
  courseCode: string | null;

  @ApiProperty({ example: 'การประยุกต์ใช้ AI ในการทำวิจัย' })
  courseName: string;

  @ApiProperty({ example: 'รองศาสตราจารย์พิมพ์ใจ กิตติคุณ', nullable: true })
  responsibleName: string | null;

  @ApiProperty({ example: '2026-04-09T17:00:00.000Z', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: '2026-05-02T17:00:00.000Z', nullable: true })
  endDate: string | null;

  @ApiProperty({ example: 17 })
  viewCount: number;

  @ApiProperty({ example: 8 })
  enrollmentCount: number;
}

export class AdminInterestedCoursesReportResponseDto {
  @ApiProperty({ example: '2026-05-15T10:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: AdminInterestedCourseReportSummaryDto })
  summary: AdminInterestedCourseReportSummaryDto;

  @ApiProperty({ type: AdminInterestedCourseReportPaginationDto })
  pagination: AdminInterestedCourseReportPaginationDto;

  @ApiProperty({ type: [AdminInterestedCourseReportItemDto] })
  items: AdminInterestedCourseReportItemDto[];
}
