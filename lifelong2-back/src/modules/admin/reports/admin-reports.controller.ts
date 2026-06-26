import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminInterestedCoursesReportQueryDto } from './dto/admin-interested-courses-report-query.dto';
import { AdminInterestedCoursesReportResponseDto } from './dto/admin-interested-courses-report-response.dto';
import { AdminRegistrationStatisticsExportQueryDto } from './dto/admin-registration-statistics-export-query.dto';
import { AdminRegistrationStatisticsExportResponseDto } from './dto/admin-registration-statistics-export-response.dto';
import { AdminRegistrationStatisticsReportQueryDto } from './dto/admin-registration-statistics-report-query.dto';
import { AdminRegistrationStatisticsReportResponseDto } from './dto/admin-registration-statistics-report-response.dto';
import { AdminReportsService } from './admin-reports.service';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

@ApiTags('Admin Reports')
@Roles(Role.Admin, Role.Finance, Role.CentralFinance)
@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get('interested-courses')
  @ApiOperation({
    summary: 'Get the interested courses report ordered by views and registrations',
  })
  @ApiOkResponse({ type: AdminInterestedCoursesReportResponseDto })
  getInterestedCoursesReport(
    @Query() query: AdminInterestedCoursesReportQueryDto,
  ): Promise<AdminInterestedCoursesReportResponseDto> {
    return this.adminReportsService.getInterestedCoursesReport(query);
  }
  @Get('registration-statistics')
  @ApiOperation({
    summary: 'Get the registration statistics report grouped by faculty or organization',
  })
  @ApiOkResponse({ type: AdminRegistrationStatisticsReportResponseDto })
  getRegistrationStatisticsReport(
    @Query() query: AdminRegistrationStatisticsReportQueryDto,
  ): Promise<AdminRegistrationStatisticsReportResponseDto> {
    return this.adminReportsService.getRegistrationStatisticsReport(query);
  }

  @Get('registration-statistics/export')
  @ApiOperation({
    summary: 'Export the full registration statistics report (all rows, no pagination)',
  })
  @ApiOkResponse({ type: AdminRegistrationStatisticsExportResponseDto })
  exportRegistrationStatisticsReport(
    @Query() query: AdminRegistrationStatisticsExportQueryDto,
  ): Promise<AdminRegistrationStatisticsExportResponseDto> {
    return this.adminReportsService.exportRegistrationStatisticsReport(query);
  }
}
