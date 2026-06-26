import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursereviewDto } from './create-lltcoursereview.dto';

export class UpdateLltcoursereviewDto extends PartialType(CreateLltcoursereviewDto) {}
