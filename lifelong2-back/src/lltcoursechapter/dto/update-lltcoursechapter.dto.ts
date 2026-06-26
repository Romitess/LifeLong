import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursechapterDto } from './create-lltcoursechapter.dto';

export class UpdateLltcoursechapterDto extends PartialType(CreateLltcoursechapterDto) {}
