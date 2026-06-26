import { Body, Controller, Post } from '@nestjs/common';
import { IsArray, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CertificatesService } from './certificates.service';

class BulkGenerateDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Type(() => Number)
  enrollIds: number[];

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  templateId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  signerId?: number;
}

@Roles(Role.Admin)
@Controller('admin/certificates')
export class AdminCertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  /** Bulk-generate certificates for multiple enrollments */
  @Post('bulk-generate')
  async bulkGenerate(
    @Body() dto: BulkGenerateDto,
  ): Promise<{ generated: number; skipped: number; errors: string[] }> {
    return this.certificatesService.bulkGenerate(dto.enrollIds, dto.templateId, dto.signerId);
  }
}
