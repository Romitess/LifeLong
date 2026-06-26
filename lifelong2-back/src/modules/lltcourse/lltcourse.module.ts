import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcourseService } from './lltcourse.service';
import { LltcourseController } from './lltcourse.controller';
import { Lltcourse } from './entities/lltcourse.entity';
import { LltOpenclass } from './entities/llt-openclass.entity';
import { LltOpenclassIns } from './entities/llt-openclassins.entity';
import { LltEnroll } from '../../lltenroll/entities/llt-enroll.entity';
import { LltOpenclassClick } from './entities/llt-openclass-click.entity';
import { LltumUser } from '../auth/entities/lltum-user.entity';
import { MoodleModule } from '../moodle/moodle.module';
import { LltchatModule } from '../../lltchat/lltchat.module';
import { LltenrollModule } from '../../lltenroll/lltenroll.module';
import { Lltevaluation } from '../../lltevaluation/entities/lltevaluation.entity';
import { Lltcategory } from '../../lltcategory/entities/lltcategory.entity';
import { Lltsubcategory } from '../../lltsubcategory/entities/lltsubcategory.entity';
import { Lltcoursein } from '../../lltcourseins/entities/lltcoursein.entity';
import { Lltcoursetarget } from '../../lltcoursetarget/entities/lltcoursetarget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lltcourse,
      LltOpenclass,
      LltOpenclassIns,
      LltEnroll,
      LltOpenclassClick,
      LltumUser,
      Lltevaluation,
      Lltcategory,
      Lltsubcategory,
      Lltcoursein,
      Lltcoursetarget,
    ]),
    MoodleModule,
    LltchatModule,
    LltenrollModule,
  ],
  controllers: [LltcourseController],
  providers: [LltcourseService],
  exports: [LltcourseService],
})
export class LltcourseModule {}
