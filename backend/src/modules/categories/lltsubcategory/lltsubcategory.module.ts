import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltsubcategoryService } from './lltsubcategory.service';
import { LltsubcategoryController } from './lltsubcategory.controller';
import { Lltsubcategory } from './entities/lltsubcategory.entity';
import { Lltcategory } from '../lltcategory/entities/lltcategory.entity';
import { Lltcourse } from '../../courses/lltcourse/entities/lltcourse.entity';
import { MoodleModule } from '../../moodle/moodle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lltsubcategory, Lltcategory, Lltcourse]), MoodleModule],
  controllers: [LltsubcategoryController],
  providers: [LltsubcategoryService],
  exports: [LltsubcategoryService],
})
export class LltsubcategoryModule {}
