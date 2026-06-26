import { Controller, Get, ParseIntPipe, Query, DefaultValuePipe } from '@nestjs/common';
import { AdminDashboardResponseDto } from './dto/admin-dashboard-response.dto';
import { AdminDashboardService, DashboardPeriod } from './admin-dashboard.service';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';

const VALID_PERIODS: DashboardPeriod[] = [
  'month',
  'q1',
  'q2',
  'q3',
  'q4',
  'h1',
  'h2',
  'year',
  'rolling12',
  'yearly',
  'allTime',
  'custom',
];

@Roles(Role.Admin)
@Controller('admin')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('dashboard')
  getDashboard(
    @Query('period') period?: string,
    @Query('year', new DefaultValuePipe(0), ParseIntPipe) year?: number,
    @Query('month', new DefaultValuePipe(0), ParseIntPipe) month?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<AdminDashboardResponseDto> {
    const now = new Date();
    const safePeriod: DashboardPeriod = VALID_PERIODS.includes(period as DashboardPeriod)
      ? (period as DashboardPeriod)
      : 'rolling12';
    const safeYear =
      year && year >= 2000 && year <= now.getFullYear() + 1 ? year : now.getFullYear();
    const safeMonth = month && month >= 1 && month <= 12 ? month : undefined;
    return this.adminDashboardService.getDashboard(
      safePeriod,
      safeYear,
      safeMonth,
      dateFrom,
      dateTo,
    );
  }
}
