import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { mkdirSync } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { assertFileMagic } from 'src/common/utils/file-magic.validator';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { ProfileImageResponseDto } from './dto/profile-image-response.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const profileImageUploadDir = './uploaded_file/profile-image';

mkdirSync(profileImageUploadDir, { recursive: true });

const profileImageStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileImageUploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.png'}`);
  },
});

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile from LLTUMUSER' })
  getProfile(@CurrentUser() user: JwtPayload): Promise<ProfileResponseDto> {
    return this.authService.getProfile(user);
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile in LLTUMUSER' })
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileResponseDto> {
    return this.authService.updateProfile(user, dto);
  }

  @Patch('image')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload and save current user profile image' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: profileImageStorage,
      fileFilter: (_req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileImageResponseDto> {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Please send multipart/form-data with a file field named "file".',
      );
    }

    try {
      await assertFileMagic(file.path, ['jpeg', 'png', 'webp']);
    } catch (error) {
      await unlink(file.path).catch(() => undefined);
      throw error;
    }

    return this.authService.updateProfileImage(user, file);
  }

  @Delete('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove current user profile image' })
  deleteImage(@CurrentUser() user: JwtPayload): Promise<ProfileImageResponseDto> {
    return this.authService.deleteProfileImage(user);
  }
}
