import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as multer from 'multer';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';
import {
  GradeItemDto,
  InstructorConversation,
  InstructorCourseSummary,
  InstructorGrade,
  InstructorLearner,
  InstructorPriorityTask,
  InstructorProfile,
  InstructorService,
  SyncScoresResult,
} from './instructor.service';
import { ImportGradesDto, ImportGradesResult } from './dto/import-grades.dto';
import { UpdateOpenclassDto } from './dto/update-openclass.dto';
import { UpdateCourseSettingsDto } from './dto/update-course-settings.dto';
import { ApproveGradesDto, ApproveGradesResult } from './dto/approve-grades.dto';
import { ActiveCertTemplateDto } from './dto/active-cert-template.dto';
import { Lltchat } from '../chat/lltchat/entities/lltchat.entity';

const courseImageUploadDir = join(process.cwd(), 'uploads', 'courses');

interface UploadedCourseImage {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
}

function ensureCourseImageDir(): void {
  if (!existsSync(courseImageUploadDir)) mkdirSync(courseImageUploadDir, { recursive: true });
}

function buildCourseImageFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase() || '.png';
  return `${randomUUID()}${ext}`;
}

const courseCoverImageInterceptor = FileInterceptor('file', {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureCourseImageDir();
      cb(null, courseImageUploadDir);
    },
    filename: (_req, file, cb) => cb(null, buildCourseImageFilename(file)),
  }),
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

