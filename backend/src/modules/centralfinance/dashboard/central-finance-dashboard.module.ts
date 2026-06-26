import { Module } from '@nestjs/common';
import { CentralFinanceDashboardController } from './central-finance-dashboard.controller';
import { CentralFinanceDashboardService } from './central-finance-dashboard.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CentralFinanceDashboardController],
  providers: [CentralFinanceDashboardService],
})
export class CentralFinanceDashboardModule {}
