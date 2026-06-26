import { Module } from '@nestjs/common';
import { LltenrollController } from './lltenroll.controller';
import { LltenrollService } from './lltenroll.service';

@Module({
  controllers: [LltenrollController],
  providers: [LltenrollService],
  exports: [LltenrollService],
})
export class LltenrollModule {}
