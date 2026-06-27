import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  ParseIntPipe,
  UploadedFiles,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as multer from 'multer';
import { DeleteResult } from 'typeorm';
import {
  LltcourseService,
  type CourseFileData,
  type CoursePublicSummary,
  type CourseTargetDetail,
  type CourseTypeClassDetail,
} from './lltcourse.service';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';
import { CreateLltcourseDto } from './dto/create-lltcourse.dto';
import { UpdateLltcourseDto } from './dto/update-lltcourse.dto';
import { EnrollCourseDto } from '../enrollment/lltenroll/dto/enroll-course.dto';
import { Lltcourse } from './entities/lltcourse.entity';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { Llttypestudy } from '../users/llttypestudy/entities/llttypestudy.entity';
import {
  MoodleAnnouncement,
  MoodleModule,
  MoodleModuleContent,
  MoodleSection,
} from '../moodle/interfaces/moodle.interfaces';

const courseUploadDir = join(process.cwd(), 'uploads', 'courses');
const cbsUploadDir = join(process.cwd(), 'uploads', 'course-cbs');

interface UploadedCourseFile {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  fieldname: string;
}

interface CourseImageInputFile {
  originalname: string;
}

function ensureCourseUploadDir(): void {
  if (!existsSync(courseUploadDir)) {
    mkdirSync(courseUploadDir, { recursive: true });
  }
}

function ensureCbsUploadDir(): void {
  if (!existsSync(cbsUploadDir)) {
    mkdirSync(cbsUploadDir, { recursive: true });
  }
}

