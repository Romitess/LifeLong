import { computed, onMounted, ref, watch, type ComputedRef, type Ref } from 'vue';
import { api } from 'src/boot/axios';

const SITE_PALETTE = [
  '#F5A623',
  '#1A237E',
  '#0F766E',
  '#E11D48',
  '#3F51B5',
  '#0EA5E9',
  '#16A34A',
  '#9333EA',
  '#DB2777',
  '#F97316',
  '#0284C7',
  '#65A30D',
];

export interface DashboardKpi {
  id: string;
  label: string;
  value: number;
  delta: number;
  deltaLabel: string;
  description: string;
  icon: string;
  tone: 'gold' | 'navy' | 'teal' | 'rose';
  trend: number[];
}

export interface DeliveryModeBreakdown {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface MonthlyDashboardSeries {
  months: string[];
  monthKeys: string[];
  enrollments: number[];
  paidEnrollments: number[];
  distinctLearners: number[];
  revenue: number[];
  openClasses: number[];
  clicks: number[];
}

export interface CategoryUsage {
  id: string;
  name: string;
  courseCount: number;
  enrolledLearners: number;
  revenue: number;
  color: string;
  icon: string;
}

export interface CourseLeaderboardItem {
  id: string;
  code: string;
  title: string;
  faculty: string;
  category: string;
  enrolledCount: number;
  paidEnrollmentCount: number;
  revenue: number;
  classAmount: number;
  paymentRate: number;
  isPublic: boolean;
}

export interface FacultyShare {
  id: string;
  label: string;
  value: number;
  courseCount: number;
  revenue: number;
  color: string;
}

export interface RecentRegistration {
  id: string;
  learnerName: string;
  learnerInitial: string;
  learnerEmail: string | null;
  courseTitle: string;
  courseCode: string;
  amount: number;
  registeredAt: string | null;
  paymentStatus: 'paid' | 'free' | 'pending';
}

interface DashboardApiTotals {
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

interface DashboardApiMonthlySeries {
  monthKey: string;
  enrollments: number;
  paidEnrollments: number;
  distinctLearners: number;
  revenue: number;
  openClasses: number;
  clicks: number;
}

interface DashboardApiBreakdownItem {
  id: string;
  label: string;
  value: number;
}

interface DashboardApiCategoryItem {
  id: string;
  label: string;
  courseCount: number;
  enrollmentCount: number;
  revenue: number;
}

interface DashboardApiFacultyItem {
  id: string;
  label: string;
  courseCount: number;
  enrollmentCount: number;
  revenue: number;
}

interface DashboardApiTopCourseItem {
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

interface DashboardApiRecentEnrollmentItem {
  enrollId: number;
  enrolledAt: string | null;
  learnerName: string;
  learnerEmail: string | null;
  courseCode: string;
  courseTitle: string;
  amount: number;
  payStatus: 'paid' | 'free' | 'pending';
}

interface DashboardApiResponse {
  generatedAt: string;
  period: string;
  periodLabel: string;
  availableYears: number[];
  totals: DashboardApiTotals;
  monthlySeries: DashboardApiMonthlySeries[];
  enrollmentBreakdown: DashboardApiBreakdownItem[];
  categoryPerformance: DashboardApiCategoryItem[];
  facultyPerformance: DashboardApiFacultyItem[];
  topCourses: DashboardApiTopCourseItem[];
  recentEnrollments: DashboardApiRecentEnrollmentItem[];
}

export type DashboardPeriod =
  | 'month'
  | 'q1'
  | 'q2'
  | 'q3'
  | 'q4'
  | 'h1'
  | 'h2'
  | 'year'
  | 'rolling12'
  | 'yearly'
  | 'allTime';

export interface DashboardMetrics {
  isLoading: Ref<boolean>;
  errorMessage: Ref<string | null>;
  generatedAt: ComputedRef<string | null>;
  period: Ref<DashboardPeriod>;
  selectedYear: Ref<number>;
  selectedMonth: Ref<number>;
  periodLabel: ComputedRef<string>;
  availableYears: ComputedRef<number[]>;
  kpis: ComputedRef<DashboardKpi[]>;
  monthlySeries: ComputedRef<MonthlyDashboardSeries>;
  categoryUsage: ComputedRef<CategoryUsage[]>;
  deliveryBreakdown: ComputedRef<DeliveryModeBreakdown[]>;
  topCourses: ComputedRef<CourseLeaderboardItem[]>;
  facultyShare: ComputedRef<FacultyShare[]>;
  recentRegistrations: ComputedRef<RecentRegistration[]>;
  totals: ComputedRef<{
    courses: number;
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
    enrolledLearners: number;
    paidEnrollments: number;
    freeEnrollments: number;
    totalRevenue: number;
    paymentRecords: number;
    paymentAmount: number;
    totalClicks: number;
  }>;
  refresh: () => Promise<void>;
}

function formatMonthLabel(monthKey: string): string {
  const [yearText, monthText] = monthKey.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  if (!year || !month) {
    return monthKey;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat('th-TH', { month: 'short' }).format(date);
}

function createEmptyResponse(): DashboardApiResponse {
  return {
    generatedAt: new Date().toISOString(),
    period: 'monthly',
    periodLabel: '',
    availableYears: [],
    totals: {
      totalCourses: 0,
      activeCourses: 0,
      certificateCourses: 0,
      creditCourses: 0,
      publicGeneralCourses: 0,
      unspecifiedTypeCourses: 0,
      instructorCount: 0,
      facultyCount: 0,
      totalOpenClasses: 0,
      publicOpenClasses: 0,
      registrationOpenClasses: 0,
      distinctLearners: 0,
      totalEnrollments: 0,
      paidEnrollments: 0,
      freeEnrollments: 0,
      totalRevenue: 0,
      paymentRecords: 0,
      paymentAmount: 0,
      totalClicks: 0,
    },
    monthlySeries: [],
    enrollmentBreakdown: [],
    categoryPerformance: [],
    facultyPerformance: [],
    topCourses: [],
    recentEnrollments: [],
  };
}

function deltaFromSeries(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const previous = values[values.length - 2] ?? 0;
  const current = values[values.length - 1] ?? 0;

  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function getInitial(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) {
    return 'L';
  }

  return cleaned.charAt(0).toUpperCase();
}

export function useAdminDashboardMetrics(): DashboardMetrics {
  const isLoading = ref(false);
  const errorMessage = ref<string | null>(null);
  const period = ref<DashboardPeriod>('rolling12');
  const selectedYear = ref<number>(new Date().getFullYear());
  const selectedMonth = ref<number>(new Date().getMonth() + 1);
  const response = ref<DashboardApiResponse>(createEmptyResponse());

  async function refresh(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = null;

    try {
      const { data } = await api.get<DashboardApiResponse>('/api/admin/dashboard', {
        params: {
          period: period.value,
          year: selectedYear.value,
          ...(period.value === 'month' ? { month: selectedMonth.value } : {}),
        },
      });
      response.value = data;
    } catch (error) {
      console.error('Failed to load admin dashboard metrics', error);
      errorMessage.value = 'ไม่สามารถโหลดข้อมูล dashboard จาก backend ได้';
    } finally {
      isLoading.value = false;
    }
  }

  watch([period, selectedYear, selectedMonth], () => void refresh());

  onMounted(() => {
    void refresh();
  });

  const generatedAt = computed(() => response.value.generatedAt ?? null);
  const periodLabel = computed(() => response.value.periodLabel ?? '');
  const availableYears = computed(() => response.value.availableYears ?? []);

  const totals = computed(() => ({
    courses: response.value.totals.totalCourses,
    activeCourses: response.value.totals.activeCourses,
    certificateCourses: response.value.totals.certificateCourses,
    creditCourses: response.value.totals.creditCourses,
    publicGeneralCourses: response.value.totals.publicGeneralCourses,
    unspecifiedTypeCourses: response.value.totals.unspecifiedTypeCourses,
    instructorCount: response.value.totals.instructorCount,
    facultyCount: response.value.totals.facultyCount,
    totalOpenClasses: response.value.totals.totalOpenClasses,
    publicOpenClasses: response.value.totals.publicOpenClasses,
    registrationOpenClasses: response.value.totals.registrationOpenClasses,
    distinctLearners: response.value.totals.distinctLearners,
    enrolledLearners: response.value.totals.totalEnrollments,
    paidEnrollments: response.value.totals.paidEnrollments,
    freeEnrollments: response.value.totals.freeEnrollments,
    totalRevenue: response.value.totals.totalRevenue,
    paymentRecords: response.value.totals.paymentRecords,
    paymentAmount: response.value.totals.paymentAmount,
    totalClicks: response.value.totals.totalClicks,
  }));

  const monthlySeries = computed<MonthlyDashboardSeries>(() => ({
    months: response.value.monthlySeries.map((item) => formatMonthLabel(item.monthKey)),
    monthKeys: response.value.monthlySeries.map((item) => item.monthKey),
    enrollments: response.value.monthlySeries.map((item) => item.enrollments),
    paidEnrollments: response.value.monthlySeries.map((item) => item.paidEnrollments),
    distinctLearners: response.value.monthlySeries.map((item) => item.distinctLearners),
    revenue: response.value.monthlySeries.map((item) => item.revenue),
    openClasses: response.value.monthlySeries.map((item) => item.openClasses),
    clicks: response.value.monthlySeries.map((item) => item.clicks),
  }));

  const categoryUsage = computed<CategoryUsage[]>(() =>
    response.value.categoryPerformance.map((item, index) => ({
      id: item.id,
      name: item.label,
      courseCount: item.courseCount,
      enrolledLearners: item.enrollmentCount,
      revenue: item.revenue,
      color: SITE_PALETTE[index % SITE_PALETTE.length] ?? '#1A237E',
      icon: 'category',
    })),
  );

  const deliveryBreakdown = computed<DeliveryModeBreakdown[]>(() =>
    response.value.enrollmentBreakdown.map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      color: item.id === 'paid' ? '#1A237E' : item.id === 'free' ? '#0F766E' : '#F5A623',
    })),
  );

