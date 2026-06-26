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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../../auth/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import * as multer from 'multer';
import { AdminCertTemplatesService, CertTemplateFileData } from './admin-cert-templates.service';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../../platform-gateway/platform-gateway.service';
import { AdminCertTemplatesQueryDto } from './dto/admin-cert-templates-query.dto';
import { CreateAdminCertTemplateDto } from './dto/create-admin-cert-template.dto';
import { UpdateAdminCertTemplateDto } from './dto/update-admin-cert-template.dto';
import {
  AdminCertTemplateItemDto,
  AdminCertTemplatesResponseDto,
} from './dto/admin-cert-templates-response.dto';

const certUploadDir = join(process.cwd(), 'uploads', 'cert-templates');

interface UploadedCertFile {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

function ensureUploadDir(): void {
  if (!existsSync(certUploadDir)) {
    mkdirSync(certUploadDir, { recursive: true });
  }
}

function buildCertFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase();
  return `${randomUUID()}${ext}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const certFileInterceptor = FileInterceptor('file', {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, certUploadDir);
    },
    filename: (_req, file, cb) => {
      cb(null, buildCertFilename(file));
    },
  }),
  fileFilter: (
    _req: unknown,
    file: UploadedCertFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    cb(null, /^image\/(jpeg|png)$/.test(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

@Roles(Role.Admin)
@Controller('admin/cert-templates')
export class AdminCertTemplatesController {
  constructor(
    private readonly certTemplatesService: AdminCertTemplatesService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Get()
  findAll(@Query() query: AdminCertTemplatesQueryDto): Promise<AdminCertTemplatesResponseDto> {
    return this.certTemplatesService.findAll(query);
  }

  @Post()
  @UseInterceptors(certFileInterceptor)
  async create(
    @Body() dto: CreateAdminCertTemplateDto,
    @UploadedFile() file?: UploadedCertFile,
  ): Promise<AdminCertTemplateItemDto> {
    if (file) await assertFileMagic(join(certUploadDir, file.filename), ['jpeg', 'png']);
    return this.certTemplatesService.create(
      dto.name,
      dto.status,
      await this.buildFileData(file),
      dto.layout,
    );
  }

  @Patch(':id')
  @UseInterceptors(certFileInterceptor)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCertTemplateDto,
    @UploadedFile() file?: UploadedCertFile,
  ): Promise<AdminCertTemplateItemDto> {
    if (file) await assertFileMagic(join(certUploadDir, file.filename), ['jpeg', 'png']);
    return this.certTemplatesService.update(
      +id,
      {
        name: dto.name,
        status: dto.status,
        deleteFile: dto.deleteFile === 'true',
        layout: dto.layout,
      },
      await this.buildFileData(file),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.certTemplatesService.remove(+id);
  }

  private async buildFileData(file?: UploadedCertFile): Promise<CertTemplateFileData | undefined> {
    if (!file) return undefined;
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'cert-template',
      file as Express.Multer.File,
    );
    return {
      filename: uploaded.fileName,
      imgSize: formatFileSize(file.size),
      imgType: file.mimetype,
      path: uploaded.path,
      url: uploaded.url,
    };
  }
}
