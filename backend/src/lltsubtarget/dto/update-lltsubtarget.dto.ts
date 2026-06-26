import { PartialType } from '@nestjs/swagger';
import { CreateLltsubtargetDto } from './create-lltsubtarget.dto';

export class UpdateLltsubtargetDto extends PartialType(CreateLltsubtargetDto) {}
