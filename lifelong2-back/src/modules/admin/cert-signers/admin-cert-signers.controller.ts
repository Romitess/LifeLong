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
import { AdminCertSignersService, CertSignerFileData } from './admin-cert-signers.service';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { PlatformGatewayService } from '../../platform-gateway/platform-gateway.service';
import { AdminCertSignersQueryDto } from './dto/admin-cert-signers-query.dto';
import { CreateAdminCertSignerDto } from './dto/create-admin-cert-signer.dto';
import { UpdateAdminCertSignerDto } from './dto/update-admin-cert-signer.dto';
import {
  AdminCertSignerItemDto,
  AdminCertSignersResponseDto,
} from './dto/admin-cert-signers-response.dto';

const signerUploadDir = join(process.cwd(), 'uploads', 'cert-signers');

interface UploadedSignerFile {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
}

function ensureUploadDir(): void {
  if (!existsSync(signerUploadDir)) {
    mkdirSync(signerUploadDir, { recursive: true });
  }
}

function buildSignerFilename(file: { originalname: string }): string {
  const ext = extname(file.originalname).toLowerCase();
  return `${randomUUID()}${ext}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const signerFileInterceptor = FileInterceptor('file', {
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      ensureUploadDir();
      cb(null, signerUploadDir);
    },
    filename: (_req, file, cb) => {
      cb(null, buildSignerFilename(file));
    },
  }),
  fileFilter: (
    _req: unknown,
    file: UploadedSignerFile,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    cb(null, /^image\/(jpeg|png)$/.test(file.mimetype));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

@Roles(Role.Admin)
@Controller('admin/cert-signers')
export class AdminCertSignersController {
  constructor(
    private readonly certSignersService: AdminCertSignersService,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  @Get()
  findAll(@Query() query: AdminCertSignersQueryDto): Promise<AdminCertSignersResponseDto> {
    return this.certSignersService.findAll(query);
  }

  @Post()
  @UseInterceptors(signerFileInterceptor)
  async create(
    @Body() dto: CreateAdminCertSignerDto,
    @UploadedFile() file?: UploadedSignerFile,
  ): Promise<AdminCertSignerItemDto> {
    if (file) await assertFileMagic(join(signerUploadDir, file.filename), ['jpeg', 'png']);
    return this.certSignersService.create(
      dto.name,
      dto.position,
      dto.status,
      await this.buildFileData(file),
    );
  }

  @Patch(':id')
  @UseInterceptors(signerFileInterceptor)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminCertSignerDto,
    @UploadedFile() file?: UploadedSignerFile,
  ): Promise<AdminCertSignerItemDto> {
    if (file) await assertFileMagic(join(signerUploadDir, file.filename), ['jpeg', 'png']);
    return this.certSignersService.update(
      +id,
      {
        name: dto.name,
        position: dto.position,
        status: dto.status,
        deleteFile: dto.deleteFile === 'true',
      },
      await this.buildFileData(file),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.certSignersService.remove(+id);
  }

  private async buildFileData(file?: UploadedSignerFile): Promise<CertSignerFileData | undefined> {
    if (!file) return undefined;
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'cert-signer',
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
