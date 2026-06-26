import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SaveSubmissionDto {
  /** Online text submission (HTML). Omit if the assignment has no online-text. */
  @IsOptional()
  @IsString()
  onlineText?: string;

  /** Draft itemid returned by the file-upload endpoint. */
  @IsOptional()
  @IsInt()
  @Min(1)
  fileItemId?: number;

  /** true = submit for grading (drafts mode); false/omitted = save only. */
  @IsOptional()
  @IsBoolean()
  submit?: boolean;

  /** Moodle course id — required for auto-marking subchapter progress on submit. */
  @IsOptional()
  @IsInt()
  moodleCourseId?: number;

  /** Course-module id (cmid) of the assignment activity. */
  @IsOptional()
  @IsInt()
  cmid?: number;

  /** COSESUBCHAP_ID of the subchapter this assignment gates. */
  @IsOptional()
  @IsInt()
  subChapterId?: number;

  /** ENROLL_ID of the current user's enrollment. */
  @IsOptional()
  @IsInt()
  enrollId?: number;
}
