import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/current-user.decorator';
import type { JwtPayload } from '../../auth/jwt-auth.guard';
import { assertBufferMagic } from 'src/common/utils/file-magic.validator';
import {
  MoodleAssignService,
  type AssignInfo,
  type AssignSubmission,
} from './moodle-assign.service';
import { SaveSubmissionDto } from './dto/save-submission.dto';

@ApiTags('moodle-assign')
@Controller('moodle/assign')
export class MoodleAssignController {
  constructor(private readonly assignService: MoodleAssignService) {}

  @Get(':moodleCourseId/module/:moduleId')
  @ApiOperation({ summary: 'Assignment info + the current user submission status (native)' })
  getAssignment(
    @CurrentUser() user: JwtPayload,
    @Param('moodleCourseId', ParseIntPipe) moodleCourseId: number,
    @Param('moduleId', ParseIntPipe) moduleId: number,
  ): Promise<{ assign: AssignInfo; submission: AssignSubmission }> {
    return this.assignService.getAssignment(user.username, moodleCourseId, moduleId);
  }

  @Post(':assignId/files')
  @ApiOperation({ summary: 'Upload a file to the user draft area; returns the draft itemid' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  uploadFile(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ itemid: number }> {
    if (!file) throw new BadRequestException('ไม่พบไฟล์ที่อัปโหลด');
    assertBufferMagic(file.buffer, ['jpeg', 'png', 'pdf']);
    return this.assignService.uploadDraftFile(user.username, {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
  }

  @Post(':assignId/submit')
  @ApiOperation({ summary: 'Save (and optionally submit) the assignment submission' })
  submit(
    @CurrentUser() user: JwtPayload,
    @Param('assignId', ParseIntPipe) assignId: number,
    @Body() dto: SaveSubmissionDto,
  ): Promise<{ submission: AssignSubmission; autoMarked: boolean; passed: boolean }> {
    return this.assignService.saveSubmission(user.username, assignId, dto);
  }
}
