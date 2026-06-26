import { PartialType } from '@nestjs/swagger';
import { CreateLltcategoryDto } from './create-lltcategory.dto';

export class UpdateLltcategoryDto extends PartialType(CreateLltcategoryDto) {}
