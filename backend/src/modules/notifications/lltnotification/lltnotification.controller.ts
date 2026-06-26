import { Controller, Get, Patch, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { LltnotificationService } from './lltnotification.service';
import { Lltnotification } from './entities/lltnotification.entity';

@ApiTags('notifications')
@Controller('notifications')
export class LltnotificationController {
  constructor(private readonly service: LltnotificationService) {}

  @Get()
  @ApiOperation({ summary: 'ดึงการแจ้งเตือนของผู้ใช้ปัจจุบัน' })
  findMine(@CurrentUser() user: JwtPayload): Promise<Lltnotification[]> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.service.findByUser(user.lltumSub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'ทำเครื่องหมายว่าอ่านแล้ว' })
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload): Promise<void> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.service.markRead(id, user.lltumSub);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว' })
  markAllRead(@CurrentUser() user: JwtPayload): Promise<void> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.service.markAllRead(user.lltumSub);
  }
}
