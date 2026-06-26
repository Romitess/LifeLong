import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlttypestudyService } from './llttypestudy.service';
import { LlttypestudyController } from './llttypestudy.controller';
import { Llttypestudy } from './entities/llttypestudy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Llttypestudy])],
  controllers: [LlttypestudyController],
  providers: [LlttypestudyService],
  exports: [LlttypestudyService],
})
export class LlttypestudyModule {}
