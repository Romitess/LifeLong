import { PartialType } from '@nestjs/swagger';
import { CreateLltsubcategoryDto } from './create-lltsubcategory.dto';

export class UpdateLltsubcategoryDto extends PartialType(CreateLltsubcategoryDto) {}
