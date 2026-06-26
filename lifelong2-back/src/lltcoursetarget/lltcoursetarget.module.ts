import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcoursetargetService } from './lltcoursetarget.service';
import { LltcoursetargetController } from './lltcoursetarget.controller';
import { Lltcoursetarget } from './entities/lltcoursetarget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcoursetarget])],
  controllers: [LltcoursetargetController],
  providers: [LltcoursetargetService],
})
export class LltcoursetargetModule {}
