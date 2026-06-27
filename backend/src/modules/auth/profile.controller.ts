import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
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
const PROFILE_IMAGE_MAX_FILE_SIZE = 5 * 1024 * 1024;

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
      limits: { fileSize: PROFILE_IMAGE_MAX_FILE_SIZE },
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

  @Patch('image-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Use an existing profile image URL as current profile image' })
  saveImageUrl(
    @Body() body: { imageUrl?: string },
    @CurrentUser() user: JwtPayload,
  ): Promise<ProfileImageResponseDto> {
    if (!body.imageUrl) {
      throw new BadRequestException('imageUrl is required');
    }
    return this.authService.saveProfileImageUrl(user, body.imageUrl);
  }

  @Post('avatar-options/upload')
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a profile viewer image option without changing current image' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: profileImageStorage,
      fileFilter: (_req, file, cb) => {
        cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype));
      },
      limits: { fileSize: PROFILE_IMAGE_MAX_FILE_SIZE },
    }),
  )
  async uploadAvatarOption(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ imageUrl: string }> {
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

    return this.authService.uploadAvatarOption(user, file);
  }

  @Get('avatar-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get profile viewer image options' })
  getAvatarOptions(@CurrentUser() user: JwtPayload): Promise<{ avatarOptions: string[] }> {
    return this.authService.getAvatarOptions(user);
  }

  @Patch('avatar-options')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save profile viewer image options' })
  saveAvatarOptions(
    @Body() body: { avatarOptions?: string[] },
    @CurrentUser() user: JwtPayload,
  ): Promise<{ avatarOptions: string[] }> {
    return this.authService.saveAvatarOptions(user, body.avatarOptions ?? []);
  }
}
