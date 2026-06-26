import { Module } from '@nestjs/common';
import { ReceiptSummaryReportModule } from './receiptsummaryreport/receipt-summary-report.module';
import { CentralFinanceFacultyReportModule } from './facultyreport/centralfinance-faculty-report.module';
import { ReceiptUsageReportModule } from './receiptusagereport/receipt-usage-report.module';
import { CentralFinanceDashboardModule } from './dashboard/central-finance-dashboard.module';
import { FinanceDailyReportModule } from './dailyreport/finance-daily-report.module';

@Module({
  imports: [
    ReceiptSummaryReportModule,
    CentralFinanceFacultyReportModule,
    ReceiptUsageReportModule,
    CentralFinanceDashboardModule,
    FinanceDailyReportModule,
  ],
})
export class CentralFinanceModule {}
