import { PartialType } from '@nestjs/swagger';
import { CreateLltcourseDto } from './create-lltcourse.dto';

export class UpdateLltcourseDto extends PartialType(CreateLltcourseDto) {}
