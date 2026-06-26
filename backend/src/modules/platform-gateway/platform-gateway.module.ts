import { Global, Module } from '@nestjs/common';
import { PlatformGatewayController } from './platform-gateway.controller';
import { PlatformGatewayService } from './platform-gateway.service';

@Global()
@Module({
  controllers: [PlatformGatewayController],
  providers: [PlatformGatewayService],
  exports: [PlatformGatewayService],
})
export class PlatformGatewayModule {}
