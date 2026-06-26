import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as multer from 'multer';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../../platform-gateway/platform-gateway.service';
import { AdminSlideshowService } from './admin-slideshow.service';
import { HeroConfigDto } from './dto/hero-config.dto';
import {
  HeroConfigResponseDto,
  SlideshowImageUploadResponseDto,
} from './dto/hero-config-response.dto';

const systemUploadDir = join(process.cwd(), 'uploads', 'system');

interface UploadedSystemFile {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

function ensureUploadDir(): void {
  if (!existsSync(systemUploadDir)) {
    mkdirSync(systemUploadDir, { recursive: true });
  }
}

function buildSlideFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase();
  return `${randomUUID()}${ext}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const systemImageInterceptor = FileInterceptor('file', {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, systemUploadDir);
    },
    filename: (_req, file, cb) => {
      cb(null, buildSlideFilename(file));
    },
  }),
  fileFilter: (
    _req: unknown,
    file: UploadedSystemFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

@Roles(Role.Admin)
@Controller('admin/slideshow')
export class AdminSlideshowController {
  constructor(
    private readonly slideshowService: AdminSlideshowService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Get()
  getConfig(): Promise<HeroConfigResponseDto> {
    return this.slideshowService.getConfig();
  }

  @Put()
  saveConfig(@Body() dto: HeroConfigDto): Promise<HeroConfigResponseDto> {
    return this.slideshowService.saveConfig(dto);
  }

  @Post('image')
  @UseInterceptors(systemImageInterceptor)
  async uploadImage(
    @UploadedFile() file?: UploadedSystemFile,
  ): Promise<SlideshowImageUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('ไม่พบไฟล์รูปภาพที่อัปโหลด');
    }
    await assertFileMagic(join(systemUploadDir, file.filename), ['jpeg', 'png', 'webp']);
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'system',
      file as Express.Multer.File,
    );

    return {
      filename: uploaded.fileName,
      imgSize: formatFileSize(file.size),
      imgType: file.mimetype,
      path: uploaded.path,
      url: await this.platformGatewayService.getPublicFileUrl(uploaded.path),
    };
  }
}
