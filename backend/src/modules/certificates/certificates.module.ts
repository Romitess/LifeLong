import { forwardRef, Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller';
import { AdminCertificatesController } from './admin-certificates.controller';
import { CertificatesService } from './certificates.service';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [forwardRef(() => ProgressModule)],
  controllers: [CertificatesController, AdminCertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
