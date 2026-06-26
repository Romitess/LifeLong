import { PartialType } from '@nestjs/swagger';
import { CreateLltchatDto } from './create-lltchat.dto';

export class UpdateLltchatDto extends PartialType(CreateLltchatDto) {}
