import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  forwardRef,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { ProgressService, ProgressRow, CompletionResult } from './progress.service';
import { MarkProgressDto } from './dto/mark-progress.dto';
import { GetCompletionsDto } from './dto/get-completions.dto';
import { CertificatesService, CertRow } from '../certificates/certificates.service';

@Roles(Role.Student, Role.Admin)
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    @Inject(forwardRef(() => CertificatesService))
    private readonly certificatesService: CertificatesService,
  ) {}

  @Post()
  async mark(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MarkProgressDto,
  ): Promise<{
    success: true;
    completion: CompletionResult;
    cert?: CertRow;
    autoCompleted?: boolean;
  }> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.progressService.verifyEnrollmentOwnership(
        dto.enrollId,
        user.lltumSub,
        user.username,
      );
    }
    await this.progressService.markCompleted(dto.enrollId, dto.subChapterId);

    const completion = await this.progressService.checkCompletion(dto.enrollId);

    if (completion.completed) {
      const { cert } = await this.certificatesService.generate(dto.enrollId);
      await this.progressService.autoCompleteEnrollment(dto.enrollId);
      return { success: true, completion, cert, autoCompleted: true };
    }

    return { success: true, completion };
  }

  @Get()
  async list(
    @CurrentUser() user: JwtPayload,
    @Query('enrollId', ParseIntPipe) enrollId: number,
  ): Promise<{ enrollId: number; items: ProgressRow[] }> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.progressService.verifyEnrollmentOwnership(enrollId, user.lltumSub, user.username);
    }
    const items = await this.progressService.getByEnrollId(enrollId);
    return { enrollId, items };
  }

  @Get('completion/:enrollId')
  async completion(
    @CurrentUser() user: JwtPayload,
    @Param('enrollId', ParseIntPipe) enrollId: number,
  ): Promise<CompletionResult> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.progressService.verifyEnrollmentOwnership(enrollId, user.lltumSub, user.username);
    }
    return this.progressService.getMoodleCompletion(enrollId);
  }

  @Post('completions')
  async completions(
    @CurrentUser() user: JwtPayload,
    @Body() dto: GetCompletionsDto,
  ): Promise<{ items: Record<string, CompletionResult> }> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.progressService.verifyEnrollmentsOwnership(
        dto.enrollIds,
        user.lltumSub,
        user.username,
      );
    }
    return { items: await this.progressService.getMoodleCompletions(dto.enrollIds) };
  }
}
