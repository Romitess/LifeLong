import { ApiProperty } from '@nestjs/swagger';
import {
  AdminRegistrationStatisticsReportCourseItemDto,
  AdminRegistrationStatisticsReportFilterOptionsDto,
  AdminRegistrationStatisticsReportSummaryDto,
} from './admin-registration-statistics-report-response.dto';

export class AdminRegistrationStatisticsExportFacultyGroupDto {
  @ApiProperty({ example: 3 })
  facultyId: number;

  @ApiProperty({ example: 'คณะวิทยาการสารสนเทศ' })
  facultyName: string;

  @ApiProperty({ example: 'Faculty of Informatics', nullable: true })
  facultyNameEn: string | null;

  @ApiProperty({ example: 6 })
  totalCourses: number;

  @ApiProperty({ example: 81 })
  totalLearners: number;

  @ApiProperty({ example: 24000 })
  totalRegistrationFees: number;

  @ApiProperty({ type: [AdminRegistrationStatisticsReportCourseItemDto] })
  items: AdminRegistrationStatisticsReportCourseItemDto[];
}

export class AdminRegistrationStatisticsExportResponseDto {
  @ApiProperty({ example: '2026-05-15T10:00:00.000Z' })
  generatedAt: string;

  @ApiProperty({ type: AdminRegistrationStatisticsReportFilterOptionsDto })
  filterOptions: AdminRegistrationStatisticsReportFilterOptionsDto;

  @ApiProperty({ type: AdminRegistrationStatisticsReportSummaryDto })
  summary: AdminRegistrationStatisticsReportSummaryDto;

  @ApiProperty({ example: 42 })
  totalRows: number;

  @ApiProperty({ type: [AdminRegistrationStatisticsExportFacultyGroupDto] })
  groups: AdminRegistrationStatisticsExportFacultyGroupDto[];
}
