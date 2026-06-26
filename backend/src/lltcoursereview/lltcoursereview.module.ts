import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcoursereviewService } from './lltcoursereview.service';
import { LltcoursereviewController } from './lltcoursereview.controller';
import { LltcoursereviewPublicController } from './lltcoursereview-public.controller';
import { Lltcoursereview } from './entities/lltcoursereview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcoursereview])],
  controllers: [LltcoursereviewController, LltcoursereviewPublicController],
  providers: [LltcoursereviewService],
  exports: [LltcoursereviewService],
})
export class LltcoursereviewModule {}
