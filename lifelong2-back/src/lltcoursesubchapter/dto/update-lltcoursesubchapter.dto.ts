import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursesubchapterDto } from './create-lltcoursesubchapter.dto';

export class UpdateLltcoursesubchapterDto extends PartialType(CreateLltcoursesubchapterDto) {}
