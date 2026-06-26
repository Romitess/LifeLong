import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class QuizAnswerFieldDto {
  @IsString()
  name: string;

  @IsString()
  value: string;
}

export class ProcessAttemptDto {
  /** true = submit for grading; false/omitted = save answers only. */
  @IsOptional()
  @IsBoolean()
  finish?: boolean;

  /** true = the quiz time limit expired (Moodle overdue handling / auto-submit). */
  @IsOptional()
  @IsBoolean()
  timeUp?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerFieldDto)
  data: QuizAnswerFieldDto[];

  /** Moodle course id — required for auto-marking subchapter progress on finish. */
  @IsOptional()
  @IsInt()
  moodleCourseId?: number;

  /** Course-module id (cmid) of the quiz activity. */
  @IsOptional()
  @IsInt()
  cmid?: number;

  /** COSESUBCHAP_ID of the subchapter this quiz gates. */
  @IsOptional()
  @IsInt()
  subChapterId?: number;

  /** ENROLL_ID of the current user's enrollment. */
  @IsOptional()
  @IsInt()
  enrollId?: number;
}
