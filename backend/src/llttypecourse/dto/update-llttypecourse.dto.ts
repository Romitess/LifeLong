import { PartialType } from '@nestjs/swagger';
import { CreateLlttypecourseDto } from './create-llttypecourse.dto';

export class UpdateLlttypecourseDto extends PartialType(CreateLlttypecourseDto) {}
