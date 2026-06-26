import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { ReceiptUsageReportService, ReceiptUsageItem } from './receipt-usage-report.service';
import { ReceiptUsageReportQueryDto } from './dto/receipt-usage-report-query.dto';

@ApiTags('centralfinance')
@ApiBearerAuth()
@Roles(Role.CentralFinance)
@Controller('centralfinance')
export class ReceiptUsageReportController {
  constructor(private readonly receiptUsageReportService: ReceiptUsageReportService) {}

  @Get('receipt-usage/faculty-options')
  @ApiOperation({ summary: 'ดึงรายชื่อคณะ/ส่วนงานทั้งหมดสำหรับ dropdown (Central Finance)' })
  getFacultyOptions(): Promise<{ id: number; name: string }[]> {
    return this.receiptUsageReportService.getFacultyOptions();
  }

  @Get('receipt-usage')
  @ApiOperation({ summary: 'รายงานการใช้ใบเสร็จรับเงินทุกส่วนงาน (Central Finance)' })
  getReceiptUsage(
    @Query() query: ReceiptUsageReportQueryDto,
  ): Promise<{ success: true; total: number; data: ReceiptUsageItem[] }> {
    return this.receiptUsageReportService.getReceiptUsage(query);
  }
}
