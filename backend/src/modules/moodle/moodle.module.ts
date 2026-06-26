import { Module } from '@nestjs/common';
import { MoodleService } from './moodle.service';
import { MoodleUserTokenService } from './moodle-user-token.service';
import { MoodleFileProxyService } from './moodle-file-proxy.service';
import { MoodleQuizService } from './quiz/moodle-quiz.service';
import { MoodleQuizController } from './quiz/moodle-quiz.controller';
import { MoodleAssignService } from './assign/moodle-assign.service';
import { MoodleAssignController } from './assign/moodle-assign.controller';
import { MoodleFeedbackService } from './feedback/moodle-feedback.service';
import { MoodleFeedbackController } from './feedback/moodle-feedback.controller';
import { MoodleForumService } from './forum/moodle-forum.service';
import { MoodleForumController } from './forum/moodle-forum.controller';

@Module({
  controllers: [
    MoodleQuizController,
    MoodleAssignController,
    MoodleFeedbackController,
    MoodleForumController,
  ],
  providers: [
    MoodleService,
    MoodleUserTokenService,
    MoodleFileProxyService,
    MoodleQuizService,
    MoodleAssignService,
    MoodleFeedbackService,
    MoodleForumService,
  ],
  exports: [MoodleService, MoodleUserTokenService, MoodleFileProxyService],
})
export class MoodleModule {}
