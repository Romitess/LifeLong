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
