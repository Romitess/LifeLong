import { Module } from '@nestjs/common';
import { AdminCertSignersController } from './admin-cert-signers.controller';
import { AdminCertSignersService } from './admin-cert-signers.service';
import { AuthModule } from '../../auth/auth.module';
import { PlatformGatewayModule } from '../../platform-gateway/platform-gateway.module';

@Module({
  imports: [AuthModule, PlatformGatewayModule],
  controllers: [AdminCertSignersController],
  providers: [AdminCertSignersService],
})
export class AdminCertSignersModule {}
