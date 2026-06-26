export interface AdminRegistrationStatisticsReportFilterOption {
  id: number;
  label: string;
}

export interface AdminRegistrationStatisticsReportFilterOptions {
  faculties: AdminRegistrationStatisticsReportFilterOption[];
  courseTypes: AdminRegistrationStatisticsReportFilterOption[];
}

export interface AdminRegistrationStatisticsReportSummary {
  totalCourses: number;
  totalLearners: number;
  totalRegistrationFees: number;
}

export interface AdminRegistrationStatisticsReportPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminRegistrationStatisticsReportCourseItem {
  rowNumber: number;
  courseId: number;
  courseCode: string | null;
  courseName: string;
  courseNameEn: string | null;
  responsibleName: string | null;
  responsibleNameEn: string | null;
  startDate: string | null;
  endDate: string | null;
  learnerCount: number;
  unitPrice: number;
  registrationFee: number;
}

export interface AdminRegistrationStatisticsReportFacultyGroup {
  facultyId: number;
  facultyName: string;
  totalCourses: number;
  totalLearners: number;
  totalRegistrationFees: number;
  items: AdminRegistrationStatisticsReportCourseItem[];
}

export interface AdminRegistrationStatisticsReportResponse {
  generatedAt: string;
  filterOptions: AdminRegistrationStatisticsReportFilterOptions;
  summary: AdminRegistrationStatisticsReportSummary;
  pagination: AdminRegistrationStatisticsReportPagination;
  groups: AdminRegistrationStatisticsReportFacultyGroup[];
}
