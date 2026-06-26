import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcourseService } from './lltcourse.service';
import { LltcourseController } from './lltcourse.controller';
import { Lltcourse } from './entities/lltcourse.entity';
import { LltOpenclass } from './entities/llt-openclass.entity';
import { LltOpenclassIns } from './entities/llt-openclassins.entity';
import { LltEnroll } from '../enrollment/lltenroll/entities/llt-enroll.entity';
import { LltOpenclassClick } from './entities/llt-openclass-click.entity';
import { LltumUser } from '../auth/entities/lltum-user.entity';
import { MoodleModule } from '../moodle/moodle.module';
import { LltchatModule } from '../chat/lltchat/lltchat.module';
import { LltenrollModule } from '../enrollment/lltenroll/lltenroll.module';
import { Lltevaluation } from '../evaluations/lltevaluation/entities/lltevaluation.entity';
import { Lltcategory } from '../categories/lltcategory/entities/lltcategory.entity';
import { Lltsubcategory } from '../categories/lltsubcategory/entities/lltsubcategory.entity';
import { Lltcoursein } from '../courses/lltcourseins/entities/lltcoursein.entity';
import { Lltcoursetarget } from '../courses/lltcoursetarget/entities/lltcoursetarget.entity';
import { PlatformGatewayModule } from '../platform-gateway/platform-gateway.module';

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
    PlatformGatewayModule,
  ],
  controllers: [LltcourseController],
  providers: [LltcourseService],
  exports: [LltcourseService],
})
export class LltcourseModule {}