  const topCourses = computed<CourseLeaderboardItem[]>(() =>
    response.value.topCourses.map((item) => ({
      id: String(item.courseId),
      code: item.courseCode,
      title: item.courseTitle,
      faculty: item.facultyName,
      category: item.categoryName,
      enrolledCount: item.enrollmentCount,
      paidEnrollmentCount: item.paidEnrollmentCount,
      revenue: item.revenue,
      classAmount: item.openClassAmount,
      paymentRate: item.enrollmentCount === 0 ? 0 : item.paidEnrollmentCount / item.enrollmentCount,
      isPublic: item.publicFlag === 'Y',
    })),
  );

  const facultyShare = computed<FacultyShare[]>(() =>
    response.value.facultyPerformance.map((item, index) => ({
      id: item.id,
      label: item.label,
      value: item.enrollmentCount,
      courseCount: item.courseCount,
      revenue: item.revenue,
      color: SITE_PALETTE[index % SITE_PALETTE.length] ?? '#1A237E',
    })),
  );

  const recentRegistrations = computed<RecentRegistration[]>(() =>
    response.value.recentEnrollments.map((item) => ({
      id: String(item.enrollId),
      learnerName: item.learnerName,
      learnerInitial: getInitial(item.learnerName),
      learnerEmail: item.learnerEmail,
      courseTitle: item.courseTitle,
      courseCode: item.courseCode,
      amount: item.amount,
      registeredAt: item.enrolledAt,
      paymentStatus: item.payStatus,
    })),
  );

