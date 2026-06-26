import { PartialType } from '@nestjs/swagger';
import { CreateLlttargetDto } from './create-llttarget.dto';

export class UpdateLlttargetDto extends PartialType(CreateLlttargetDto) {}
