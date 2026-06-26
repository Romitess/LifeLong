import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { CentralFinanceDashboardService } from './central-finance-dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

@ApiTags('centralfinance')
@ApiBearerAuth()
@Roles(Role.CentralFinance)
@Controller('centralfinance')
export class CentralFinanceDashboardController {
  constructor(private readonly dashboardService: CentralFinanceDashboardService) {}

  @Get('dashboard-stats')
  @ApiOperation({ summary: 'ดึง KPI สถิติ dashboard การเงินกลาง' })
  getDashboardStats(@Query() query: DashboardQueryDto): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    pendingReceipts: number;
    issuedReceipts: number;
  }> {
    return this.dashboardService.getDashboardStats(query);
  }

  @Get('dashboard-trend')
  @ApiOperation({ summary: 'ดึงข้อมูล trend รายเดือนสำหรับ dashboard การเงินกลาง' })
  getDashboardTrend(
    @Query() query: DashboardQueryDto,
  ): Promise<{ months: string[]; revenue: number[]; fundRequests: number[] }> {
    return this.dashboardService.getDashboardTrend(query);
  }

  @Get('dashboard-faculty-breakdown')
  @ApiOperation({ summary: 'ดึงยอดรายรับตามคณะ/ส่วนงาน top 6 สำหรับ dashboard การเงินกลาง' })
  getFacultyBreakdown(
    @Query() query: DashboardQueryDto,
  ): Promise<{ faculty: string; totalAmount: number }[]> {
    return this.dashboardService.getFacultyBreakdown(query);
  }
}
