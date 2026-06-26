import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltcoursetypeclassService } from './lltcoursetypeclass.service';
import { LltcoursetypeclassController } from './lltcoursetypeclass.controller';
import { Lltcoursetypeclass } from './entities/lltcoursetypeclass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltcoursetypeclass])],
  controllers: [LltcoursetypeclassController],
  providers: [LltcoursetypeclassService],
  exports: [LltcoursetypeclassService],
})
export class LltcoursetypeclassModule {}
