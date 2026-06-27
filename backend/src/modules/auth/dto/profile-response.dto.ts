import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiPropertyOptional({ example: 123 })
  id: number;

  @ApiPropertyOptional({ example: '6500000001', nullable: true })
  studentCode: string | null;

  @ApiPropertyOptional({ example: 'U0000001', nullable: true })
  userCode: string | null;

  @ApiPropertyOptional({ example: 'สมชาย', nullable: true })
  firstNameTh: string | null;

  @ApiPropertyOptional({ example: 'ใจดี', nullable: true })
  lastNameTh: string | null;

  @ApiPropertyOptional({ example: 'SOMCHAI', nullable: true })
  firstNameEn: string | null;

  @ApiPropertyOptional({ example: 'JAIDEE', nullable: true })
  lastNameEn: string | null;

  @ApiPropertyOptional({ example: '0812345678', nullable: true })
  phone: string | null;

  @ApiPropertyOptional({ example: '/api/uploads/profile/123/profile.png', nullable: true })
  imageUrl: string | null;

  @ApiPropertyOptional({ example: 'lll-user-123' })
  avatarSeed: string;
}
