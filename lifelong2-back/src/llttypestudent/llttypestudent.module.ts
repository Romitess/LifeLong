import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Llttypestudent } from './entities/llttypestudent.entity';
import { LlttypestudentController } from './llttypestudent.controller';
import { LlttypestudentService } from './llttypestudent.service';

@Module({
  imports: [TypeOrmModule.forFeature([Llttypestudent])],
  controllers: [LlttypestudentController],
  providers: [LlttypestudentService],
})
export class LlttypestudentModule {}
