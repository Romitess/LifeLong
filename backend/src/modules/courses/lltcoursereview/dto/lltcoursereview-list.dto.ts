import { ApiProperty } from '@nestjs/swagger';
import { LltcoursereviewResponseDto } from './lltcoursereview-response.dto';
import { LltcoursereviewSummaryDto } from './lltcoursereview-summary.dto';

export class LltcoursereviewListDto {
  @ApiProperty({ type: () => [LltcoursereviewResponseDto] })
  items: LltcoursereviewResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ type: () => LltcoursereviewSummaryDto })
  summary: LltcoursereviewSummaryDto;
}
