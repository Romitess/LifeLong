import { PartialType } from '@nestjs/swagger';
import { CreateLlttypestudyDto } from './create-llttypestudy.dto';

export class UpdateLlttypestudyDto extends PartialType(CreateLlttypestudyDto) {}
