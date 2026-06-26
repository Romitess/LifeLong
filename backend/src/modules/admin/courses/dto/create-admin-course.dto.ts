import {
  IsDecimal,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CourseTargetDto {
  @Type(() => Number)
  @IsInt()
  targetId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subtargetId?: number;

  @IsOptional()
  @IsString()
  other?: string;
}

export class CreateAdminCourseDto {
  @IsNotEmpty()
  @IsString()
  nameTh: string;

  @IsNotEmpty()
  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  summary?: string;

  /** คำอธิบายรายวิชา (About This Course) → COSE_DESCRIPTION */
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageCrop?: string;

  @IsOptional()
  @IsString()
  removeImage?: string;

  @IsOptional()
  @IsString()
  removeFileIds?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  facultyId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  typeCourseId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  theoryHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  practiceHours?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  studyTypeId: number;

  @IsOptional()
  @IsString()
  skillWeightsJson?: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be YYYY-MM-DD' })
  startDate: string;

  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be YYYY-MM-DD' })
  endDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  subcategoryId?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (!value) return [];
    try {
      return typeof value === 'string' ? (JSON.parse(value) as CourseTargetDto[]) : value;
    } catch {
      return [];
    }
  })
  targets?: CourseTargetDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  classTypeId?: number;

  /** หน่วยกิตสะสม — เฉพาะหลักสูตรสะสมหน่วยกิต (typeCourseId=2) */
  @IsOptional()
  @IsDecimal()
  creditBank?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  classFee?: number;

  @IsOptional()
  @IsString()
  classFeeRemark?: string;

  /** รหัสผังแหล่งเงิน → COSTPLAN_ID (LLTCOSTPLAN) */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  costplanId?: number;

  @IsNotEmpty()
  @IsString()
  contactName: string;

  @IsNotEmpty()
  @IsString()
  contactTel: string;

  @IsNotEmpty()
  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsString()
  contactUrl?: string;

  /** หมายเหตุเพิ่มเติมเกี่ยวกับบทเรียน → COSE_REMARKCHAPTER */
  @IsOptional()
  @IsString()
  remarkChapter?: string;

  /** คุณสมบัติผู้สมัคร → COSE_PROPERTY */
  @IsOptional()
  @IsString()
  property?: string;

  /** เกณฑ์การวัดและประเมินผล → COSE_EVALUATION */
  @IsOptional()
  @IsString()
  evaluation?: string;

  /** สมรรถนะเด่น → COSE_COMPETENCY */
  @IsOptional()
  @IsString()
  competency?: string;

  /** ผลลัพธ์การเรียนรู้ (Learning Outcomes) → COSE_LO */
  @IsOptional()
  @IsString()
  lo?: string;

  /** คำค้นหา → COSE_KEYWORD */
  @IsOptional()
  @IsString()
  keyword?: string;

  /** สิทธิประโยชน์ผู้สำเร็จหลักสูตร → COSE_PRIVILEGE */
  @IsOptional()
  @IsString()
  privilege?: string;

  /** คุณสมบัติเบื้องต้น → COSE_PRECONDITION */
  @IsOptional()
  @IsString()
  precondition?: string;

  /** ลิงก์วิดีโอตัวอย่าง → OPENCLASS_VDO */
  @IsOptional()
  @IsString()
  vdo?: string;

  /** มีวุฒิบัตร Y/N → COSE_CERTIFICATE */
  @IsOptional()
  @IsString()
  certificate?: string;

  /** ชื่อวุฒิบัตร → COSE_CERTIFICATENAME */
  @IsOptional()
  @IsString()
  certificateName?: string;

  /** วันเปิดรับสมัคร → OPENCLASS_REGSTARTDATE */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'registrationStart must be YYYY-MM-DD' })
  registrationStart?: string;

  /** วันปิดรับสมัคร → OPENCLASS_REGENDDATE */
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'registrationEnd must be YYYY-MM-DD' })
  registrationEnd?: string;

  /** จำนวนที่นั่ง → OPENCLASS_NUMOPEN */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSeats?: number;

  @IsOptional()
  @IsString()
  createUser?: string;

  /** JSON array of { username?: string; email: string }[] */
  @IsOptional()
  @IsString()
  instructorsJson?: string;

  /**
   * JSON array of {
   *   subject: string; hour?: number;
   *   chapterTypeId?: number; chapterTypeOther?: string;
   *   subchapters?: { subject: string }[]
   * }[]
   */
  @IsOptional()
  @IsString()
  chaptersJson?: string;

  /** JSON array of { stutypeId: number; amount: number | null }[] */
  @IsOptional()
  @IsString()
  stutypeFeesJson?: string;
}
