import { PartialType } from '@nestjs/swagger';
import { CreateLlttypestudentDto } from './create-llttypestudent.dto';

export class UpdateLlttypestudentDto extends PartialType(CreateLlttypestudentDto) {}
