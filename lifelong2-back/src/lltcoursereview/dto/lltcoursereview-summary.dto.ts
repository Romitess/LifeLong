import { ApiProperty } from '@nestjs/swagger';

export class RatingDistributionDto {
  @ApiProperty() 1: number;
  @ApiProperty() 2: number;
  @ApiProperty() 3: number;
  @ApiProperty() 4: number;
  @ApiProperty() 5: number;
}

export class LltcoursereviewSummaryDto {
  @ApiProperty({ example: 4.5 })
  average: number;

  @ApiProperty({ example: 120 })
  total: number;

  @ApiProperty({ type: () => RatingDistributionDto })
  distribution: RatingDistributionDto;
}
