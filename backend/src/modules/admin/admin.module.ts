import { Module } from '@nestjs/common';
import { AdminCertTemplatesModule } from './cert-templates/admin-cert-templates.module';
import { AdminCertSignersModule } from './cert-signers/admin-cert-signers.module';
import { AdminCoursesModule } from './courses/admin-courses.module';
import { AdminDashboardModule } from './dashboard/admin-dashboard.module';
import { AdminReportsModule } from './reports/admin-reports.module';
import { AdminSlideshowModule } from './slideshow/admin-slideshow.module';

@Module({
  imports: [
    AdminDashboardModule,
    AdminReportsModule,
    AdminCoursesModule,
    AdminCertTemplatesModule,
    AdminCertSignersModule,
    AdminSlideshowModule,
  ],
})
export class AdminModule {}
