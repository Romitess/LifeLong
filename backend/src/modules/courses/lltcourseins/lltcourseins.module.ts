import { Module } from '@nestjs/common';
import { LltcourseinsService } from './lltcourseins.service';
import { LltcourseinsController } from './lltcourseins.controller';

@Module({
  controllers: [LltcourseinsController],
  providers: [LltcourseinsService],
})
export class LltcourseinsModule {}
