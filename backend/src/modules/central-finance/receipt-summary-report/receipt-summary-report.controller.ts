import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import {
  ReceiptSummaryReportService,
  CentralReceiptSummaryItem,
} from './receipt-summary-report.service';
import { ReceiptSummaryReportQueryDto } from './dto/receipt-summary-report-query.dto';

@ApiTags('centralfinance')
@ApiBearerAuth()
@Roles(Role.CentralFinance)
@Controller('centralfinance')
export class ReceiptSummaryReportController {
  constructor(private readonly receiptSummaryReportService: ReceiptSummaryReportService) {}

  @Get('receipt-summary')
  @ApiOperation({ summary: 'รายงานสรุปใบเสร็จรับเงินทุกส่วนงาน (Central Finance)' })
  getReceiptSummary(
    @Query() query: ReceiptSummaryReportQueryDto,
  ): Promise<{ success: true; total: number; data: CentralReceiptSummaryItem[] }> {
    return this.receiptSummaryReportService.getReceiptSummary(query);
  }
}
