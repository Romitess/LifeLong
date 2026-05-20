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

export interface AdminCourseFormOptions {
  faculties: CourseFormOption[];
  courseTypes: CourseFormOption[];
  studyTypes: CourseFormOption[];
  classTypes: CourseFormOption[];
  skills: CourseFormOption[];
  categories: CourseFormOption[];
  subcategories: SubcategoryFormOption[];
  targets: TargetFormOption[];
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
  file?: File | undefined;
  createUser?: string | undefined;
  instructors?: { username?: string; email?: string }[] | undefined;
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
