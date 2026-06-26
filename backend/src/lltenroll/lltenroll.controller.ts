import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { LltenrollQueryDto } from './dto/lltenroll-query.dto';
import { LltenrollResponseDto } from './dto/lltenroll-response.dto';
import { LltenrollService } from './lltenroll.service';

@ApiTags('LLTENROLL')
@Roles(Role.Admin, Role.Finance, Role.CentralFinance)
@Controller('lltenroll')
export class LltenrollController {
  constructor(private readonly lltenrollService: LltenrollService) {}

  @Get()
  @ApiOperation({
    summary: 'Get enrollments joined with LLTUMUSER by USER_ID',
  })
  @ApiOkResponse({ type: LltenrollResponseDto })
  findAll(
    @Query() query: LltenrollQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LltenrollResponseDto> {
    const currentUser = user as JwtPayload & { facCode?: number | string; facId?: number | null };
    return this.lltenrollService.findAll(
      query,
      currentUser.facCode ?? currentUser.facId,
      currentUser.sub,
    );
  }

  @Get('dashboard-stats')
  @ApiOperation({
    summary: 'Get dashboard statistics for finance',
  })
  async getDashboardStats(
    @Query('period') period: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    todayRevenue: number;
    yesterdayRevenue: number;
    pendingReceipts: number;
    issuedReceipts: number;
    totalTransactions: number;
  }> {
    const currentUser = user as JwtPayload & { facCode?: number | string; facId?: number | null };
    return this.lltenrollService.getDashboardStats(
      currentUser.facCode ?? currentUser.facId,
      currentUser.sub,
      period,
      dateFrom,
      dateTo,
    );
  }

  @Get('dashboard-trend')
  @ApiOperation({
    summary: 'Get monthly trend data for finance dashboard chart',
  })
  async getDashboardTrend(
    @Query('period') period: string,
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    months: string[];
    enrollments: number[];
    paidEnrollments: number[];
    revenue: number[];
  }> {
    const currentUser = user as JwtPayload & { facCode?: number | string; facId?: number | null };
    return this.lltenrollService.getDashboardTrend(
      currentUser.facCode ?? currentUser.facId,
      currentUser.sub,
      period,
      dateFrom,
      dateTo,
    );
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Get recent activity feed for finance dashboard',
  })
  async getRecentActivity(@CurrentUser() user: JwtPayload): Promise<{
    activities: {
      type: string;
      title: string;
      detail: string;
      time: string;
      icon: string;
      color: string;
    }[];
  }> {
    const currentUser = user as JwtPayload & { facCode?: number | string; facId?: number | null };
    return this.lltenrollService.getRecentActivity(
      currentUser.facCode ?? currentUser.facId,
      currentUser.sub,
    );
  }
}
