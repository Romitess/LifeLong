import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltfacultyService } from './lltfaculty.service';
import { LltfacultyController } from './lltfaculty.controller';
import { Lltfaculty } from './entities/lltfaculty.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltfaculty])],
  controllers: [LltfacultyController],
  providers: [LltfacultyService],
  exports: [LltfacultyService],
})
export class LltfacultyModule {}
