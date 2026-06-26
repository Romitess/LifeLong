import { ApiProperty } from '@nestjs/swagger';

export class CentralFinanceFacultyReportFilterOptionDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'คณะวิทยาการสารสนเทศ' })
  label: string;
}

export class CentralFinanceFacultyReportFilterOptionsDto {
  @ApiProperty({ type: [CentralFinanceFacultyReportFilterOptionDto] })
  faculties: CentralFinanceFacultyReportFilterOptionDto[];

  @ApiProperty({ type: [CentralFinanceFacultyReportFilterOptionDto] })
  courseTypes: CentralFinanceFacultyReportFilterOptionDto[];
}

export class CentralFinanceFacultyReportSummaryDto {
  @ApiProperty({ example: 18 })
  totalCourses: number;

  @ApiProperty({ example: 256 })
  totalLearners: number;

  @ApiProperty({ example: 145000 })
  totalRegistrationFees: number;
}

export class CentralFinanceFacultyReportPaginationDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  pageSize: number;

  @ApiProperty({ example: 18 })
  total: number;

  @ApiProperty({ example: 2 })
  totalPages: number;
}

export class CentralFinanceFacultyReportCourseItemDto {
  @ApiProperty({ example: 1 })
  rowNumber: number;

  @ApiProperty({ example: 101 })
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

  @ApiProperty({ example: 24 })
  learnerCount: number;

  @ApiProperty({ example: 2800 })
  unitPrice: number;

  @ApiProperty({ example: 3500 })
  registrationFee: number;
}

export class CentralFinanceFacultyReportFacultyGroupDto {
  @ApiProperty({ example: 3 })
  facultyId: number;

  @ApiProperty({ example: 'คณะวิทยาการสารสนเทศ' })
  facultyName: string;

  @ApiProperty({ example: 6 })
  totalCourses: number;

  @ApiProperty({ example: 81 })
  totalLearners: number;

  @ApiProperty({ example: 24000 })
  totalRegistrationFees: number;

  @ApiProperty({ type: [CentralFinanceFacultyReportCourseItemDto] })
  items: CentralFinanceFacultyReportCourseItemDto[];
}

export class CentralFinanceFacultyReportResponseDto {
  @ApiProperty({ example: '2026-05-15T10:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: CentralFinanceFacultyReportFilterOptionsDto })
  filterOptions: CentralFinanceFacultyReportFilterOptionsDto;

  @ApiProperty({ type: CentralFinanceFacultyReportSummaryDto })
  summary: CentralFinanceFacultyReportSummaryDto;

  @ApiProperty({ type: CentralFinanceFacultyReportPaginationDto })
  pagination: CentralFinanceFacultyReportPaginationDto;

  @ApiProperty({ type: [CentralFinanceFacultyReportFacultyGroupDto] })
  groups: CentralFinanceFacultyReportFacultyGroupDto[];
}
