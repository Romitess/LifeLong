import { Module } from '@nestjs/common';
import { FinanceDailyReportController } from './finance-daily-report.controller';
import { FinanceDailyReportService } from './finance-daily-report.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FinanceDailyReportController],
  providers: [FinanceDailyReportService],
})
export class FinanceDailyReportModule {}
