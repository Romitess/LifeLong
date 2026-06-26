import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursefileDto } from './create-lltcoursefile.dto';

export class UpdateLltcoursefileDto extends PartialType(CreateLltcoursefileDto) {}
