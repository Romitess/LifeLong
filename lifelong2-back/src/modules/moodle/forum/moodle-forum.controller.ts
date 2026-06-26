import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import {
  MoodleForumService,
  type ForumDiscussionSummary,
  type ForumDiscussionThread,
  type ForumInfo,
} from './moodle-forum.service';
import { ReplyPostDto } from './dto/reply-post.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';

@ApiTags('moodle-forum')
@Controller('moodle/forum')
export class MoodleForumController {
  constructor(private readonly forumService: MoodleForumService) {}

  @Get('discussion/:discussionId')
  @ApiOperation({ summary: 'All posts (thread) of a forum discussion (native)' })
  getDiscussion(
    @CurrentUser() user: JwtPayload,
    @Param('discussionId', ParseIntPipe) discussionId: number,
  ): Promise<ForumDiscussionThread> {
    return this.forumService.getDiscussion(user.username, discussionId);
  }

  @Get(':moodleCourseId/module/:moduleId')
  @ApiOperation({ summary: 'Forum info + discussion list (native)' })
  getForum(
    @CurrentUser() user: JwtPayload,
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ): Promise<{ forum: ForumInfo; discussions: ForumDiscussionSummary[] }> {
    return this.forumService.getForum(user.username, moodleCourseId, moduleId);
  }

  @Post('discussion/:discussionId/reply')
  @ApiOperation({ summary: 'Reply to a post in a discussion as the current user' })
  reply(@CurrentUser() user: JwtPayload, @Body() dto: ReplyPostDto): Promise<{ postId: number }> {
    return this.forumService.replyToPost(user.username, dto.parentPostId, dto.message);
  }

  @Post(':moodleCourseId/module/:moduleId/discussion')
  @ApiOperation({ summary: 'Start a new discussion in a forum as the current user' })
  createDiscussion(
    @CurrentUser() user: JwtPayload,
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
    @Body() dto: CreateDiscussionDto,
  ): Promise<{ discussionId: number }> {
    return this.forumService.createDiscussion(
      user.username,
      moodleCourseId,
      moduleId,
      dto.subject,
      dto.message,
    );
  }
}
