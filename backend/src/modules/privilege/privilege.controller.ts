import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PrivilegeService } from './privilege.service';
import { CheckPrivilegeDto } from './dto/check-privilege.dto';
import { PrivilegeResponseDto } from './dto/privilege-response.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';

@Controller('privilege')
export class PrivilegeController {
  constructor(private readonly privilegeService: PrivilegeService) {}

  @Post('check')
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  checkPrivilege(
    @Body() dto: CheckPrivilegeDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PrivilegeResponseDto> {
    return this.privilegeService.checkAndUpsert(user.lltumSub, user.email, dto);
  }

  @Get('me')
  getMyPrivilege(@CurrentUser() user: JwtPayload): Promise<PrivilegeResponseDto> {
    return this.privilegeService.getMyPrivilege(user.lltumSub);
  }

  @Get('has-citizen-id')
  hasCitizenId(@CurrentUser() user: JwtPayload): Promise<boolean> {
    return this.privilegeService.hasCitizenId(user.lltumSub);
  }
}
