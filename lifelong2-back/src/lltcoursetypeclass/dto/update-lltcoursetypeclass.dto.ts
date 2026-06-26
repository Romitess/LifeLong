import { PartialType } from '@nestjs/swagger';
import { CreateLltcoursetypeclassDto } from './create-lltcoursetypeclass.dto';

export class UpdateLltcoursetypeclassDto extends PartialType(CreateLltcoursetypeclassDto) {}
