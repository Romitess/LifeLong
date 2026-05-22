export interface CourseFormOption {
  id: number;
  label: string;
}

export interface SubcategoryFormOption {
  id: number;
  label: string;
  categoryId: number;
}

export interface SubtargetFormOption {
  id: number;
  targetId: number;
  label: string;
  isOther: boolean;
  seq: number;
}

export interface TargetFormOption {
  id: number;
  label: string;
  isOther: boolean;
  seq: number;
  subtargets: SubtargetFormOption[];
}

export interface ChapterTypeFormOption {
  id: number;
  label: string;
  isOther: boolean;
}

export interface AdminCourseFormOptions {
  faculties: CourseFormOption[];
  courseTypes: CourseFormOption[];
  studyTypes: CourseFormOption[];
  classTypes: CourseFormOption[];
  skills: CourseFormOption[];
  categories: CourseFormOption[];
  subcategories: SubcategoryFormOption[];
  targets: TargetFormOption[];
  chapterTypes: ChapterTypeFormOption[];
}

export interface CourseSubchapterPayload {
  subject: string;
}

export interface CourseChapterPayload {
  subject: string;
  hour?: number;
  chapterTypeId?: number;
  chapterTypeOther?: string;
  subchapters?: CourseSubchapterPayload[];
}

export interface CourseTargetPayload {
  targetId: number;
  subtargetId?: number | undefined;
  other?: string | undefined;
}

export interface CreateCoursePayload {
  nameTh: string;
  nameEn: string;
  summary?: string | undefined;
  description?: string | undefined;
  facultyId: number;
  typeCourseId: number;
  creditBank?: string | undefined;
  theoryHours?: number | undefined;
  practiceHours?: number | undefined;
  studyTypeId: number;
  skillIds?: number[] | undefined;
  startDate: string;
  endDate: string;
  categoryId: number;
  subcategoryId?: number | undefined;
  targets?: CourseTargetPayload[] | undefined;
  classTypeId?: number | undefined;
  classFee?: number | undefined;
  classFeeRemark?: string | undefined;
  lo?: string | undefined;
  keyword?: string | undefined;
  privilege?: string | undefined;
  remarkChapter?: string | undefined;
  property?: string | undefined;
  evaluation?: string | undefined;
  competency?: string | undefined;
  precondition?: string | undefined;
  certificate?: 'Y' | 'N' | undefined;
  certificateName?: string | undefined;
  registrationStart?: string | undefined;
  registrationEnd?: string | undefined;
  maxSeats?: number | undefined;
  contactName: string;
  contactTel: string;
  contactEmail: string;
  contactUrl?: string | undefined;
  image?: File | undefined;
  removeImage?: boolean | undefined;
  file?: File | undefined;
  removeFile?: boolean | undefined;
  createUser?: string | undefined;
  instructors?: { username?: string; email?: string }[] | undefined;
  chapters?: CourseChapterPayload[] | undefined;
}

export interface AdminCourseItem {
  courseId: number;
  courseCode: string | null;
  titleTh: string | null;
  titleEn: string | null;
  facultyId: number;
  facultyName: string;
  typeCourseId: number;
  typeCourseName: string;
  responsibleName: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface AdminCoursesFilterOption {
  id: number;
  label: string;
}

export interface AdminCoursesFilterOptions {
  faculties: AdminCoursesFilterOption[];
  courseTypes: AdminCoursesFilterOption[];
}

export interface AdminCoursesPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminCoursesResponse {
  items: AdminCourseItem[];
  filterOptions: AdminCoursesFilterOptions;
  pagination: AdminCoursesPagination;
}

export interface AdminCourseDetail {
  courseId: number;
  courseCode: string | null;
  nameTh: string;
  nameEn: string;
  summary: string | null;
  description: string | null;
  imageUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  facultyId: number | null;
  typeCourseId: number | null;
  creditBank: string | null;
  theoryHours: number | null;
  practiceHours: number | null;
  studyTypeId: number | null;
  skillIds: number[];
  startDate: string | null;
  endDate: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
  targets: { targetId: number; subtargetId: number | null; other: string | null }[];
  classTypeId: number | null;
  classFee: number | null;
  classFeeRemark: string | null;
  lo: string | null;
  keyword: string | null;
  privilege: string | null;
  remarkChapter: string | null;
  property: string | null;
  evaluation: string | null;
  competency: string | null;
  precondition: string | null;
  certificate: string | null;
  certificateName: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  maxSeats: number | null;
  contactName: string | null;
  contactTel: string | null;
  contactEmail: string | null;
  contactUrl: string | null;
  instructors: { username: string | null; email: string | null }[];
  chapters: CourseChapterPayload[];
}
