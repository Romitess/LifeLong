import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltumforgotpassService } from './lltumforgotpass.service';
import { LltumforgotpassController } from './lltumforgotpass.controller';
import { Lltumforgotpass } from './entities/lltumforgotpass.entity';
import { LltAuthUser } from '../entities/llt-auth-user.entity';
import { LltumUser } from '../entities/lltum-user.entity';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Lltumforgotpass, LltAuthUser, LltumUser]), EmailModule],
  controllers: [LltumforgotpassController],
  providers: [LltumforgotpassService],
  exports: [LltumforgotpassService],
})
export class LltumforgotpassModule {}
