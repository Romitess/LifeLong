import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/public.decorator';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { LltumforgotpassService } from './lltumforgotpass.service';
import { CreateLltumforgotpassDto } from './dto/create-lltumforgotpass.dto';
import { UpdateLltumforgotpassDto } from './dto/update-lltumforgotpass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Lltumforgotpass } from './entities/lltumforgotpass.entity';

@ApiTags('forgot-password')
@Controller('lltumforgotpass')
export class LltumforgotpassController {
  constructor(private readonly service: LltumforgotpassService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'ขอรีเซ็ตรหัสผ่าน' })
  requestReset(@Body() dto: CreateLltumforgotpassDto): Promise<{ message: string }> {
    return this.service.requestReset(dto);
  }

  @Public()
  @Get('verify/:key')
  @ApiOperation({ summary: 'ตรวจสอบความถูกต้องของ key รีเซ็ตรหัสผ่าน' })
  verifyKey(@Param('key') key: string): Promise<{ valid: boolean; email?: string }> {
    return this.service.verifyKey(key);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'เปลี่ยนรหัสผ่านใหม่ด้วย key ที่ได้รับทางอีเมล' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.service.resetPassword(dto);
  }

  @Public()
  @Patch('complete/:key')
  @ApiOperation({ summary: 'ยืนยันการเปลี่ยนรหัสผ่านสำเร็จ' })
  completeReset(@Param('key') key: string): Promise<{ success: boolean }> {
    return this.service.completeReset(key);
  }

  @Roles(Role.Admin)
  @Get()
  @ApiOperation({ summary: 'ดูรายการคำขอรีเซ็ตรหัสผ่านทั้งหมด (Admin)' })
  findAll(): Promise<Lltumforgotpass[]> {
    return this.service.findAll();
  }

  @Roles(Role.Admin)
  @Get(':id')
  @ApiOperation({ summary: 'ดูรายการคำขอรีเซ็ตรหัสผ่านตาม ID (Admin)' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltumforgotpass> {
    return this.service.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'แก้ไขรายการคำขอรีเซ็ตรหัสผ่าน (Admin)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltumforgotpassDto,
  ): Promise<Lltumforgotpass> {
    return this.service.update(id, dto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'ลบรายการคำขอรีเซ็ตรหัสผ่าน (Admin)' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: boolean }> {
    return this.service.remove(id);
  }
}
