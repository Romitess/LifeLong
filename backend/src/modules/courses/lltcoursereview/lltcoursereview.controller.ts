import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { LltcoursereviewService, ModerationReviewDto } from './lltcoursereview.service';
import { QueryModerationDto } from './dto/query-moderation.dto';
import { SetStatusDto } from './dto/set-status.dto';

@ApiTags('admin-reviews')
@Roles(Role.Admin)
@Controller('admin/reviews')
export class LltcoursereviewController {
  constructor(private readonly lltcoursereviewService: LltcoursereviewService) {}

  @Get()
  @ApiOperation({ summary: 'List all reviews for moderation (all statuses)' })
  findForModeration(
    @Query() query: QueryModerationDto,
  ): Promise<{ items: ModerationReviewDto[]; total: number; page: number; limit: number }> {
    return this.lltcoursereviewService.findForModeration(query);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Set review status (A/P/H)' })
  setStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: SetStatusDto): Promise<void> {
    return this.lltcoursereviewService.setStatus(id, dto.status);
  }
}
