import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LltopenclassService } from './lltopenclass.service';
import { LltopenclassController } from './lltopenclass.controller';
import { LltopenclassPublicController } from './lltopenclass-public.controller';
import { Lltopenclass } from './entities/lltopenclass.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lltopenclass])],
  controllers: [LltopenclassController, LltopenclassPublicController],
  providers: [LltopenclassService],
  exports: [LltopenclassService],
})
export class LltopenclassModule {}
