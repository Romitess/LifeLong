import { Module } from '@nestjs/common';
import { AdminCertSignersController } from './admin-cert-signers.controller';
import { AdminCertSignersService } from './admin-cert-signers.service';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminCertSignersController],
  providers: [AdminCertSignersService],
})
export class AdminCertSignersModule {}
