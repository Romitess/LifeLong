import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { LltcertificatelogService } from './lltcertificatelog.service';
import { CreateLltcertificatelogDto } from './dto/create-lltcertificatelog.dto';
import { Lltcertificatelog } from './entities/lltcertificatelog.entity';

@ApiTags('lltcertificatelog')
@Controller('lltcertificatelog')
export class LltcertificatelogController {
  constructor(private readonly lltcertificatelogService: LltcertificatelogService) {}

  @Post()
  @ApiOperation({ summary: 'บันทึกประวัติการดาวน์โหลดใบประกาศนียบัตร' })
  create(
    @Body() dto: CreateLltcertificatelogDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<Lltcertificatelog> {
    const rawIp =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.ip ??
      'unknown';
    const ip = rawIp.replace(/^::ffff:/, '').replace('::1', '127.0.0.1');
    return this.lltcertificatelogService.create(dto, user.sub, ip, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'ดึงรายการประวัติการสร้างใบประกาศนียบัตรทั้งหมด' })
  @ApiQuery({ name: 'userId', type: Number, required: false, description: 'กรองตามรหัสผู้ใช้งาน' })
  findAll(@Query('userId') userId?: string): Promise<Lltcertificatelog[]> {
    if (userId) {
      return this.lltcertificatelogService.findByUser(+userId);
    }
    return this.lltcertificatelogService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลประวัติการสร้างใบประกาศนียบัตรตาม ID' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltcertificatelog> {
    return this.lltcertificatelogService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบประวัติการสร้างใบประกาศนียบัตร' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: boolean }> {
    return this.lltcertificatelogService.remove(id);
  }
}
