import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class CreateLlttypestudyDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
