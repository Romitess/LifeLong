import { Module } from '@nestjs/common';
import { CentralFinanceFacultyReportController } from './centralfinance-faculty-report.controller';
import { CentralFinanceFacultyReportService } from './centralfinance-faculty-report.service';

@Module({
  controllers: [CentralFinanceFacultyReportController],
  providers: [CentralFinanceFacultyReportService],
})
export class CentralFinanceFacultyReportModule {}
