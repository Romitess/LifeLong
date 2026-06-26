import { forwardRef, Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { CertificatesModule } from '../certificates/certificates.module';
import { MoodleModule } from '../moodle/moodle.module';
import { LltcourseskillModule } from '../../lltcourseskill/lltcourseskill.module';

@Module({
  imports: [forwardRef(() => CertificatesModule), MoodleModule, LltcourseskillModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
