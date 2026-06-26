import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/public.decorator';
import { Roles } from '../modules/auth/roles.decorator';
import { Role } from '../modules/auth/enums/role.enum';
import { CurrentUser } from '../modules/auth/current-user.decorator';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { LltcoursereviewService } from './lltcoursereview.service';
import { CreateLltcoursereviewDto } from './dto/create-lltcoursereview.dto';
import { QueryLltcoursereviewDto } from './dto/query-lltcoursereview.dto';
import { LltcoursereviewListDto } from './dto/lltcoursereview-list.dto';
import { LltcoursereviewResponseDto } from './dto/lltcoursereview-response.dto';
import { MyLltcoursereviewDto } from './dto/my-lltcoursereview.dto';

@ApiTags('course-reviews')
@Controller('courses/:courseId/reviews')
export class LltcoursereviewPublicController {
  constructor(private readonly lltcoursereviewService: LltcoursereviewService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List approved reviews for a course (public)' })
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query() query: QueryLltcoursereviewDto,
  ): Promise<LltcoursereviewListDto> {
    return this.lltcoursereviewService.findByCourse(courseId, query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my review eligibility and existing review (authenticated)' })
  getMyReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<MyLltcoursereviewDto> {
    if (!user.lltumSub) {
      return Promise.resolve({ canReview: false, reason: 'NOT_ENROLLED', review: null });
    }
    return this.lltcoursereviewService.getMyReview(courseId, user.lltumSub);
  }

  @Roles(Role.Student, Role.Admin)
  @Post()
  @ApiOperation({ summary: 'Create or update my review for a course (upsert)' })
  upsertReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateLltcoursereviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LltcoursereviewResponseDto> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.lltcoursereviewService.upsertMyReview(courseId, user.lltumSub, dto, user.username);
  }

  @Roles(Role.Student, Role.Admin)
  @Patch('me')
  @ApiOperation({ summary: 'Update my review for a course (upsert)' })
  updateReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateLltcoursereviewDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<LltcoursereviewResponseDto> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.lltcoursereviewService.upsertMyReview(courseId, user.lltumSub, dto, user.username);
  }

  @Roles(Role.Student, Role.Admin)
  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete my review for a course' })
  deleteReview(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    if (!user.lltumSub) throw new BadRequestException('ไม่พบข้อมูลผู้ใช้');
    return this.lltcoursereviewService.deleteMyReview(courseId, user.lltumSub);
  }
}
