import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminCoursesController } from './admin-courses.controller';
import { AdminCoursesService } from './admin-courses.service';
import { MoodleModule } from '../../moodle/moodle.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [ConfigModule, MoodleModule, AuthModule],
  controllers: [AdminCoursesController],
  providers: [AdminCoursesService],
})
export class AdminCoursesModule {}
