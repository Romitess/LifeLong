import { PartialType } from '@nestjs/swagger';
import { CreateLltevaluationDto } from './create-lltevaluation.dto';

export class UpdateLltevaluationDto extends PartialType(CreateLltevaluationDto) {}