  const kpis = computed<DashboardKpi[]>(() => {
    const series = monthlySeries.value;
    const paidRate =
      totals.value.enrolledLearners === 0
        ? 0
        : Math.round((totals.value.paidEnrollments / totals.value.enrolledLearners) * 10000) / 100;

    const isYearly = period.value === 'yearly' || period.value === 'allTime';
    const deltaLabel = isYearly ? 'เทียบปีล่าสุด' : 'เทียบช่วงก่อนหน้า';

    return [
      {
        id: 'revenue',
        label: 'รายได้จากการลงทะเบียน',
        value: totals.value.totalRevenue,
        delta: deltaFromSeries(series.revenue),
        deltaLabel,
        description: `ชำระเงินสำเร็จ ${totals.value.paidEnrollments.toLocaleString('th-TH')} รายการ`,
        icon: 'payments',
        tone: 'gold',
        trend: series.revenue,
      },
      {
        id: 'enrollments',
        label: 'ผู้ลงทะเบียน',
        value: totals.value.enrolledLearners,
        delta: deltaFromSeries(series.enrollments),
        deltaLabel,
        description: `ฟรี ${totals.value.freeEnrollments.toLocaleString('th-TH')} · ชำระเงิน ${totals.value.paidEnrollments.toLocaleString('th-TH')} รายการ`,
        icon: 'groups',
        tone: 'navy',
        trend: series.enrollments,
      },
      {
        id: 'learners',
        label: 'ผู้เรียนไม่ซ้ำ',
        value: totals.value.distinctLearners,
        delta: deltaFromSeries(series.distinctLearners),
        deltaLabel,
        description: `จาก ${totals.value.courses.toLocaleString('th-TH')} หลักสูตรในระบบ`,
        icon: 'school',
        tone: 'teal',
        trend: series.distinctLearners,
      },
      {
        id: 'paid-rate',
        label: 'อัตราการชำระเงิน',
        value: paidRate,
        delta: deltaFromSeries(series.paidEnrollments),
        deltaLabel,
        description: `${totals.value.paidEnrollments.toLocaleString('th-TH')} จาก ${totals.value.enrolledLearners.toLocaleString('th-TH')} รายการ`,
        icon: 'receipt_long',
        tone: 'rose',
        trend: series.paidEnrollments,
      },
    ];
  });

  return {
    isLoading,
    errorMessage,
    generatedAt,
    period,
    selectedYear,
    selectedMonth,
    periodLabel,
    availableYears,
    kpis,
    monthlySeries,
    categoryUsage,
    deliveryBreakdown,
    topCourses,
    facultyShare,
    recentRegistrations,
    totals,
    refresh,
  };
}
