import { computed, type ComputedRef } from 'vue';
import { useCategoryStore } from 'src/stores/category-store';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';
import type { CategoryWithUsage } from 'src/types/category';
import {
  calculateCourseRevenue,
  calculateFillRate,
  formatCompactCurrency,
  formatCount,
} from 'src/utils/course-format';

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

const MONTH_LABELS = ['ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.'];

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
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

export interface RevenueAndEnrollmentSeries {
  months: string[];
  revenue: number[];
  enrollments: number[];
  totalRevenue: number;
  totalEnrollments: number;
}

export interface CategoryUsage {
  id: string;
  name: string;
  courseCount: number;
  enrolledLearners: number;
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
  maxSeats: number;
  fillRate: number;
  revenue: number;
  isFree: boolean;
}

export interface FacultyShare {
  id: string;
  label: string;
  value: number;
  color: string;
}

export interface RecentRegistration {
  id: string;
  learnerName: string;
  learnerInitial: string;
  courseTitle: string;
  courseCode: string;
  category: string;
  amount: number;
  isFree: boolean;
  registeredAt: string;
  channel: 'online' | 'onsite' | 'self-paced';
}

export interface DashboardMetrics {
  kpis: ComputedRef<DashboardKpi[]>;
  revenueSeries: ComputedRef<RevenueAndEnrollmentSeries>;
  categoryUsage: ComputedRef<CategoryUsage[]>;
  deliveryBreakdown: ComputedRef<DeliveryModeBreakdown[]>;
  topCourses: ComputedRef<CourseLeaderboardItem[]>;
  facultyShare: ComputedRef<FacultyShare[]>;
  recentRegistrations: ComputedRef<RecentRegistration[]>;
  totals: ComputedRef<{
    courses: number;
    activeCourses: number;
    categories: number;
    enrolledLearners: number;
    totalSeats: number;
    totalRevenue: number;
    totalViews: number;
    averageFillRate: number;
  }>;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

function pseudoRandomFromSeed(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

const FAKE_LEARNER_NAMES = [
  'นริศรา ภูมิใจ',
  'อาทิตย์ ศุภวงศ์',
  'พิชญา เสริมสุข',
  'ธนกฤต สุนทรพันธุ์',
  'ปาริชาต ชัยวัฒน์',
  'กฤตภาส อุดมศักดิ์',
  'มนัสนันท์ บัวศรี',
  'ภาณุวัฒน์ พัฒนวงศ์',
  'ศิรประภา ทองรอด',
  'พงศธร อักษรเงิน',
  'อนุวัฒน์ สุขเจริญ',
  'พิมพ์มาดา รัศมีฉาย',
];

export function useAdminDashboardMetrics(): DashboardMetrics {
  const courseStore = useCourseStore();
  const categoryStore = useCategoryStore();

  courseStore.init();
  categoryStore.init();

  const courses = computed<Course[]>(() => courseStore.courses);

  const totalRevenue = computed(() =>
    courses.value.reduce((sum, course) => sum + calculateCourseRevenue(course), 0),
  );

  const totalEnrolled = computed(() =>
    courses.value.reduce((sum, course) => sum + course.enrolledCount, 0),
  );

  const totalSeats = computed(() =>
    courses.value.reduce((sum, course) => sum + course.maxSeats, 0),
  );

  const revenueSeries = computed<RevenueAndEnrollmentSeries>(() => {
    const seedRandom = pseudoRandomFromSeed(hashString('lll-revenue'));
    const courseCount = Math.max(courses.value.length, 1);
    const baseRevenue = totalRevenue.value || courseCount * 12000;
    const baseEnroll = totalEnrolled.value || courseCount * 30;

    const distribution = [0.62, 0.74, 0.83, 0.91, 0.97, 1];

    const revenue = distribution.map((ratio, index) => {
      const noise = seedRandom() * 0.16 - 0.08;
      const seasonal = Math.sin((index / 5) * Math.PI) * 0.08;
      return Math.round(baseRevenue * (ratio + noise + seasonal));
    });

    const enrollments = distribution.map((ratio, index) => {
      const noise = seedRandom() * 0.18 - 0.09;
      const seasonal = Math.sin(((index + 1) / 6) * Math.PI) * 0.1;
      return Math.round(baseEnroll * (ratio + noise + seasonal));
    });

    return {
      months: MONTH_LABELS,
      revenue,
      enrollments,
      totalRevenue: revenue.reduce((sum, value) => sum + value, 0),
      totalEnrollments: enrollments.reduce((sum, value) => sum + value, 0),
    };
  });

  const categoryUsage = computed<CategoryUsage[]>(() => {
    const usage: CategoryWithUsage[] = categoryStore.categoriesWithUsage;

    return usage
      .map((category) => {
        const learners = courses.value
          .filter((course) => course.category === category.name)
          .reduce((sum, course) => sum + course.enrolledCount, 0);

        return {
          id: category.id,
          name: category.name,
          courseCount: category.courseCount,
          enrolledLearners: learners,
          color: category.color,
          icon: category.icon,
        };
      })
      .filter((entry) => entry.courseCount > 0)
      .sort((left, right) => right.enrolledLearners - left.enrolledLearners);
  });

  const deliveryBreakdown = computed<DeliveryModeBreakdown[]>(() => {
    const counters: Record<string, number> = {
      Online: 0,
      Onsite: 0,
      'Self-Paced Learning': 0,
    };

    courses.value.forEach((course) => {
      const mode = course.deliveryModes[0] ?? 'Online';
      counters[mode] = (counters[mode] ?? 0) + course.enrolledCount;
    });

    return [
      { id: 'online', label: 'Online', value: counters.Online ?? 0, color: '#1A237E' },
      { id: 'onsite', label: 'Onsite', value: counters.Onsite ?? 0, color: '#F5A623' },
      {
        id: 'self-paced',
        label: 'Self-Paced',
        value: counters['Self-Paced Learning'] ?? 0,
        color: '#0F766E',
      },
    ];
  });

  const topCourses = computed<CourseLeaderboardItem[]>(() =>
    [...courses.value]
      .map((course) => ({
        id: course.id,
        code: course.code,
        title: course.title,
        faculty: course.faculty,
        category: course.category,
        enrolledCount: course.enrolledCount,
        maxSeats: course.maxSeats,
        fillRate: calculateFillRate(course),
        revenue: calculateCourseRevenue(course),
        isFree: course.isFree,
      }))
      .sort((left, right) => {
        if (right.revenue !== left.revenue) return right.revenue - left.revenue;
        return right.enrolledCount - left.enrolledCount;
      })
      .slice(0, 6),
  );

  const facultyShare = computed<FacultyShare[]>(() => {
    const counter = new Map<string, number>();
    courses.value.forEach((course) => {
      counter.set(course.faculty, (counter.get(course.faculty) ?? 0) + course.enrolledCount);
    });

    return Array.from(counter.entries())
      .map(([faculty, value], index) => ({
        id: faculty,
        label: faculty,
        value,
        color: SITE_PALETTE[index % SITE_PALETTE.length] ?? '#1A237E',
      }))
      .filter((entry) => entry.value > 0)
      .sort((left, right) => right.value - left.value);
  });

  const recentRegistrations = computed<RecentRegistration[]>(() => {
    const random = pseudoRandomFromSeed(hashString('lll-recent'));
    const sourceCourses = [...courses.value]
      .sort((left, right) => right.enrolledCount - left.enrolledCount)
      .slice(0, 8);

    const baseDate = new Date('2026-05-08T16:30:00+07:00');

    return sourceCourses.map((course, index) => {
      const learnerName =
        FAKE_LEARNER_NAMES[index % FAKE_LEARNER_NAMES.length] ?? 'ผู้เรียน Lifelong';
      const offsetMinutes = Math.round(20 + random() * 240) * (index + 1);
      const registeredAt = new Date(baseDate.getTime() - offsetMinutes * 60 * 1000);
      const mode = course.deliveryModes[0] ?? 'Online';
      const channel: RecentRegistration['channel'] =
        mode === 'Onsite' ? 'onsite' : mode === 'Self-Paced Learning' ? 'self-paced' : 'online';

      const initial = learnerName.split(' ')[0]?.charAt(0) ?? 'L';

      return {
        id: `${course.id}-${index}`,
        learnerName,
        learnerInitial: initial,
        courseTitle: course.title,
        courseCode: course.code,
        category: course.category,
        amount: course.isFree ? 0 : course.price,
        isFree: course.isFree,
        registeredAt: registeredAt.toISOString(),
        channel,
      };
    });
  });

  const totals = computed(() => {
    const fillRates = courses.value.map(calculateFillRate);
    const averageFillRate =
      fillRates.length === 0
        ? 0
        : fillRates.reduce((sum, rate) => sum + rate, 0) / fillRates.length;
    const totalViews = courses.value.reduce((sum, course) => sum + course.views, 0);

    return {
      courses: courses.value.length,
      activeCourses: courses.value.filter((course) => course.isActive).length,
      categories: categoryStore.categories.length,
      enrolledLearners: totalEnrolled.value,
      totalSeats: totalSeats.value,
      totalRevenue: totalRevenue.value,
      totalViews,
      averageFillRate,
    };
  });

  const kpis = computed<DashboardKpi[]>(() => {
    const series = revenueSeries.value;
    const tail = series.revenue.slice(-3);
    const enrollTail = series.enrollments.slice(-3);

    function deltaFromArray(values: number[]): number {
      if (values.length < 2) return 0;
      const first = values[0] ?? 0;
      const last = values[values.length - 1] ?? 0;
      if (first === 0) return last > 0 ? 100 : 0;
      return ((last - first) / first) * 100;
    }

    const revenueDelta = deltaFromArray(tail);
    const enrollDelta = deltaFromArray(enrollTail);

    return [
      {
        id: 'revenue',
        label: 'รายได้รวม (6 เดือน)',
        value: formatCompactCurrency(series.totalRevenue),
        delta: revenueDelta,
        deltaLabel: `${revenueDelta >= 0 ? '+' : ''}${revenueDelta.toFixed(1)}% จากไตรมาสก่อน`,
        description: 'รวมรายได้จากคอร์สแบบเสียค่าใช้จ่าย',
        icon: 'payments',
        tone: 'gold',
        trend: series.revenue,
      },
      {
        id: 'enrollments',
        label: 'ผู้ลงทะเบียนสะสม',
        value: formatCount(totals.value.enrolledLearners),
        delta: enrollDelta,
        deltaLabel: `${enrollDelta >= 0 ? '+' : ''}${enrollDelta.toFixed(1)}% เทียบเดือนก่อน`,
        description: `จาก ${formatCount(totals.value.courses)} รายวิชา`,
        icon: 'groups',
        tone: 'navy',
        trend: series.enrollments,
      },
      {
        id: 'fill-rate',
        label: 'อัตราที่นั่งถูกจอง',
        value: `${Math.round(totals.value.averageFillRate * 100)}%`,
        delta: totals.value.averageFillRate * 100 - 60,
        deltaLabel: `เป้าหมาย 60% — ${
          totals.value.averageFillRate * 100 >= 60 ? 'ทำได้ตามเป้า' : 'ต่ำกว่าเป้าเล็กน้อย'
        }`,
        description: `${formatCount(totalSeats.value)} ที่นั่งทั้งหมด`,
        icon: 'event_seat',
        tone: 'teal',
        trend: series.enrollments.map((value) =>
          totalSeats.value === 0 ? 0 : value / Math.max(totalSeats.value / 6, 1),
        ),
      },
      {
        id: 'courses',
        label: 'รายวิชาที่กำลังเปิดรับ',
        value: formatCount(totals.value.activeCourses),
        delta: (totals.value.activeCourses / Math.max(totals.value.courses, 1) - 0.5) * 100,
        deltaLabel: `${formatCount(totals.value.categories)} หมวดหมู่ในระบบ`,
        description: 'จำนวนคอร์สสถานะ "เปิดรับสมัคร"',
        icon: 'auto_stories',
        tone: 'rose',
        trend: series.revenue.map((value) => Math.round(value / 1000)),
      },
    ];
  });

  return {
    kpis,
    revenueSeries,
    categoryUsage,
    deliveryBreakdown,
    topCourses,
    facultyShare,
    recentRegistrations,
    totals,
  };
}
