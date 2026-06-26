import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CentralFinanceFacultyReportService } from './centralfinance-faculty-report.service';
import { CentralFinanceFacultyReportQueryDto } from './dto/centralfinance-faculty-report-query.dto';
import { CentralFinanceFacultyReportResponseDto } from './dto/centralfinance-faculty-report-response.dto';
import { CentralFinanceFacultyReportExportQueryDto } from './dto/centralfinance-faculty-report-export-query.dto';
import { CentralFinanceFacultyReportExportResponseDto } from './dto/centralfinance-faculty-report-export-response.dto';

@ApiTags('centralfinance')
@ApiBearerAuth()
@Roles(Role.CentralFinance)
@Controller('centralfinance/reports')
export class CentralFinanceFacultyReportController {
  constructor(private readonly service: CentralFinanceFacultyReportService) {}

  @Get('registration-statistics')
  @ApiOperation({ summary: 'รายงานสถิติการลงทะเบียนแยกตามคณะ/ส่วนงาน (Central Finance)' })
  @ApiOkResponse({ type: CentralFinanceFacultyReportResponseDto })
  getRegistrationStatistics(
    @Query() query: CentralFinanceFacultyReportQueryDto,
  ): ReturnType<CentralFinanceFacultyReportService['getRegistrationStatisticsReport']> {
    return this.service.getRegistrationStatisticsReport(query);
  }

  @Get('registration-statistics/export')
  @ApiOperation({
    summary: 'Export รายงานสถิติการลงทะเบียน ทุก row ไม่มี pagination (Central Finance)',
  })
  @ApiOkResponse({ type: CentralFinanceFacultyReportExportResponseDto })
  exportRegistrationStatistics(
    @Query() query: CentralFinanceFacultyReportExportQueryDto,
  ): ReturnType<CentralFinanceFacultyReportService['exportRegistrationStatistics']> {
    return this.service.exportRegistrationStatistics(query);
  }
}
