import { PartialType } from '@nestjs/swagger';
import { CreateLltcourseinDto } from './create-lltcoursein.dto';

export class UpdateLltcourseinDto extends PartialType(CreateLltcourseinDto) {}
