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
import { LltcourseinsModule } from './lltcourseins/lltcourseins.module';
import { LltcoursechapterModule } from './lltcoursechapter/lltcoursechapter.module';
import { LltcoursetargetModule } from './lltcoursetarget/lltcoursetarget.module';
import { LltcourseskillModule } from './lltcourseskill/lltcourseskill.module';
import { LltcoursefileModule } from './lltcoursefile/lltcoursefile.module';
import { LltcoursetypeclassModule } from './lltcoursetypeclass/lltcoursetypeclass.module';
import { LltcategoryModule } from './lltcategory/lltcategory.module';
import { LltsubcategoryModule } from './lltsubcategory/lltsubcategory.module';
import { LltfacultyModule } from './lltfaculty/lltfaculty.module';
import { LlttypecourseModule } from './llttypecourse/llttypecourse.module';
import { LlttypestudyModule } from './llttypestudy/llttypestudy.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { MoodleModule } from './modules/moodle/moodle.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { LltevaluationModule } from './lltevaluation/lltevaluation.module';
import { LlttargetModule } from './llttarget/llttarget.module';
import { LltsubtargetModule } from './lltsubtarget/lltsubtarget.module';
import { LltcostplanModule } from './lltcostplan/lltcostplan.module';
import { LltenrollModule } from './lltenroll/lltenroll.module';
import { LltcoursesubchapterModule } from './lltcoursesubchapter/lltcoursesubchapter.module';
import { LltchatModule } from './lltchat/lltchat.module';
import { LlttypestudentModule } from './llttypestudent/llttypestudent.module';
import { ProgressModule } from './modules/progress/progress.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { PrivilegeModule } from './modules/privilege/privilege.module';
import { LltenrollreceiptModule } from './lltenrollreceipt/lltenrollreceipt.module';
import { LltannouncementModule } from './lltannouncement/lltannouncement.module';
import { LltnotificationModule } from './lltnotification/lltnotification.module';
import { LltumforgotpassModule } from './lltumforgotpass/lltumforgotpass.module';
import { LltopenclassModule } from './lltopenclass/lltopenclass.module';
import { CentralFinanceModule } from './modules/centralfinance/central-finance.module';
import { LltcertificatelogModule } from './lltcertificatelog/lltcertificatelog.module';
import { LltcoursereviewModule } from './lltcoursereview/lltcoursereview.module';
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
