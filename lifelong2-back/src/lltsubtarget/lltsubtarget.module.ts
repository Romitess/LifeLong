import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltsubtargetService } from './lltsubtarget.service';
import { LltsubtargetController } from './lltsubtarget.controller';
import { Lltsubtarget } from './entities/lltsubtarget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltsubtarget])],
  controllers: [LltsubtargetController],
  providers: [LltsubtargetService],
  exports: [LltsubtargetService, TypeOrmModule],
})
export class LltsubtargetModule {}
