export interface AdminDashboardTotalsDto {
  totalCourses: number;
  activeCourses: number;
  certificateCourses: number;
  creditCourses: number;
  publicGeneralCourses: number;
  unspecifiedTypeCourses: number;
  instructorCount: number;
  facultyCount: number;
  totalOpenClasses: number;
  publicOpenClasses: number;
  registrationOpenClasses: number;
  distinctLearners: number;
  totalEnrollments: number;
  paidEnrollments: number;
  freeEnrollments: number;
  totalRevenue: number;
  paymentRecords: number;
  paymentAmount: number;
  totalClicks: number;
}

export interface AdminDashboardMonthlySeriesDto {
  monthKey: string;
  enrollments: number;
  paidEnrollments: number;
  distinctLearners: number;
  revenue: number;
  openClasses: number;
  clicks: number;
}

export interface AdminDashboardBreakdownItemDto {
  id: string;
  label: string;
  value: number;
}

export interface AdminDashboardCategoryItemDto {
  id: string;
  label: string;
  courseCount: number;
  enrollmentCount: number;
  revenue: number;
}

export interface AdminDashboardFacultyItemDto {
  id: string;
  label: string;
  courseCount: number;
  enrollmentCount: number;
  revenue: number;
}

export interface AdminDashboardTopCourseItemDto {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  facultyName: string;
  categoryName: string;
  enrollmentCount: number;
  paidEnrollmentCount: number;
  revenue: number;
  openClassAmount: number;
  publicFlag: string | null;
}

export interface AdminDashboardRecentEnrollmentDto {
  enrollId: number;
  enrolledAt: string | null;
  learnerName: string;
  learnerEmail: string | null;
  courseCode: string;
  courseTitle: string;
  amount: number;
  payStatus: 'paid' | 'free' | 'pending';
}

export interface AdminDashboardResponseDto {
  generatedAt: string;
  period: string;
  periodLabel: string;
  availableYears: number[];
  totals: AdminDashboardTotalsDto;
  monthlySeries: AdminDashboardMonthlySeriesDto[];
  enrollmentBreakdown: AdminDashboardBreakdownItemDto[];
  categoryPerformance: AdminDashboardCategoryItemDto[];
  facultyPerformance: AdminDashboardFacultyItemDto[];
  topCourses: AdminDashboardTopCourseItemDto[];
  recentEnrollments: AdminDashboardRecentEnrollmentDto[];
}
