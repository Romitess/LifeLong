import { PartialType } from '@nestjs/swagger';
import { CreateLltcertificatelogDto } from './create-lltcertificatelog.dto';

export class UpdateLltcertificatelogDto extends PartialType(CreateLltcertificatelogDto) {}
