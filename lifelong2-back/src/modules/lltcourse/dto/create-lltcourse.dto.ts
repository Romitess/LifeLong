import { IsEmail, IsString, IsOptional, IsNumberString, IsNotEmpty } from 'class-validator';

export class CreateLltcourseDto {
  @IsString()
  fullname: string;

  @IsString()
  @IsOptional()
  shortname?: string;

  @IsNumberString()
  @IsOptional()
  categoryid?: string;

  @IsNumberString()
  @IsOptional()
  subcategoryId?: string;

  @IsNumberString()
  @IsOptional()
  facultyId?: string;

  @IsNumberString()
  @IsOptional()
  typeCourseId?: string;

  @IsNumberString()
  @IsOptional()
  studyTypeId?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  /** ชั่วโมงรวม (คำนวณจาก theory+practice หรือกรอกโดยตรง) */
  @IsNumberString()
  @IsOptional()
  hours?: string;

  /** ชั่วโมงทฤษฎี */
  @IsNumberString()
  @IsOptional()
  theoryHours?: string;

  /** ชั่วโมงปฏิบัติ */
  @IsNumberString()
  @IsOptional()
  practiceHours?: string;

  /** หน่วยกิตสะสม */
  @IsString()
  @IsOptional()
  creditBank?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  registrationStart?: string;

  @IsString()
  @IsOptional()
  registrationEnd?: string;

  @IsString()
  @IsOptional()
  instructorUsername?: string;

  @IsString()
  @IsOptional()
  instructorEmail?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsNumberString()
  @IsOptional()
  maxSeats?: string;

  @IsNumberString()
  @IsNotEmpty()
  classTypeId: string;

  @IsNumberString()
  @IsNotEmpty()
  classFee: string;

  @IsString()
  @IsOptional()
  classFeeRemark?: string;

  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsString()
  @IsOptional()
  contactUrl?: string;

  /** คุณสมบัติเบื้องต้น → COSE_PRECONDITION */
  @IsString()
  @IsOptional()
  precondition?: string;

  /** มีวุฒิบัตร Y/N → COSE_CERTIFICATE */
  @IsString()
  @IsOptional()
  certificate?: string;

  /** ชื่อวุฒิบัตร → COSE_CERTIFICATENAME */
  @IsString()
  @IsOptional()
  certificateName?: string;

  /** JSON array of skill IDs → LLTCOURSESKILL */
  @IsString()
  @IsOptional()
  skillIds?: string;

  /** JSON array of {targetId, subtargetId?, other?} → LLTCOURSETARGET */
  @IsString()
  @IsOptional()
  targets?: string;
}
