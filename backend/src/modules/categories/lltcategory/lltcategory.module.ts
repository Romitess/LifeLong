import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcategoryService } from './lltcategory.service';
import { LltcategoryController } from './lltcategory.controller';
import { LltcategoryPublicController } from './lltcategory-public.controller';
import { Lltcategory } from './entities/lltcategory.entity';
import { Lltsubcategory } from '../lltsubcategory/entities/lltsubcategory.entity';
import { Lltcourse } from '../../lltcourse/entities/lltcourse.entity';
import { MoodleModule } from '../../moodle/moodle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcategory, Lltsubcategory, Lltcourse]), MoodleModule],
  controllers: [LltcategoryController, LltcategoryPublicController],
  providers: [LltcategoryService],
  exports: [LltcategoryService],
})
export class LltcategoryModule {}
