import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcourseskillService } from './lltcourseskill.service';
import { LltcourseskillController } from './lltcourseskill.controller';
import { Lltcourseskill } from './entities/lltcourseskill.entity';
import { LltUserSkill } from './entities/llt-user-skill.entity';
import { LltSkill } from './entities/llt-skill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcourseskill, LltUserSkill, LltSkill])],
  controllers: [LltcourseskillController],
  providers: [LltcourseskillService],
  exports: [LltcourseskillService],
})
export class LltcourseskillModule {}
