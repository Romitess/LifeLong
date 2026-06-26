import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import {
  MoodleQuizService,
  type QuizInfo,
  type QuizAttempt,
  type QuizAttemptData,
  type QuizAttemptSummary,
  type QuizQuestionView,
} from './moodle-quiz.service';
import { ProcessAttemptDto } from './dto/process-attempt.dto';

@ApiTags('moodle-quiz')
@Controller('moodle/quiz')
export class MoodleQuizController {
  constructor(private readonly quizService: MoodleQuizService) {}

  @Get(':moodleCourseId/module/:moduleId')
  @ApiOperation({ summary: 'Quiz info + the current user attempts (native)' })
  getQuiz(
    @CurrentUser() user: JwtPayload,
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ): Promise<{ quiz: QuizInfo; attempts: QuizAttempt[] }> {
    return this.quizService.getQuiz(user.username, moodleCourseId, moduleId);
  }

  @Post(':quizId/start')
  @ApiOperation({ summary: 'Start (or resume) a quiz attempt as the current user' })
  startAttempt(
    @CurrentUser() user: JwtPayload,
    @Param('quizId', ParseIntPipe) quizId: number,
  ): Promise<QuizAttempt> {
    return this.quizService.startAttempt(user.username, quizId);
  }

  @Get('attempts/:attemptId')
  @ApiOperation({ summary: 'Get a page of questions for an attempt (rendered HTML)' })
  getAttemptData(
    @CurrentUser() user: JwtPayload,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Query('page') page?: string,
  ): Promise<QuizAttemptData> {
    return this.quizService.getAttemptData(user.username, attemptId, Number(page) || 0);
  }

  @Get('attempts/:attemptId/summary')
  @ApiOperation({ summary: 'All-questions summary (state/flag/page) for the navigation grid' })
  getAttemptSummary(
    @CurrentUser() user: JwtPayload,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ): Promise<QuizAttemptSummary> {
    return this.quizService.getAttemptSummary(user.username, attemptId);
  }

  @Post('attempts/:attemptId/process')
  @ApiOperation({ summary: 'Save answers or submit the attempt for grading' })
  processAttempt(
    @CurrentUser() user: JwtPayload,
    @Param('attemptId', ParseIntPipe) attemptId: number,
    @Body() dto: ProcessAttemptDto,
  ): Promise<{ state: string; autoMarked: boolean; passed: boolean }> {
    const completion =
      dto.moodleCourseId != null && dto.cmid != null
        ? {
            moodleCourseId: dto.moodleCourseId,
            cmid: dto.cmid,
            enrollId: dto.enrollId ?? undefined,
            subChapterId: dto.subChapterId,
          }
        : undefined;
    return this.quizService.processAttempt(
      user.username,
      attemptId,
      dto.finish ?? false,
      dto.data,
      dto.timeUp ?? false,
      completion,
    );
  }

  @Get('attempts/:attemptId/review')
  @ApiOperation({ summary: 'Reviewed attempt: grade + per-question feedback' })
  getAttemptReview(
    @CurrentUser() user: JwtPayload,
    @Param('attemptId', ParseIntPipe) attemptId: number,
  ): Promise<{ grade: number | null; attempt: QuizAttempt; questions: QuizQuestionView[] }> {
    return this.quizService.getAttemptReview(user.username, attemptId);
  }
}
