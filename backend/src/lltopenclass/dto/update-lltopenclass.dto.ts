import { PartialType } from '@nestjs/swagger';
import { CreateLltopenclassDto } from './create-lltopenclass.dto';

export class UpdateLltopenclassDto extends PartialType(CreateLltopenclassDto) {}
