import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink, readFile } from 'node:fs/promises';
import type { Request, Response } from 'express';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { PlatformGatewayService } from './platform-gateway.service';
import { GatewayFileResult, UploadFileDto } from './platform-gateway.types';

type JsonRecord = Record<string, unknown>;
const uploadDirectory = './uploaded_file';

mkdirSync(uploadDirectory, { recursive: true });

const uploadDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

const normalizeFileList = (value: unknown): { fileName: string; downloadName?: string }[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is JsonRecord => typeof item === 'object' && item !== null)
    .map((item) => ({
      fileName: isString(item.fileName) ? item.fileName : '',
      downloadName: isString(item.downloadName) ? item.downloadName : undefined,
    }))
    .filter((item) => item.fileName !== '');
};

// These categories use the shared generic image-upload endpoint.
const genericImageCategories = new Set(['profile', 'course', 'page-builder']);

@Controller()
export class PlatformGatewayController {
  constructor(private readonly platformGatewayService: PlatformGatewayService) {}

  @Public()
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file', { storage: uploadDiskStorage }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ): Promise<unknown> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send multipart/form-data with a file field named "file".',
      );
    }
    return this.platformGatewayService.uploadFile(file, {
      ...uploadFileDto,
      fileName: uploadFileDto.fileName || file.originalname,
    });
  }

  @Post('images/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: uploadDiskStorage,
      fileFilter: (_req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImageByCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: JsonRecord,
    @Req() req: Request,
  ): Promise<unknown> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send multipart/form-data with a file field named "file".',
      );
    }
    const category = isString(body.category) ? body.category : '';
    if (!genericImageCategories.has(category)) {
      await unlink(file.path).catch(() => undefined);
      throw new BadRequestException(`Image category "${category}" must use its admin upload flow`);
    }
    try {
      await assertFileMagic(file.path, ['jpeg', 'png', 'webp']);
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
      throw error;
    }
    const user = this.getAuthenticatedUser(req);
    return this.platformGatewayService.uploadByCategory(
      category,
      file,
      user?.lltumSub ?? user?.sub ?? null,
    );
  }

  @Roles(Role.Admin)
  @Get('uploads/cert-signers/:fileName')
  serveCertSignerFile(@Param('fileName') fileName: string, @Res() res: Response): Promise<void> {
    return this.proxyPublicFile(`uploads/cert-signers/${fileName}`, res);
  }

  @Get('uploads/cert-templates/:fileName')
  serveCertTemplateFile(@Param('fileName') fileName: string, @Res() res: Response): Promise<void> {
    return this.proxyPublicFile(`uploads/cert-templates/${fileName}`, res);
  }

  @Public()
  @Get('uploads/:folder/:fileName')
  serveUploadedFile(
    @Param('folder') folder: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxyPublicFile(`uploads/${folder}/${fileName}`, res);
  }

  @Public()
  @Get('uploads/:folder/:subfolder/:fileName')
  serveNestedUploadedFile(
    @Param('folder') folder: string,
    @Param('subfolder') subfolder: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.proxyPublicFile(`uploads/${folder}/${subfolder}/${fileName}`, res);
  }
  @Public()
  @Post('getFileList')
  getFileList(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.getFileList(isString(body.path) ? body.path : '/uploads');
  }

  @Public()
  @Post('getPublicFile')
  getPublicFile(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.getPublicFile(isString(body.fileName) ? body.fileName : '');
  }

  @Public()
  @Post('getPublicFiles')
  getPublicFiles(@Body() body: JsonRecord): Promise<unknown> {
    const files = normalizeFileList(body.files);
    return this.platformGatewayService.getPublicFiles(
      files.length > 0 ? files : isString(body.fileName) ? [{ fileName: body.fileName }] : [],
    );
  }

  @Post('sendNoti')
  sendNoti(@Body() body: JsonRecord): void {
    return this.platformGatewayService.sendNoti(isString(body.message) ? body.message : '');
  }

  @Public()
  @Post('sendEmail')
  sendEmail(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.sendEmail(
      isString(body.system) ? body.system : '',
      isString(body.to) ? body.to : '',
      isString(body.subject) ? body.subject : '',
      isString(body.message) ? body.message : '',
    );
  }

  @Public()
  @Delete('deleteFile')
  deleteFile(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.deleteFile(isString(body.fileName) ? body.fileName : '');
  }

  @Public()
  @Post('timeStamp')
  timeStamp(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.timeStamp(body);
  }

  @Public()
  @Get('dsPrefix')
  dsPrefix(): Promise<unknown> {
    return this.platformGatewayService.dsPrefix();
  }

  @Post('createShortUrl')
  createShortUrl(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.createShortUrl(body);
  }

  @Post('getOriginalUrl')
  getOriginalUrl(@Body() body: JsonRecord): Promise<unknown> {
    return this.platformGatewayService.getOriginalUrl(body);
  }

  private getAuthenticatedUser(req: Request): JwtPayload | null {
    return (req as Request & { user?: JwtPayload }).user ?? null;
  }

  private async proxyPublicFile(filePath: string, res: Response): Promise<void> {
    const result = (await this.platformGatewayService.getPublicFile(filePath)) as GatewayFileResult;
    const fileData = result?.result?.file_1 || result?.file_1;
    const fileUrl = typeof fileData === 'string' ? fileData : fileData?.view;

    if (!fileUrl) {
      res.status(404).send('File pre-signed URL not found');
      return;
    }

    let fetchResponse: globalThis.Response | null = null;
    try {
      fetchResponse = await fetch(fileUrl);
    } catch (err) {
      console.error('Failed to fetch file from gateway:', fileUrl, err);
    }

    if (fetchResponse && fetchResponse.ok) {
      const contentType = fetchResponse.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.send(Buffer.from(await fetchResponse.arrayBuffer()));
      return;
    }

    // Fallback: try to serve local file from ./uploads/** when gateway isn't reachable
    try {
      const localPath = join(process.cwd(), filePath.replace(/^\/+/, ''));
      const fileBuf = await readFile(localPath);
      const ext = extname(localPath).toLowerCase();
      const contentType = this.getContentTypeFromExt(ext);
      res.setHeader('Content-Type', contentType);
      res.send(fileBuf);
      return;
    } catch (err) {
      console.error('Failed to read local fallback file:', filePath, err);
      if (fetchResponse) {
        const status = fetchResponse.status || 502;
        res.status(status).send('Error retrieving file from gateway');
      } else {
        res.status(502).send('Error retrieving file from gateway and local storage');
      }
      return;
    }
  }

  private getContentTypeFromExt(ext: string): string {
    switch (ext) {
      case '.png':
        return 'image/png';
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.webp':
        return 'image/webp';
      case '.svg':
        return 'image/svg+xml';
      case '.pdf':
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }
}
