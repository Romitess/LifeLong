import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/public.decorator';
import { Roles } from '../modules/auth/roles.decorator';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { Role } from '../modules/auth/enums/role.enum';
import { LltcoursechapterService } from './lltcoursechapter.service';
import { CreateLltcoursechapterDto } from './dto/create-lltcoursechapter.dto';
import { UpdateLltcoursechapterDto } from './dto/update-lltcoursechapter.dto';
import { Lltcoursechapter } from './entities/lltcoursechapter.entity';

@ApiTags('lltcoursechapter')
@Controller('lltcoursechapter')
export class LltcoursechapterController {
  constructor(private readonly lltcoursechapterService: LltcoursechapterService) {}

  @Roles(Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create course chapter' })
  create(
    @Body() dto: CreateLltcoursechapterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursechapter> {
    return this.lltcoursechapterService.create(dto, user.username);
  }

  @Get()
  @ApiOperation({ summary: 'List course chapters' })
  findAll(): Promise<Lltcoursechapter[]> {
    return this.lltcoursechapterService.findAll();
  }

  @Public()
  @Get('course/:courseId')
  @ApiOperation({ summary: 'List chapters of a course' })
  findByCourseId(
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<import('./lltcoursechapter.service').CourseChapterWithSubchapters[]> {
    return this.lltcoursechapterService.findAllByCourseId(courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course chapter detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lltcoursechapter> {
    return this.lltcoursechapterService.findOne(id);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({ summary: 'Update course chapter' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLltcoursechapterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Lltcoursechapter> {
    return this.lltcoursechapterService.update(id, dto, user.username);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete course chapter' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: true }> {
    return this.lltcoursechapterService.remove(id);
  }
}
