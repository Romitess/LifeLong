import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltchatService } from './lltchat.service';
import { LltchatController } from './lltchat.controller';
import { Lltchat } from './entities/lltchat.entity';
import { ChatGateway } from './chat-gateway';
import { LltEnroll } from '../../enrollment/lltenroll/entities/llt-enroll.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lltchat, LltEnroll]), AuthModule],
  controllers: [LltchatController],
  providers: [LltchatService, ChatGateway],
  exports: [LltchatService, ChatGateway],
})
export class LltchatModule {}
