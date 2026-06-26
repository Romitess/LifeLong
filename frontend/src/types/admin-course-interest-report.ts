export interface AdminCourseInterestReportSummary {
  totalCourses: number;
  totalViews: number;
  totalEnrollments: number;
}

export interface AdminCourseInterestReportPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminCourseInterestReportItem {
  courseId: number;
  courseCode: string | null;
  courseName: string;
  responsibleName: string | null;
  startDate: string | null;
  endDate: string | null;
  viewCount: number;
  enrollmentCount: number;
}

export interface AdminCourseInterestReportResponse {
  generatedAt: string;
  summary: AdminCourseInterestReportSummary;
  pagination: AdminCourseInterestReportPagination;
  items: AdminCourseInterestReportItem[];
}