function createCourseImageFilename(file: CourseImageInputFile): string {
  return `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
}

interface CourseWithMoodle extends Lltcourse {
  moodleId: number | null;
}

interface CourseWithMoodleAndEvaluation extends CourseWithMoodle {
  evaluationText?: string | null;
  typestudyDetail?: Llttypestudy | null;
  targets?: CourseTargetDetail[];
  typeClasses?: CourseTypeClassDetail[];
  instructorInfo?: {
    nameTh: string | null;
    nameEn: string | null;
    email: string | null;
  } | null;
}

function createCbsFilename(file: CourseImageInputFile): string {
  const safeName = file.originalname
    .replace(extname(file.originalname), '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${Date.now()}-${safeName || 'cbs'}${extname(file.originalname).toLowerCase()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface CreateCourseResponse {
  message: string;
  id: number;
  shortname: string;
  data: CourseWithMoodle;
}

interface CreateModuleResponse {
  success: boolean;
  data: unknown;
}

interface CreateModuleBody {
  courseid: number;
  type: 'quiz' | 'assign';
  name: string;
  sectionindex?: number;
}

@ApiTags('moodle')
@Controller('moodle')
export class LltcourseController {
  constructor(
    private readonly lltcourseService: LltcourseService,
    private readonly configService: ConfigService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Roles(Role.Admin)
  @Post('courses')
  @ApiOperation({ summary: 'Create course' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'cbsFile', maxCount: 1 },
      ],
      {
        storage: multer.diskStorage({
          destination: (_req, file, callback) => {
            if (file.fieldname === 'cbsFile') {
              ensureCbsUploadDir();
              callback(null, cbsUploadDir);
              return;
            }
            ensureCourseUploadDir();
            callback(null, courseUploadDir);
          },
          filename: (_req, file, callback) => {
            callback(
              null,
              file.fieldname === 'cbsFile'
                ? createCbsFilename(file)
                : createCourseImageFilename(file),
            );
          },
        }),
        fileFilter: (
          _req: unknown,
          file: UploadedCourseFile,
          callback: (error: Error | null, acceptFile: boolean) => void,
        ) => {
          if (file.fieldname === 'cbsFile') {
            callback(null, file.mimetype === 'application/pdf');
            return;
          }
          callback(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
        },
        limits: { fileSize: 2 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @Body() dto: CreateLltcourseDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles()
    files?: {
      file?: UploadedCourseFile[];
      cbsFile?: UploadedCourseFile[];
    },
  ): Promise<CreateCourseResponse> {
    const imageFile = files?.file?.[0];
    const cbsFile = files?.cbsFile?.[0];
    if (imageFile)
      await assertFileMagic(join(courseUploadDir, imageFile.filename), ['jpeg', 'png', 'webp']);
    if (cbsFile) await assertFileMagic(join(cbsUploadDir, cbsFile.filename), ['pdf']);
    if (imageFile) dto.imageUrl = await this.uploadCourseImage(imageFile);
    const result = await this.lltcourseService.create(
      dto,
      user.username,
      this.buildCbsFileData(cbsFile),
    );
    return {
      message: 'Course created and synced successfully',
      id: result.id,
      shortname: result.code,
      data: result,
    };
  }

  private async uploadCourseImage(file: UploadedCourseFile): Promise<string> {
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'course',
      file as Express.Multer.File,
    );
    return uploaded.url;
  }

  private buildCbsFileData(file?: UploadedCourseFile): CourseFileData | undefined {
    if (!file) return undefined;
    const publicBaseUrl = this.configService
      .getOrThrow<string>('BACKEND_PUBLIC_URL')
      .replace(/\/+$/, '');
    const relativePath = `uploads/course-cbs/${file.filename}`;
    return {
      filename: file.originalname,
      filenameGen: file.filename,
      size: formatFileSize(file.size),
      type: file.mimetype,
      path: relativePath,
      url: `${publicBaseUrl}/${relativePath}`,
    };
  }

  @Roles(Role.Admin)
  @Post('modules')
  @ApiOperation({ summary: 'Create Moodle module' })
  async createModule(@Body() body: CreateModuleBody): Promise<CreateModuleResponse> {
    const result = await this.lltcourseService.createMoodleModule(
      body.courseid,
      body.type,
      body.name,
      body.sectionindex || 1,
    );
    return { success: true, data: result };
  }

  @Public()
  @Get('courses')
  @ApiOperation({ summary: 'List published courses (learner-facing)' })
  findAll(): Promise<CoursePublicSummary[]> {
    return this.lltcourseService.findAll();
  }

  @Public()
  @Get('courses/top-enrolled')
  @ApiOperation({ summary: 'List top 10 courses by enrollment count' })
  findTopEnrolled(): Promise<CoursePublicSummary[]> {
    return this.lltcourseService.findTopEnrolled(10);
  }

  @Roles(Role.Admin, Role.Instructor)
  @Get('courses/by-instructor')
  @ApiOperation({ summary: 'List courses assigned to an instructor by email' })
  findByInstructor(@Query('email') email: string): Promise<
    Array<{
      id: number;
      code: string;
      titleTh: string;
      titleEn: string | null;
      moodleId: number | null;
      instructorEmail: string;
      startDate: Date | null;
      endDate: Date | null;
      imageUrl: string | null;
      status: string | null;
      categoryId: number | null;
    }>
  > {
    return this.lltcourseService.findByInstructorEmail(email);
  }

  @Roles(Role.Admin)
  @Post('courses/sync-moodle-images')
  @ApiOperation({ summary: 'Sync course images to Moodle' })
  syncMoodleCourseImages(): Promise<{ checked: number; synced: number }> {
    return this.lltcourseService.syncAllMoodleCourseImages();
  }

  @Public()
  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CourseWithMoodleAndEvaluation | null> {
    return this.lltcourseService.findOne(id);
  }

  @Public()
  @Post('courses/:id/click')
  @ApiOperation({ summary: 'บันทึก page view และคืน click count' })
  recordClick(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId?: string },
  ): Promise<{ clickCount: number }> {
    return this.lltcourseService.recordClick(id, body.userId);
  }

  @Roles(Role.Admin)
  @Patch('courses/:id')
  @ApiOperation({ summary: 'Update course' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLltcourseDto: UpdateLltcourseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<CourseWithMoodle | null> {
    return this.lltcourseService.update(id, updateLltcourseDto, user.username);
  }

  @Roles(Role.Admin)
  @Delete('courses/:id')
  @ApiOperation({ summary: 'Delete course' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<DeleteResult> {
    return this.lltcourseService.remove(id);
  }

  @Get('moodle-contents/:moodleCourseId')
  @ApiOperation({ summary: 'Get Moodle contents by course ID' })
  getMoodleContentsByMoodleId(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
  ): Promise<MoodleSection[]> {
    return this.lltcourseService.getMoodleContentsByMoodleId(moodleCourseId);
  }

  @Get('moodle-module/:moodleCourseId/:moduleId')
  @ApiOperation({
    summary: 'Get a single Moodle module content (description + files) for native rendering',
  })
  getMoodleModuleContent(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ): Promise<MoodleModuleContent> {
    return this.lltcourseService.getMoodleModuleContent(moodleCourseId, moduleId);
  }

  // Public, but only signed (HMAC + expiry) URLs minted by getMoodleModuleContent validate.
  // Must stay public so native <img> requests (no JWT header) can load embedded files.
  @Public()
  @Get('moodle-file')
  @ApiOperation({ summary: 'Proxy a signed Moodle pluginfile (token kept server-side)' })
  async getMoodleFile(
    @Query('fileurl') fileurl: string,
    @Query('exp') exp: string,
    @Query('sig') sig: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.lltcourseService.getMoodleFileStream(fileurl, exp, sig);
    if (file.contentType) res.setHeader('Content-Type', file.contentType);
    if (file.contentDisposition) res.setHeader('Content-Disposition', file.contentDisposition);
    if (file.contentLength) res.setHeader('Content-Length', file.contentLength);
    return new StreamableFile(file.stream);
  }

  @Get('moodle-announcements/:moodleCourseId')
  @ApiOperation({ summary: 'Get Moodle course announcements (news forum discussions)' })
  getCourseAnnouncements(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
  ): Promise<MoodleAnnouncement[]> {
    return this.lltcourseService.getCourseAnnouncements(moodleCourseId);
  }

  @Roles(Role.Admin, Role.Instructor, Role.Student)
  @Get('course-sso-url/:moodleCourseId')
  @ApiOperation({ summary: 'Get Moodle SSO URL' })
  getMoodleSsoUrl(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Query('username') username: string,
    @Query('courseCode') courseCode?: string,
    @Query('wantsurl') wantsurl?: string,
  ): Promise<{ url: string }> {
    return this.lltcourseService.getMoodleSsoUrl(moodleCourseId, username, courseCode, wantsurl);
  }

  @Roles(Role.Admin, Role.Instructor)
  @Get('instructor-course-url/:moodleCourseId')
  @ApiOperation({ summary: 'Get Moodle SSO URL for instructor (no student enrol)' })
  getInstructorCourseUrl(
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Query('username') username: string,
  ): Promise<{ url: string }> {
    return this.lltcourseService.getInstructorCourseUrl(moodleCourseId, username);
  }

  @Roles(Role.Admin, Role.Instructor)
  @Get('activities')
  @ApiOperation({ summary: 'Get Moodle activities by shortname' })
  getMoodleActivities(@Query('shortname') shortname: string): Promise<MoodleModule[]> {
    return this.lltcourseService.getMoodleActivitiesByShortname(shortname);
  }

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll user in course' })
  enrollCourse(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EnrollCourseDto,
  ): Promise<{ enrolled: boolean; message: string; moodleEnrolled: boolean }> {
    return this.lltcourseService.enrollCourse({ ...dto, username: user.username });
  }

  @Get('enroll/check')
  @ApiOperation({ summary: 'Check if user is enrolled in a course (from DB)' })
  checkEnrollment(
    @CurrentUser() user: JwtPayload,
    @Query('courseCode') courseCode: string,
  ): Promise<{ enrolled: boolean; enrollId: number | null; moodleId: number | null }> {
    return this.lltcourseService.checkEnrollmentStatus(courseCode, user.username);
  }

  @Get('profile/benefits')
  @ApiOperation({ summary: 'Get user privilege/benefits from LLTPRIVILEGE + LLTTYPESTUDENT' })
  getUserBenefits(@CurrentUser() user: JwtPayload): Promise<{
    hasPrivilege: boolean;
    stutypeId: number | null;
    stutypeName: string | null;
    userCitizen: string | null;
    checkedAt: Date;
  }> {
    return this.lltcourseService.getUserBenefits(user.email);
  }

  @Get('enroll/my-fee')
  @ApiOperation({
    summary: 'Get effective enrollment fee for current user based on student type privilege',
  })
  getPrivilegePrice(
    @CurrentUser() user: JwtPayload,
    @Query('courseCode') courseCode: string,
  ): Promise<{ effectivePrice: number; stutypeName: string | null; isPrivileged: boolean }> {
    return this.lltcourseService.getPrivilegePrice(user.username, courseCode);
  }

  @Get('enroll/my-courses')
  @ApiOperation({ summary: 'Get all courses the authenticated user is enrolled in' })
  getMyEnrolledCourses(@CurrentUser() user: JwtPayload): Promise<
    {
      enrollId: number;
      courseId: string;
      courseCode: string;
      courseTitle: string;
      courseTitleEn: string | null;
      imageUrl: string | null;
      moodleCourseId: number | null;
      enrolledAt: string | null;
      paymentStatus: 'free' | 'paid' | 'pending';
    }[]
  > {
    return this.lltcourseService.getMyEnrolledCourses(user.username);
  }

  @Delete('enroll/:enrollId')
  @ApiOperation({ summary: 'Unenroll user from course by enrollment ID' })
  unenrollCourse(
    @CurrentUser() user: JwtPayload,
    @Param('enrollId', ParseIntPipe) enrollId: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.lltcourseService.unenrollCourse(enrollId, user.username);
  }
}
