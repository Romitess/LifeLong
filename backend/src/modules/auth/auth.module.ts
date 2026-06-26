import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LltAuthUser } from './entities/llt-auth-user.entity';
import { LltumUser } from './entities/lltum-user.entity';
import { LltUmtlog } from './entities/llt-umtlog.entity';
import { MoodleModule } from '../moodle/moodle.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AppConfig } from '../../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([LltAuthUser, LltumUser, LltUmtlog]),
    MoodleModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<AppConfig>) => ({
        secret: configService.get('jwtSecret'),
        signOptions: { expiresIn: '8h' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
