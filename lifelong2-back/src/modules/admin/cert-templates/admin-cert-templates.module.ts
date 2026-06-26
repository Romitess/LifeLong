import { Module } from '@nestjs/common';
import { AdminCertTemplatesController } from './admin-cert-templates.controller';
import { AdminCertTemplatesService } from './admin-cert-templates.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminCertTemplatesController],
  providers: [AdminCertTemplatesService],
})
export class AdminCertTemplatesModule {}
