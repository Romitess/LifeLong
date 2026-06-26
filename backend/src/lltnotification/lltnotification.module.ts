import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lltnotification } from './entities/lltnotification.entity';
import { LltnotificationController } from './lltnotification.controller';
import { LltnotificationService } from './lltnotification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lltnotification])],
  controllers: [LltnotificationController],
  providers: [LltnotificationService],
  exports: [LltnotificationService],
})
export class LltnotificationModule {}
