import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDiscussionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message!: string;
}
