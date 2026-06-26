import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lltcertificatelog } from './entities/lltcertificatelog.entity';
import { LltcertificatelogController } from './lltcertificatelog.controller';
import { LltcertificatelogService } from './lltcertificatelog.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcertificatelog])],
  controllers: [LltcertificatelogController],
  providers: [LltcertificatelogService],
  exports: [LltcertificatelogService],
})
export class LltcertificatelogModule {}
