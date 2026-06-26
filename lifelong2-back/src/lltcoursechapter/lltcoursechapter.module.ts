import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcoursechapterService } from './lltcoursechapter.service';
import { LltcoursechapterController } from './lltcoursechapter.controller';
import { Lltcoursechapter } from './entities/lltcoursechapter.entity';
import { Lltcourse } from '../modules/lltcourse/entities/lltcourse.entity';
import { Lltcoursesubchapter } from '../lltcoursesubchapter/entities/lltcoursesubchapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcoursechapter, Lltcourse, Lltcoursesubchapter])],
  controllers: [LltcoursechapterController],
  providers: [LltcoursechapterService],
  exports: [LltcoursechapterService],
})
export class LltcoursechapterModule {}
