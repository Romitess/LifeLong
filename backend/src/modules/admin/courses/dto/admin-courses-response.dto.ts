export class AdminCourseItemDto {
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

export class AdminCoursesFilterOptionDto {
  id: number;
  label: string;
}

export class AdminCoursesFilterOptionsDto {
  faculties: AdminCoursesFilterOptionDto[];
  courseTypes: AdminCoursesFilterOptionDto[];
}

export class AdminCoursesPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminCoursesResponseDto {
  items: AdminCourseItemDto[];
  filterOptions: AdminCoursesFilterOptionsDto;
  pagination: AdminCoursesPaginationDto;
}

export class AdminCourseDetailSubchapterDto {
  subject: string;
}

export class AdminCourseDetailChapterDto {
  subject: string;
  hour: number | null;
  chapterTypeId: number | null;
  chapterTypeOther: string | null;
  subchapters: AdminCourseDetailSubchapterDto[];
}

export class AdminCourseDetailInstructorDto {
  username: string | null;
  email: string | null;
}

export class AdminCourseDetailTargetDto {
  targetId: number;
  subtargetId: number | null;
  other: string | null;
}

export class CourseFileDto {
  fileId: number;
  fileUrl: string;
  fileName: string;
}

export class CourseStutypeFeeDto {
  stutypeId: number;
  stutypeName: string;
  amount: number | null;
}

export class AdminCourseDetailDto {
  courseId: number;
  courseCode: string | null;
  nameTh: string;
  nameEn: string;
  summary: string | null;
  description: string | null;
  files: CourseFileDto[];
  imageUrl: string | null;
  imageCrop: string | null;
  facultyId: number | null;
  typeCourseId: number | null;
  creditBank: string | null;
  theoryHours: number | null;
  practiceHours: number | null;
  studyTypeId: number | null;
  skillWeights: { skillId: number; weight: number }[];
  startDate: string | null;
  endDate: string | null;
  categoryId: number | null;
  subcategoryId: number | null;
  targets: AdminCourseDetailTargetDto[];
  classTypeId: number | null;
  classFee: number | null;
  classFeeRemark: string | null;
  costplanId: number | null;
  lo: string | null;
  keyword: string | null;
  privilege: string | null;
  remarkChapter: string | null;
  property: string | null;
  evaluation: string | null;
  competency: string | null;
  precondition: string | null;
  status: 'Y' | 'N';
  published: 'Y' | 'N';
  moodleSyncStatus: 'Y' | 'N';
  moodleCourseId: number | null;
  certificate: string | null;
  certificateName: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  maxSeats: number | null;
  contactName: string | null;
  contactTel: string | null;
  contactEmail: string | null;
  contactUrl: string | null;
  vdo: string | null;
  instructors: AdminCourseDetailInstructorDto[];
  chapters: AdminCourseDetailChapterDto[];
  stutypeFees: CourseStutypeFeeDto[];
}
