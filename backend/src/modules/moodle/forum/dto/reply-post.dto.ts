import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';

export class ReplyPostDto {
  @IsInt()
  parentPostId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message!: string;
}
