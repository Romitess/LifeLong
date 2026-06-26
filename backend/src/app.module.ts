import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configuration } from './config/configuration';
import { envFilePaths } from './config/env-loader';
import { envValidationSchema } from './config/env.validation';
import { typeOrmModuleOptions } from './database/typeorm.config';
import { LltcourseModule } from './modules/lltcourse/lltcourse.module';
import { LltcourseinsModule } from './modules/courses/lltcourseins/lltcourseins.module';
import { LltcoursechapterModule } from './modules/courses/lltcoursechapter/lltcoursechapter.module';
import { LltcoursetargetModule } from './modules/courses/lltcoursetarget/lltcoursetarget.module';
import { LltcourseskillModule } from './modules/courses/lltcourseskill/lltcourseskill.module';
import { LltcoursefileModule } from './modules/courses/lltcoursefile/lltcoursefile.module';
import { LltcoursetypeclassModule } from './modules/courses/lltcoursetypeclass/lltcoursetypeclass.module';
import { LltcategoryModule } from './modules/categories/lltcategory/lltcategory.module';
import { LltsubcategoryModule } from './modules/categories/lltsubcategory/lltsubcategory.module';
import { LltfacultyModule } from './modules/faculties/lltfaculty/lltfaculty.module';
import { LlttypecourseModule } from './modules/categories/llttypecourse/llttypecourse.module';
import { LlttypestudyModule } from './modules/users/llttypestudy/llttypestudy.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { MoodleModule } from './modules/moodle/moodle.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { LltevaluationModule } from './modules/evaluations/lltevaluation/lltevaluation.module';
import { LlttargetModule } from './modules/targets/llttarget/llttarget.module';
import { LltsubtargetModule } from './modules/targets/lltsubtarget/lltsubtarget.module';
import { LltcostplanModule } from './modules/cost-plans/lltcostplan/lltcostplan.module';
import { LltenrollModule } from './modules/enrollment/lltenroll/lltenroll.module';
import { LltcoursesubchapterModule } from './modules/courses/lltcoursesubchapter/lltcoursesubchapter.module';
import { LltchatModule } from './modules/chat/lltchat/lltchat.module';
import { LlttypestudentModule } from './modules/users/llttypestudent/llttypestudent.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { PrivilegeModule } from './modules/privilege/privilege.module';
import { LltenrollreceiptModule } from './modules/enrollment/lltenrollreceipt/lltenrollreceipt.module';
import { LltannouncementModule } from './modules/announcements/lltannouncement/lltannouncement.module';
import { LltnotificationModule } from './modules/notifications/lltnotification/lltnotification.module';
import { LltumforgotpassModule } from './modules/auth/lltumforgotpass/lltumforgotpass.module';
import { LltopenclassModule } from './modules/courses/lltopenclass/lltopenclass.module';
import { CentralFinanceModule } from './modules/centralfinance/central-finance.module';
import { LltcertificatelogModule } from './modules/certificates/lltcertificatelog/lltcertificatelog.module';
import { LltcoursereviewModule } from './modules/courses/lltcoursereview/lltcoursereview.module';
import { PlatformGatewayModule } from './modules/platform-gateway/platform-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('rateLimitLoginTtl') ?? 60000,
            limit: configService.get<number>('rateLimitLoginLimit') ?? 5,
          },
        ],
        errorMessage: 'Too many login attempts. Please try again later.',
      }),
    }),
    AdminModule,
    AuthModule,
    InstructorModule,
    MoodleModule,
    LltcourseModule,
    LltcourseinsModule,
    LltcoursechapterModule,
    LltcoursetargetModule,
    LltcourseskillModule,
    LltcoursefileModule,
    LltcoursetypeclassModule,
    LltcategoryModule,
    LltsubcategoryModule,
    LltfacultyModule,
    LlttypecourseModule,
    LlttypestudyModule,
    LltevaluationModule,
    LlttargetModule,
    LltsubtargetModule,
    LltcostplanModule,
    LltenrollModule,
    LltcoursesubchapterModule,
    LltchatModule,
    LlttypestudentModule,
    ProgressModule,
    CertificatesModule,
    PrivilegeModule,
    LltenrollreceiptModule,
    LltannouncementModule,
    LltnotificationModule,
    LltumforgotpassModule,
    LltopenclassModule,
    CentralFinanceModule,
    LltcertificatelogModule,
    LltcoursereviewModule,
    PlatformGatewayModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
