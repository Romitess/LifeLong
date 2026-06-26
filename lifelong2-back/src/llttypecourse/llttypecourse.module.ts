import { Module } from '@nestjs/common';
import { LlttypecourseService } from './llttypecourse.service';
import { LlttypecourseController } from './llttypecourse.controller';

@Module({
  controllers: [LlttypecourseController],
  providers: [LlttypecourseService],
})
export class LlttypecourseModule {}
