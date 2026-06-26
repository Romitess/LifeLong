import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lltannouncement } from './entities/lltannouncement.entity';
import { LltannouncementController } from './lltannouncement.controller';
import { LltannouncementService } from './lltannouncement.service';
import { EmailModule } from '../../email/email.module';
import { LltnotificationModule } from '../../notifications/lltnotification/lltnotification.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lltannouncement]), EmailModule, LltnotificationModule],
  controllers: [LltannouncementController],
  providers: [LltannouncementService],
})
export class LltannouncementModule {}
