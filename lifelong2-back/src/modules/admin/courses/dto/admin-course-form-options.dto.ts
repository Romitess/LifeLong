export class CourseFormOptionDto {
  id: number;
  label: string;
}

export class SubcategoryFormOptionDto {
  id: number;
  label: string;
  categoryId: number;
}

export class SubtargetFormOptionDto {
  id: number;
  targetId: number;
  label: string;
  isOther: boolean;
  seq: number;
}

export class TargetFormOptionDto {
  id: number;
  label: string;
  isOther: boolean;
  seq: number;
  subtargets: SubtargetFormOptionDto[];
}

export class ChapterTypeFormOptionDto {
  id: number;
  label: string;
  isOther: boolean;
}

export class StudentTypeFormOptionDto {
  id: number;
  label: string;
}

export class CostplanFormOptionDto {
  id: number;
  code: string;
  label: string;
  isUsed?: boolean;
}

export class AdminCourseFormOptionsDto {
  faculties: CourseFormOptionDto[];
  courseTypes: CourseFormOptionDto[];
  studyTypes: CourseFormOptionDto[];
  classTypes: CourseFormOptionDto[];
  skills: CourseFormOptionDto[];
  categories: CourseFormOptionDto[];
  subcategories: SubcategoryFormOptionDto[];
  targets: TargetFormOptionDto[];
  chapterTypes: ChapterTypeFormOptionDto[];
  studentTypes: StudentTypeFormOptionDto[];
  costplans: CostplanFormOptionDto[];
}
