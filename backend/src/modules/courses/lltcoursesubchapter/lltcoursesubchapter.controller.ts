import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { Role } from '../../auth/enums/role.enum';
import { LltcoursesubchapterService } from './lltcoursesubchapter.service';
import { CreateLltcoursesubchapterDto } from './dto/create-lltcoursesubchapter.dto';
import { UpdateLltcoursesubchapterDto } from './dto/update-lltcoursesubchapter.dto';
import { Lltcoursesubchapter } from './entities/lltcoursesubchapter.entity';

@ApiTags('lltcoursesubchapter')
@Controller('lltcoursesubchapter')
export class LltcoursesubchapterController {
  constructor(private readonly service: LltcoursesubchapterService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create course subchapter' })
  create(
    @Body() dto: CreateLltcoursesubchapterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursesubchapter> {
    return this.service.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List all course subchapters' })
  findAll(): Promise<Lltcoursesubchapter[]> {
    return this.service.findAll();
  }

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: 'Get all subchapters for a specific chapter' })
  findAllByChapterId(
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ): Promise<Lltcoursesubchapter[]> {
    return this.service.findAllByChapterId(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course subchapter detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltcoursesubchapter> {
    return this.service.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update course subchapter' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltcoursesubchapterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursesubchapter> {
    return this.service.update(id, dto, user.username);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete course subchapter' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
