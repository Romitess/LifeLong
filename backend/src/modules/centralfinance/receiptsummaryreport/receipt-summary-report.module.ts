import { Module } from '@nestjs/common';
import { ReceiptSummaryReportController } from './receipt-summary-report.controller';
import { ReceiptSummaryReportService } from './receipt-summary-report.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReceiptSummaryReportController],
  providers: [ReceiptSummaryReportService],
})
export class ReceiptSummaryReportModule {}
