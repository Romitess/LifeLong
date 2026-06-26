import { PartialType } from '@nestjs/swagger';
import { CreateEnrollreceiptDto } from './create-enrollreceipt.dto';

export class UpdateEnrollreceiptDto extends PartialType(CreateEnrollreceiptDto) {}
