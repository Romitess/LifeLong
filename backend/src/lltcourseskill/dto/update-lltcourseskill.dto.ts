import { PartialType } from '@nestjs/swagger';
import { CreateLltcourseskillDto } from './create-lltcourseskill.dto';

export class UpdateLltcourseskillDto extends PartialType(CreateLltcourseskillDto) {}
