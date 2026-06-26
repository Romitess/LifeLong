import { PartialType } from '@nestjs/swagger';
import { CreateLltcostplanDto } from './create-lltcostplan.dto';

export class UpdateLltcostplanDto extends PartialType(CreateLltcostplanDto) {}
