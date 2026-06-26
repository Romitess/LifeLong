import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LltcoursereviewResponseDto } from './lltcoursereview-response.dto';

export class MyLltcoursereviewDto {
  @ApiProperty({ example: false })
  canReview: boolean;

  @ApiPropertyOptional({
    example: 'NOT_COMPLETED',
    description: 'Reason why canReview is false; null when eligible',
    enum: ['NOT_ENROLLED', 'NOT_COMPLETED'],
    nullable: true,
  })
  reason: string | null;

  @ApiPropertyOptional({ type: () => LltcoursereviewResponseDto, nullable: true })
  review: LltcoursereviewResponseDto | null;
}
