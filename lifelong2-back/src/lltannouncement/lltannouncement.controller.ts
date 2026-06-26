import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { LltannouncementService } from './lltannouncement.service';
import { CreateLltannouncementDto } from './dto/create-lltannouncement.dto';
import { LltannouncementResponseDto } from './dto/lltannouncement-response.dto';
import { Lltannouncement } from './entities/lltannouncement.entity';

@ApiTags('announcements')
@Controller('announcements')
export class LltannouncementController {
  constructor(private readonly service: LltannouncementService) {}

  @Post()
  @Roles(Role.Instructor, Role.Admin)
  @ApiOperation({ summary: 'สร้างประกาศและส่งเมลแจ้งเตือนนักศึกษาที่ลงทะเบียนในวิชา' })
  create(
    @Body() dto: CreateLltannouncementDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LltannouncementResponseDto> {
    return this.service.create(dto, user.email);
  }

  @Get()
  @ApiOperation({ summary: 'ดึงรายการประกาศของวิชา' })
  @ApiQuery({ name: 'courseId', type: Number, description: 'รหัสวิชา' })
  findByCourse(@Query('courseId', ParseIntPipe) courseId: number): Promise<Lltannouncement[]> {
    return this.service.findByCourse(courseId);
  }

  @Patch(':id')
  @Roles(Role.Instructor, Role.Admin)
  @ApiOperation({ summary: 'แก้ไขประกาศ' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { title: string; content: string },
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltannouncement> {
    return this.service.update(id, dto, user.email);
  }

  @Delete(':id')
  @Roles(Role.Instructor, Role.Admin)
  @ApiOperation({ summary: 'ลบประกาศ' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ deleted: boolean }> {
    return this.service.remove(id);
  }
}
