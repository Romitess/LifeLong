import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursetargetDto } from './create-lltcoursetarget.dto';

export class UpdateLltcoursetargetDto extends PartialType(CreateLltcoursetargetDto) {}
