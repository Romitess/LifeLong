import { Module } from '@nestjs/common';
import { LltcoursefileService } from './lltcoursefile.service';
import { LltcoursefileController } from './lltcoursefile.controller';

@Module({
  controllers: [LltcoursefileController],
  providers: [LltcoursefileService],
})
export class LltcoursefileModule {}
