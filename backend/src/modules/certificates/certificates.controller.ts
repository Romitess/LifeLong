import { Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { CertificatesService, CertRow } from './certificates.service';

@Roles(Role.Student, Role.Admin)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post('generate/:enrollId')
  async generate(
    @CurrentUser() user: JwtPayload,
    @Param('enrollId', ParseIntPipe) enrollId: number,
    @Query('templateId') templateId?: string,
    @Query('signerId') signerId?: string,
    @Query('force') force?: string,
  ): Promise<{ cert: CertRow; alreadyExisted: boolean }> {
    if (user.role.toLowerCase() !== Role.Admin.toLowerCase()) {
      await this.certificatesService.verifyEnrollmentOwnership(enrollId, user.lltumSub);
    }
    return this.certificatesService.generate(
      enrollId,
      templateId ? Number(templateId) : undefined,
      signerId ? Number(signerId) : undefined,
      force === 'true',
    );
  }

  @Public()
  @Get('verify/:code')
  async verify(@Param('code') code: string): Promise<object> {
    return this.certificatesService.verify(code);
  }

  @Get('my')
  async my(@CurrentUser() user: JwtPayload): Promise<{ userId: number | null; items: object[] }> {
    const items = user.lltumSub ? await this.certificatesService.findByUser(user.lltumSub) : [];
    return { userId: user.lltumSub, items };
  }

  @Get('templates/active')
  getActiveTemplates(): Promise<
    { id: number; name: string; url: string | null; layout: object | null }[]
  > {
    return this.certificatesService.findActiveTemplates();
  }
}
