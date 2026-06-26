import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lltcoursein } from '../courses/lltcourseins/entities/lltcoursein.entity';
import { LltEnroll } from '../enrollment/lltenroll/entities/llt-enroll.entity';
import { LltOpenclass } from '../lltcourse/entities/llt-openclass.entity';
import { Lltcourse } from '../lltcourse/entities/lltcourse.entity';
import { LltumUser } from '../auth/entities/lltum-user.entity';
import { Lltchat } from '../chat/lltchat/entities/lltchat.entity';
import { LltGradeItem } from './entities/llt-grade-item.entity';
import { LltImportGrade } from './entities/llt-import-grade.entity';
import { LltLogUpdateGrade } from './entities/llt-log-update-grade.entity';
import { MoodleModule } from '../moodle/moodle.module';
import { LltchatModule } from '../chat/lltchat/lltchat.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { LltcourseskillModule } from '../courses/lltcourseskill/lltcourseskill.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lltcourse,
      LltOpenclass,
      LltEnroll,
      LltumUser,
      Lltcoursein,
      Lltchat,
      LltGradeItem,
      LltImportGrade,
      LltLogUpdateGrade,
    ]),
    MoodleModule,
    LltchatModule,
    LltcourseskillModule,
  ],
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService],
})
export class InstructorModule {}
