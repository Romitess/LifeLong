import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcoursesubchapterService } from './lltcoursesubchapter.service';
import { LltcoursesubchapterController } from './lltcoursesubchapter.controller';
import { Lltcoursesubchapter } from './entities/lltcoursesubchapter.entity';
import { Lltcoursechapter } from '../lltcoursechapter/entities/lltcoursechapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcoursesubchapter, Lltcoursechapter])],
  controllers: [LltcoursesubchapterController],
  providers: [LltcoursesubchapterService],
  exports: [LltcoursesubchapterService],
})
export class LltcoursesubchapterModule {}