@ApiTags('instructor')
@Roles(Role.Instructor)
@Controller('instructor')
export class InstructorController {
  constructor(
    private readonly instructorService: InstructorService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get instructor profile from JWT identity' })
  getProfile(@CurrentUser() user: JwtPayload): Promise<InstructorProfile> {
    return this.instructorService.getProfile(user.email);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get instructor dashboard summary' })
  getSummary(@CurrentUser() user: JwtPayload): Promise<{
    courses: InstructorCourseSummary[];
    totalStudents: number;
    activeCourses: number;
    averageScore: number | null;
    conversations: number;
    recentActivities: Array<{
      id: string;
      learnerName: string;
      action: string;
      createdAt: Date | null;
      courseCode: string | null;
    }>;
  }> {
    return this.instructorService.getSummary(user.email);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get courses owned by instructor' })
  getCourses(@CurrentUser() user: JwtPayload): Promise<InstructorCourseSummary[]> {
    return this.instructorService.getCourses(user.email);
  }

  @Get('courses/:courseId/learners')
  @ApiOperation({ summary: 'Get enrolled learners for an instructor course' })
  getLearners(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<InstructorLearner[]> {
    return this.instructorService.getLearners(user.email, courseId);
  }

  @Get('moodle-courses/:moodleCourseId/learners')
  @ApiOperation({ summary: 'Get learners directly from a Moodle course roster' })
  getMoodleLearners(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
  ): Promise<InstructorLearner[]> {
    return this.instructorService.getMoodleLearners(moodleCourseId);
  }

  @Get('cert-templates')
  @ApiOperation({ summary: 'Get active certificate templates for selection' })
  getActiveCertTemplates(): Promise<ActiveCertTemplateDto[]> {
    return this.instructorService.getActiveCertTemplates();
  }

  @Get('grade-items')
  @ApiOperation({ summary: 'Get grade item list (A, B+, ผ่าน, ไม่ผ่าน ...)' })
  getGradeItems(): Promise<GradeItemDto[]> {
    return this.instructorService.getGradeItems();
  }

  @Get('courses/:courseId/grades')
  @ApiOperation({ summary: 'Get learner grades for a course' })
  getGrades(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<InstructorGrade[]> {
    return this.instructorService.getGrades(user.email, courseId);
  }

  @Post('courses/:courseId/import-grades')
  @ApiOperation({
    summary:
      'Import grades from CODE GRADE text → LLTIMPORTGRADE + LLTENROLL.GRADEI_ID + LLTLOGUPDATEGRADE',
  })
  importGrades(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: ImportGradesDto,
  ): Promise<ImportGradesResult> {
    return this.instructorService.importGrades(user.email, courseId, dto);
  }

  @Get('courses/:courseId/approval-status')
  @ApiOperation({ summary: 'Get grade approval status for a course' })
  getApprovalStatus(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<{
    approved: boolean;
    approvedBy: string | null;
    approvedAt: Date | null;
    detail: string | null;
  }> {
    return this.instructorService.getApprovalStatus(user.email, courseId);
  }

  @Patch('courses/:courseId/approve-grades')
  @ApiOperation({ summary: 'Approve grades for all enrolled learners who have a grade imported' })
  approveGrades(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: ApproveGradesDto,
  ): Promise<ApproveGradesResult> {
    return this.instructorService.approveGrades(user.email, courseId, dto);
  }

  @Post('courses/:courseId/sync-scores')
  @ApiOperation({ summary: 'Sync Moodle finalgrade → LLTENROLL.LMS_FINALSCORE' })
  syncScores(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<SyncScoresResult> {
    return this.instructorService.syncScores(user.email, courseId);
  }

  @Get('courses/:courseId/priority-tasks')
  @ApiOperation({ summary: 'Get urgent instructor tasks for a course' })
  getPriorityTasks(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<InstructorPriorityTask[]> {
    return this.instructorService.getPriorityTasks(user.email, courseId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get instructor learner conversations' })
  getConversations(@CurrentUser() user: JwtPayload): Promise<InstructorConversation[]> {
    return this.instructorService.getConversations(user.email);
  }

  @Post('conversations/:courseId/:learnerUserId/messages')
  @ApiOperation({ summary: 'Send a message to a learner' })
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('learnerUserId', ParseIntPipe) learnerUserId: number,
    @Body() body: { body?: string },
  ): Promise<{ sent: boolean; message?: Lltchat }> {
    return this.instructorService.sendMessage(
      user.email,
      courseId,
      learnerUserId,
      body.body?.trim() ?? '',
    );
  }

  @Patch('courses/:courseId/openclass')
  @ApiOperation({ summary: 'Update registration dates and delivery mode for a course openclass' })
  updateOpenclass(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() body: UpdateOpenclassDto,
  ): Promise<{ updated: boolean }> {
    return this.instructorService.updateOpenclass(user.email, courseId, body);
  }

  @Post('courses/:courseId/cover-image')
  @UseInterceptors(courseCoverImageInterceptor)
  @ApiOperation({ summary: 'Upload a course cover image for an instructor-owned course' })
  async uploadCourseCoverImage(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @UploadedFile() file: UploadedCourseImage,
  ): Promise<{ imageUrl: string }> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send multipart/form-data with a file field named "file".',
      );
    }
    await this.instructorService.verifyCourseAccess(user.email, courseId);
    await assertFileMagic(join(courseImageUploadDir, file.filename), ['jpeg', 'png', 'webp']);
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'course',
      file as Express.Multer.File,
    );
    return { imageUrl: uploaded.url };
  }

  @Patch('courses/:courseId/settings')
  @ApiOperation({ summary: 'Update instructor-manageable course settings' })
  updateCourseSettings(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() body: UpdateCourseSettingsDto,
  ): Promise<{ updated: boolean; moodleImageSynced: boolean }> {
    return this.instructorService.updateCourseSettings(user.email, courseId, body);
  }

  @Get('courses/:courseId/fees')
  @ApiOperation({ summary: 'Get stutype fees for a course openclass' })
  getCourseFees(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
  ): Promise<{ stutypeId: number; stutypeName: string | null; amount: number }[]> {
    return this.instructorService.getCourseFees(user.email, courseId);
  }

  @Put('courses/:courseId/fees')
  @ApiOperation({ summary: 'Save stutype fees for a course openclass' })
  saveCourseFees(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() body: { fees: { stutypeId: number; amount: number }[] },
  ): Promise<{ updated: boolean }> {
    return this.instructorService.saveCourseFees(user.email, courseId, body.fees);
  }

  @Post('conversations/:courseId/:learnerUserId/read')
  @ApiOperation({ summary: 'Mark messages from a learner as read' })
  markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('learnerUserId', ParseIntPipe) learnerUserId: number,
  ): Promise<{ success: boolean }> {
    return this.instructorService.markAsRead(user.email, courseId, learnerUserId);
  }
}
