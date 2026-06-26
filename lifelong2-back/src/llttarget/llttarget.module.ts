import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LlttargetService } from './llttarget.service';
import { LlttargetController } from './llttarget.controller';
import { Llttarget } from './entities/llttarget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Llttarget])],
  controllers: [LlttargetController],
  providers: [LlttargetService],
  exports: [LlttargetService, TypeOrmModule],
})
export class LlttargetModule {}
