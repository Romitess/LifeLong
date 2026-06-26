import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { FinanceDailyReportService, FinanceDailyReportItem } from './finance-daily-report.service';
import { FinanceDailyReportQueryDto } from './dto/finance-daily-report-query.dto';

@ApiTags('centralfinance')
@ApiBearerAuth()
@Controller('centralfinance')
export class FinanceDailyReportController {
  constructor(private readonly service: FinanceDailyReportService) {}

  @Get('daily-report/faculty-options')
  @Roles(Role.CentralFinance, Role.Finance)
  @ApiOperation({ summary: 'ดึงรายชื่อคณะ/ส่วนงานสำหรับ dropdown รายงานประจำวัน' })
  getFacultyOptions(): Promise<{ id: number; name: string }[]> {
    return this.service.getFacultyOptions();
  }

  @Get('daily-report/course-options')
  @Roles(Role.CentralFinance, Role.Finance)
  @ApiOperation({ summary: 'ดึงรายชื่อหลักสูตรสำหรับ dropdown' })
  getCourseOptions(@Query('facId') facId?: number): Promise<{ id: string; name: string }[]> {
    return this.service.getCourseOptions(facId);
  }

  @Get('daily-report')
  @Roles(Role.CentralFinance, Role.Finance)
  @ApiOperation({
    summary: 'รายงานประจำวัน: รายการใบเสร็จรับเงินแยกตามหลักสูตรและแหล่งเงิน',
    description:
      'central_finance เห็นทุกส่วนงาน | finance เห็นเฉพาะส่วนงานตัวเอง (ส่ง facName ตาม faculty ของ user)',
  })
  @ApiOkResponse({
    description: 'รายการใบเสร็จรับเงิน',
    schema: {
      example: {
        success: true,
        total: 5,
        data: [
          {
            id: 101,
            no: 1,
            courseCode: 'C67052002',
            courseName: 'การพัฒนาเว็บแอปพลิเคชัน',
            fundCode: null,
            fundName: null,
            amount: 3500,
            faculty: 'สำนักคอมพิวเตอร์',
            receiptDate: '27/05/2569',
            receiptStatus: 'ใช้งาน',
          },
        ],
      },
    },
  })
  getDailyReport(
    @Query() query: FinanceDailyReportQueryDto,
  ): Promise<{ success: true; total: number; data: FinanceDailyReportItem[] }> {
    return this.service.getDailyReport(query);
  }
}
