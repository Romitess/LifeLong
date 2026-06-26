import { Module } from '@nestjs/common';
import { AdminCertTemplatesController } from './admin-cert-templates.controller';
import { AdminCertTemplatesService } from './admin-cert-templates.service';
import { AuthModule } from '../../auth/auth.module';
import { PlatformGatewayModule } from '../../platform-gateway/platform-gateway.module';

@Module({
  imports: [AuthModule, PlatformGatewayModule],
  controllers: [AdminCertTemplatesController],
  providers: [AdminCertTemplatesService],
})
export class AdminCertTemplatesModule {}
