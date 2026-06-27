import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lltevaluation } from './entities/lltevaluation.entity';
import { LltevaluationController } from './lltevaluation.controller';
import { LltevaluationService } from './lltevaluation.service';
import { Lltcourse } from 'src/modules/courses/lltcourse/entities/lltcourse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltevaluation, Lltcourse])],
  controllers: [LltevaluationController],
  providers: [LltevaluationService],
})
export class LltevaluationModule {}
