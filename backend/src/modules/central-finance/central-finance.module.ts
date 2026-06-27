import { Module } from '@nestjs/common';
import { ReceiptSummaryReportModule } from './receipt-summary-report/receipt-summary-report.module';
import { CentralFinanceFacultyReportModule } from './faculty-report/centralfinance-faculty-report.module';
import { ReceiptUsageReportModule } from './receipt-usage-report/receipt-usage-report.module';
import { CentralFinanceDashboardModule } from './dashboard/central-finance-dashboard.module';
import { FinanceDailyReportModule } from './daily-report/finance-daily-report.module';

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
