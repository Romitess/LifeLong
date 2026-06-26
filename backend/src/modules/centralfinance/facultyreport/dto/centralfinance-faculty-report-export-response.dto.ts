import { ApiProperty } from '@nestjs/swagger';
import {
  CentralFinanceFacultyReportCourseItemDto,
  CentralFinanceFacultyReportFilterOptionsDto,
  CentralFinanceFacultyReportSummaryDto,
} from './centralfinance-faculty-report-response.dto';

export class CentralFinanceFacultyReportExportFacultyGroupDto {
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

export class CentralFinanceFacultyReportExportResponseDto {
  @ApiProperty({ example: '2026-05-15T10:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: CentralFinanceFacultyReportFilterOptionsDto })
  filterOptions: CentralFinanceFacultyReportFilterOptionsDto;

  @ApiProperty({ type: CentralFinanceFacultyReportSummaryDto })
  summary: CentralFinanceFacultyReportSummaryDto;

  @ApiProperty({ example: 42 })
  totalRows: number;

  @ApiProperty({ type: [CentralFinanceFacultyReportExportFacultyGroupDto] })
  groups: CentralFinanceFacultyReportExportFacultyGroupDto[];
}
