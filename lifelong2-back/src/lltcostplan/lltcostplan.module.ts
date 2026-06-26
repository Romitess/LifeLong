import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcostplanService } from './lltcostplan.service';
import { LltcostplanController } from './lltcostplan.controller';
import { Lltcostplan } from './entities/lltcostplan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcostplan])],
  controllers: [LltcostplanController],
  providers: [LltcostplanService],
})
export class LltcostplanModule {}
