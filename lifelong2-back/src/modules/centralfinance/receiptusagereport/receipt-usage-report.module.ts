import { Module } from '@nestjs/common';
import { ReceiptUsageReportController } from './receipt-usage-report.controller';
import { ReceiptUsageReportService } from './receipt-usage-report.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ReceiptUsageReportController],
  providers: [ReceiptUsageReportService],
})
export class ReceiptUsageReportModule {}
