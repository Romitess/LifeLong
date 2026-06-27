import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileImageResponseDto {
  @ApiPropertyOptional({ example: '/api/uploads/profile/123/profile.png', nullable: true })
  imageUrl: string | null;
}
