import {
  BadRequestException,
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './public.decorator';
import { Roles } from './roles.decorator';
import { Role } from './enums/role.enum';
import type { JwtPayload } from './jwt-auth.guard';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';

const avatarUploadDirectory = './uploaded_file/auth-avatar';
mkdirSync(avatarUploadDirectory, { recursive: true });

const avatarDiskStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarUploadDirectory);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname)}`);
  },
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto, @Req() req: Request): ReturnType<AuthService['login']> {
    return this.authService.login(loginDto, req);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto): ReturnType<AuthService['register']> {
    return this.authService.register(registerDto);
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: avatarDiskStorage,
      fileFilter: (_req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<{ avatarPath: string; avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send multipart/form-data with a file field named "file".',
      );
    }

    try {
      await assertFileMagic(file.path, ['jpeg', 'png', 'webp']);
      const user = (req as Request & { user?: JwtPayload }).user;
      if (!user) {
        throw new BadRequestException('Authenticated user is required');
      }
      return await this.authService.uploadAvatar(user.sub, file);
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  /**
   * Admin-only maintenance: create/link Moodle accounts for LLT users missing an
   * LMS_ID. Idempotent and batched — call repeatedly until `remaining` is 0.
   */
  @Roles(Role.Admin)
  @Post('moodle-backfill')
  @HttpCode(HttpStatus.OK)
  backfillMoodle(@Query('limit') limit?: string): ReturnType<AuthService['backfillMoodleUsers']> {
    const parsed = Number(limit);
    return this.authService.backfillMoodleUsers(
      Number.isFinite(parsed) && parsed > 0 ? parsed : 100,
    );
  }
}
