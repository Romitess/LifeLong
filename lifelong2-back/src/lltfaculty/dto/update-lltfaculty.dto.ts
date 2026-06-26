import { PartialType } from '@nestjs/swagger';
import { CreateLltfacultyDto } from './create-lltfaculty.dto';

export class UpdateLltfacultyDto extends PartialType(CreateLltfacultyDto) {}
