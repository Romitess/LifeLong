import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import * as multer from 'multer';
import { AdminCoursesService, CourseFileData } from './admin-courses.service';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../../platform-gateway/platform-gateway.service';
import { AdminCoursesQueryDto } from './dto/admin-courses-query.dto';
import { AdminCourseDetailDto, AdminCoursesResponseDto } from './dto/admin-courses-response.dto';
import { AdminCourseFormOptionsDto } from './dto/admin-course-form-options.dto';
import { CreateAdminCourseDto } from './dto/create-admin-course.dto';
import { randomUUID } from 'crypto';

const cbsUploadDir = join(process.cwd(), 'uploads', 'course-cbs');
const courseImageUploadDir = join(process.cwd(), 'uploads', 'courses');

interface UploadedCbsFile {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
  fieldname: string;
}

function ensureCbsDir(): void {
  if (!existsSync(cbsUploadDir)) mkdirSync(cbsUploadDir, { recursive: true });
}

function ensureCourseImageDir(): void {
  if (!existsSync(courseImageUploadDir)) mkdirSync(courseImageUploadDir, { recursive: true });
}

function buildCbsFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase();
  const base = file.originalname
    .replace(ext, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
  return `${Date.now()}-${base || 'cbs'}${ext}`;
}

function buildImageFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase() || '.png';
  return `${randomUUID()}${ext}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const courseFilesInterceptor = FileFieldsInterceptor(
  [
    { name: 'files', maxCount: 5 },
    { name: 'image', maxCount: 1 },
  ],
  {
    storage: multer.diskStorage({
      destination: (_req, file, cb) => {
        if (file.fieldname === 'image') {
          ensureCourseImageDir();
          cb(null, courseImageUploadDir);
          return;
        }
        ensureCbsDir();
        cb(null, cbsUploadDir);
      },
      filename: (_req, file, cb) =>
        cb(null, file.fieldname === 'image' ? buildImageFilename(file) : buildCbsFilename(file)),
    }),
    fileFilter: (
      _req: unknown,
      file: UploadedCbsFile,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (file.fieldname === 'image') {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
        return;
      }
      if (file.fieldname === 'files') {
        cb(null, file.mimetype === 'application/pdf');
        return;
      }
      cb(null, false);
    },
    limits: { fileSize: 2 * 1024 * 1024 },
  },
);

@Roles(Role.Admin)
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(
    private readonly adminCoursesService: AdminCoursesService,
    private readonly configService: ConfigService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Get()
  findAll(@Query() query: AdminCoursesQueryDto): Promise<AdminCoursesResponseDto> {
    return this.adminCoursesService.findAll(query);
  }

  @Get('form-options')
  getFormOptions(): Promise<AdminCourseFormOptionsDto> {
    return this.adminCoursesService.getFormOptions();
  }

  @Get('instructors/search')
  searchInstructors(
    @Query('q') q: string,
  ): Promise<{ username: string; email: string; fullName: string }[]> {
    return this.adminCoursesService.searchInstructors(q ?? '');
  }

  @Post()
  @UseInterceptors(courseFilesInterceptor)
  async create(
    @Body() dto: CreateAdminCourseDto,
    @UploadedFiles()
    uploaded?: {
      files?: UploadedCbsFile[];
      image?: UploadedCbsFile[];
    },
  ): Promise<{ courseId: number }> {
    if (uploaded?.image?.[0])
      await assertFileMagic(join(courseImageUploadDir, uploaded.image[0].filename), [
        'jpeg',
        'png',
        'webp',
      ]);
    for (const f of uploaded?.files ?? [])
      await assertFileMagic(join(cbsUploadDir, f.filename), ['pdf']);
    if (uploaded?.image?.[0]) dto.imageUrl = await this.uploadCourseImage(uploaded.image[0]);
    const fileDataList = (uploaded?.files ?? []).map((f) => this.buildFileData(f));
    return this.adminCoursesService.create(dto, fileDataList);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdminCourseDetailDto | null> {
    return this.adminCoursesService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(courseFilesInterceptor)
  async update(
    @Param('id') id: string,
    @Body() dto: CreateAdminCourseDto,
    @UploadedFiles()
    uploaded?: {
      files?: UploadedCbsFile[];
      image?: UploadedCbsFile[];
    },
  ): Promise<{ courseId: number }> {
    if (uploaded?.image?.[0])
      await assertFileMagic(join(courseImageUploadDir, uploaded.image[0].filename), [
        'jpeg',
        'png',
        'webp',
      ]);
    for (const f of uploaded?.files ?? [])
      await assertFileMagic(join(cbsUploadDir, f.filename), ['pdf']);
    if (uploaded?.image?.[0]) dto.imageUrl = await this.uploadCourseImage(uploaded.image[0]);
    const fileDataList = (uploaded?.files ?? []).map((f) => this.buildFileData(f));
    return this.adminCoursesService.update(+id, dto, fileDataList);
  }

  @Post(':id/copy')
  copyCourse(@Param('id') id: string): Promise<{ courseId: number }> {
    return this.adminCoursesService.copy(+id);
  }

  @Post(':id/retry-moodle')
  @HttpCode(HttpStatus.OK)
  retryMoodleSync(@Param('id') id: string): Promise<{ ok: boolean }> {
    return this.adminCoursesService.retryMoodleSync(+id);
  }

  @Post('backfill')
  backfill(): Promise<{
    openclassinsInserted: number;
    sectionsBackfilled: number[];
    errors: string[];
  }> {
    return this.adminCoursesService.backfill();
  }

  @Post('migrate-subsections')
  @HttpCode(HttpStatus.OK)
  migrateSubsections(
    @Query('coseId') coseId?: string,
  ): Promise<{ migrated: number[]; errors: string[] }> {
    return this.adminCoursesService.migrateSubsections(coseId ? +coseId : undefined);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.adminCoursesService.remove(+id);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string): Promise<{ courseId: number; warnings: string[] }> {
    return this.adminCoursesService.publish(+id);
  }

  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string): Promise<{ courseId: number }> {
    return this.adminCoursesService.unpublish(+id);
  }

  private buildFileData(file: UploadedCbsFile): CourseFileData {
    const publicBase = this.configService
      .getOrThrow<string>('BACKEND_PUBLIC_URL')
      .replace(/\/+$/, '');
    const relativePath = `uploads/course-cbs/${file.filename}`;
    return {
      filename: file.originalname,
      filenameGen: file.filename,
      size: formatFileSize(file.size),
      path: relativePath,
      url: `${publicBase}/${relativePath}`,
    };
  }

  private async uploadCourseImage(file: UploadedCbsFile): Promise<string> {
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'course',
      file as Express.Multer.File,
    );
    return uploaded.url;
  }
}
