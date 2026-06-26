export interface CentralFinanceFacultyReportFilterOption {
  id: number;
  label: string;
}

export interface CentralFinanceFacultyReportFilterOptions {
  faculties: CentralFinanceFacultyReportFilterOption[];
  courseTypes: CentralFinanceFacultyReportFilterOption[];
}

export interface CentralFinanceFacultyReportSummary {
  totalCourses: number;
  totalLearners: number;
  totalRegistrationFees: number;
}

export interface CentralFinanceFacultyReportPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CentralFinanceFacultyReportCourseItem {
  rowNumber: number;
  courseId: number;
  courseCode: string | null;
  courseName: string;
  responsibleName: string | null;
  startDate: string | null;
  endDate: string | null;
  learnerCount: number;
  unitPrice: number;
  registrationFee: number;
}

export interface CentralFinanceFacultyReportFacultyGroup {
  facultyId: number;
  facultyName: string;
  totalCourses: number;
  totalLearners: number;
  totalRegistrationFees: number;
  items: CentralFinanceFacultyReportCourseItem[];
}

export interface CentralFinanceFacultyReportResponse {
  generatedAt: string;
  filterOptions: CentralFinanceFacultyReportFilterOptions;
  summary: CentralFinanceFacultyReportSummary;
  pagination: CentralFinanceFacultyReportPagination;
  groups: CentralFinanceFacultyReportFacultyGroup[];
}
