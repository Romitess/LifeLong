import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltenrollreceiptService } from './lltenrollreceipt.service';
import { LltenrollreceiptController } from './lltenrollreceipt.controller';
import { Lltenrollreceipt } from './entities/lltenrollreceipt.entity';
import { Lltreceipt } from './entities/lltreceipt.entity';
import { Lltexportreceiptlog } from './entities/lltexportreceiptlog.entity';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lltenrollreceipt, Lltreceipt, Lltexportreceiptlog]),
    AuthModule,
  ],
  controllers: [LltenrollreceiptController],
  providers: [LltenrollreceiptService],
  exports: [LltenrollreceiptService],
})
export class LltenrollreceiptModule {}
