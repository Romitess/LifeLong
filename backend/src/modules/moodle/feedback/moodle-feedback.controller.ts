import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import {
  MoodleFeedbackService,
  type FeedbackInfo,
  type FeedbackPage,
} from './moodle-feedback.service';
import { ProcessFeedbackPageDto } from './dto/process-feedback-page.dto';

@ApiTags('moodle-feedback')
@Controller('moodle/feedback')
export class MoodleFeedbackController {
  constructor(private readonly feedbackService: MoodleFeedbackService) {}

  @Get(':moodleCourseId/module/:moduleId')
  @ApiOperation({ summary: 'Feedback info + first page items (native)' })
  getFeedback(
    @CurrentUser() user: JwtPayload,
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ): Promise<{ feedback: FeedbackInfo; page: FeedbackPage }> {
    return this.feedbackService.getFeedback(user.username, moodleCourseId, moduleId);
  }

  @Post(':feedbackId/process')
  @ApiOperation({ summary: 'Submit one page of feedback answers as the current user' })
  processPage(
    @CurrentUser() user: JwtPayload,
    @Param('feedbackId', ParseIntPipe) feedbackId: number,
    @Body() dto: ProcessFeedbackPageDto,
  ): Promise<{ completed: boolean; page: FeedbackPage | null }> {
    return this.feedbackService.processPage(user.username, feedbackId, dto.page, dto.responses);
  }
}
