import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminDashboardMonthlySeriesDto,
  AdminDashboardResponseDto,
  AdminDashboardTotalsDto,
} from './dto/admin-dashboard-response.dto';

interface TotalsRow {
  totalCourses: number | string | null;
  activeCourses: number | string | null;
  certificateCourses: number | string | null;
  creditCourses: number | string | null;
  publicGeneralCourses: number | string | null;
  unspecifiedTypeCourses: number | string | null;
  instructorCount: number | string | null;
  facultyCount: number | string | null;
  totalOpenClasses: number | string | null;
  publicOpenClasses: number | string | null;
  registrationOpenClasses: number | string | null;
  distinctLearners: number | string | null;
  totalEnrollments: number | string | null;
  paidEnrollments: number | string | null;
  freeEnrollments: number | string | null;
  totalRevenue: number | string | null;
  paymentRecords: number | string | null;
  paymentAmount: number | string | null;
  totalClicks: number | string | null;
}

interface MonthlySeriesRow {
  monthKey: string | null;
  enrollments: number | string | null;
  paidEnrollments: number | string | null;
  distinctLearners: number | string | null;
  revenue: number | string | null;
  openClasses: number | string | null;
  clicks: number | string | null;
}

interface BreakdownRow {
  id: string | number | null;
  label: string | null;
  value: number | string | null;
}

interface CategoryPerformanceRow {
  id: string | number | null;
  label: string | null;
  courseCount: number | string | null;
  enrollmentCount: number | string | null;
  revenue: number | string | null;
}

interface FacultyPerformanceRow {
  id: string | number | null;
  label: string | null;
  courseCount: number | string | null;
  enrollmentCount: number | string | null;
  revenue: number | string | null;
}

interface TopCourseRow {
  courseId: number | string | null;
  courseCode: string | null;
  courseTitle: string | null;
  facultyName: string | null;
  categoryName: string | null;
  enrollmentCount: number | string | null;
  paidEnrollmentCount: number | string | null;
  revenue: number | string | null;
  openClassAmount: number | string | null;
  publicFlag: string | null;
}

interface RecentEnrollmentRow {
  enrollId: number | string | null;
  enrolledAt: Date | string | null;
  learnerFirstName: string | null;
  learnerLastName: string | null;
  learnerEmail: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  amount: number | string | null;
  payStatus: string | null;
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
  | 'allTime'
  | 'custom';

interface PeriodConfig {
  dateFormat: string;
  seriesCount: number;
  startDate: string;
  endDate: string;
  label: string;
}

function dmyToIso(value?: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const [day, month, year] = trimmed.split('/');
  if (day && month && year) {
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return null;
}

function monthsBetween(startIso: string, endIso: string): number {
  const [sy, sm] = startIso.split('-').map(Number);
  const [ey, em] = endIso.split('-').map(Number);
  if (!sy || !sm || !ey || !em) return 1;
  return (ey - sy) * 12 + (em - sm) + 1;
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  private getPeriodConfig(period: DashboardPeriod, year: number, month?: number): PeriodConfig {
    const now = new Date();
    const currentYear = now.getFullYear();
    const y = year || currentYear;
    const pad = (n: number): string => String(n).padStart(2, '0');
    const fmt = (d: Date): string =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const thShort = (d: Date): string => d.toLocaleDateString('th-TH', { month: 'short' });
    const be = (ce: number): number => ce + 543;

    if (period === 'month') {
      const m = month && month >= 1 && month <= 12 ? month : now.getMonth() + 1;
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      const monthName = start.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
      return {
        dateFormat: '%Y-%m',
        seriesCount: 1,
        startDate: fmt(start),
        endDate: fmt(end),
        label: monthName,
      };
    }

    const quarterMap: Record<string, { months: number[]; label: string }> = {
      q1: { months: [0, 1, 2], label: `ไตรมาส 1 ปี ${be(y)} (ม.ค.–มี.ค.)` },
      q2: { months: [3, 4, 5], label: `ไตรมาส 2 ปี ${be(y)} (เม.ย.–มิ.ย.)` },
      q3: { months: [6, 7, 8], label: `ไตรมาส 3 ปี ${be(y)} (ก.ค.–ก.ย.)` },
      q4: { months: [9, 10, 11], label: `ไตรมาส 4 ปี ${be(y)} (ต.ค.–ธ.ค.)` },
    };

    if (period in quarterMap) {
      const q = quarterMap[period];
      const firstMonth = q.months[0];
      const lastMonth = q.months[2];
      const start = new Date(y, firstMonth, 1);
      const end = new Date(y, lastMonth + 1, 0);
      return {
        dateFormat: '%Y-%m',
        seriesCount: 3,
        startDate: fmt(start),
        endDate: fmt(end),
        label: q.label,
      };
    }

    if (period === 'h1') {
      return {
        dateFormat: '%Y-%m',
        seriesCount: 6,
        startDate: `${y}-01-01`,
        endDate: `${y}-06-30`,
        label: `ครึ่งปีแรก ปี ${be(y)} (ม.ค.–มิ.ย.)`,
      };
    }

    if (period === 'h2') {
      return {
        dateFormat: '%Y-%m',
        seriesCount: 6,
        startDate: `${y}-07-01`,
        endDate: `${y}-12-31`,
        label: `ครึ่งปีหลัง ปี ${be(y)} (ก.ค.–ธ.ค.)`,
      };
    }

    if (period === 'year') {
      return {
        dateFormat: '%Y-%m',
        seriesCount: 12,
        startDate: `${y}-01-01`,
        endDate: `${y}-12-31`,
        label: `ทั้งปี ${be(y)}`,
      };
    }

    if (period === 'yearly') {
      const startYear = currentYear - 4;
      return {
        dateFormat: '%Y',
        seriesCount: 5,
        startDate: `${startYear}-01-01`,
        endDate: fmt(new Date(currentYear, 11, 31)),
        label: `รายปี (${be(startYear)}–${be(currentYear)})`,
      };
    }

    if (period === 'allTime') {
      // placeholder — overridden by getDashboard with real min date from DB
      return {
        dateFormat: '%Y',
        seriesCount: 1,
        startDate: '2000-01-01',
        endDate: fmt(new Date(currentYear, 11, 31)),
        label: 'ข้อมูลทั้งหมด',
      };
    }

    // rolling12 (default) — last 12 months from today
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      dateFormat: '%Y-%m',
      seriesCount: 12,
      startDate: fmt(start),
      endDate: fmt(endOfMonth),
      label: `12 เดือนย้อนหลัง (${thShort(start)} ${be(start.getFullYear())} – ${thShort(now)} ${be(now.getFullYear())})`,
    };
  }

  async getDashboard(
    period: DashboardPeriod = 'rolling12',
    year?: number,
    month?: number,
    dateFrom?: string,
    dateTo?: string,
  ): Promise<AdminDashboardResponseDto> {
    let cfg = this.getPeriodConfig(period, year ?? new Date().getFullYear(), month);

    // custom: use the explicit DD/MM/YYYY range supplied by the client (monthly series)
    if (period === 'custom') {
      const start = dmyToIso(dateFrom);
      const end = dmyToIso(dateTo);
      if (start && end) {
        cfg = {
          dateFormat: '%Y-%m',
          seriesCount: Math.max(monthsBetween(start, end), 1),
          startDate: start,
          endDate: end,
          label: `${dateFrom} - ${dateTo}`,
        };
      }
    }

    // allTime: query actual min/max date from DB
    if (period === 'allTime') {
      const pad = (n: number): string => String(n).padStart(2, '0');
      const fmt = (d: Date): string =>
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const [minRow] = await this.dataSource.query<{ minYear: number | null }[]>(
        `SELECT YEAR(MIN(ENROLL_DATE)) AS minYear FROM LLTENROLL WHERE ENROLL_DATE IS NOT NULL`,
      );
      const currentYear = new Date().getFullYear();
      const startYear = minRow?.minYear ?? currentYear;
      const seriesCount = Math.max(currentYear - startYear + 1, 1);
      cfg = {
        dateFormat: '%Y',
        seriesCount,
        startDate: `${startYear}-01-01`,
        endDate: fmt(new Date(currentYear, 11, 31)),
        label: `ข้อมูลทั้งหมด (${startYear + 543}–${currentYear + 543})`,
      };
    }
    const [
      totalsRows,
      monthlyRows,
      enrollmentBreakdownRows,
      categoryRows,
      facultyRows,
      topCourseRows,
      recentEnrollmentRows,
      availableYearsRows,
    ] = await Promise.all([
      this.dataSource.query<TotalsRow[]>(
        `
        SELECT
          (SELECT COUNT(*) FROM LLTCOURSE) AS totalCourses,
          (SELECT COUNT(*) FROM LLTCOURSE WHERE COSE_STATUS = 'Y') AS activeCourses,
          (SELECT COUNT(*) FROM LLTCOURSE WHERE TYPECOSE_ID = 1) AS certificateCourses,
          (SELECT COUNT(*) FROM LLTCOURSE WHERE TYPECOSE_ID = 2) AS creditCourses,
          (SELECT COUNT(*) FROM LLTCOURSE WHERE TYPECOSE_ID = 3) AS publicGeneralCourses,
          (SELECT COUNT(*) FROM LLTCOURSE WHERE TYPECOSE_ID IS NULL) AS unspecifiedTypeCourses,
          (
            SELECT COUNT(DISTINCT COALESCE(NULLIF(PSN_ID, ''), CONCAT('EMAIL:', COALESCE(NULLIF(COSEINS_EMAIL, ''), CONCAT('ROW-', COSEINS_ID)))))
            FROM LLTCOURSEINS
          ) AS instructorCount,
          (SELECT COUNT(*) FROM LLTFACULTY) AS facultyCount,
          (SELECT COUNT(*) FROM LLTOPENCLASS) AS totalOpenClasses,
          (SELECT COUNT(*) FROM LLTOPENCLASS WHERE OPENCLASS_PUBLIC = 'Y') AS publicOpenClasses,
          (
            SELECT COUNT(*) FROM LLTOPENCLASS
            WHERE OPENCLASS_PUBLIC = 'Y'
              AND (OPENCLASS_REGSTARTDATE IS NULL OR OPENCLASS_REGSTARTDATE <= CURDATE())
              AND (OPENCLASS_REGENDDATE IS NULL OR OPENCLASS_REGENDDATE >= CURDATE())
          ) AS registrationOpenClasses,
          (SELECT COUNT(DISTINCT USER_ID) FROM LLTENROLL WHERE USER_ID IS NOT NULL AND ENROLL_DATE BETWEEN ? AND ?) AS distinctLearners,
          (SELECT COUNT(*) FROM LLTENROLL WHERE ENROLL_DATE BETWEEN ? AND ?) AS totalEnrollments,
          (SELECT COUNT(*) FROM LLTENROLL WHERE ENROLL_PAYSTATUS = 'Y' AND ENROLL_DATE BETWEEN ? AND ?) AS paidEnrollments,
          (SELECT COUNT(*) FROM LLTENROLL WHERE COALESCE(ENROLL_PAYSTATUS,'') <> 'Y' AND ENROLL_DATE BETWEEN ? AND ?) AS freeEnrollments,
          (SELECT COALESCE(SUM(COALESCE(ENROLL_AMOUNT,0)),0) FROM LLTENROLL WHERE ENROLL_PAYSTATUS = 'Y' AND ENROLL_DATE BETWEEN ? AND ?) AS totalRevenue,
          (SELECT COUNT(*) FROM LLTPAYMENT) AS paymentRecords,
          (SELECT COALESCE(SUM(COALESCE(PAY_AMOUNT,0)),0) FROM LLTPAYMENT) AS paymentAmount,
          (SELECT COUNT(*) FROM LLTOPENCLASSCLICK WHERE CREATEDATE BETWEEN ? AND ?) AS totalClicks
      `,
        [
          cfg.startDate,
          cfg.endDate,
          cfg.startDate,
          cfg.endDate,
          cfg.startDate,
          cfg.endDate,
          cfg.startDate,
          cfg.endDate,
          cfg.startDate,
          cfg.endDate,
          cfg.startDate,
          cfg.endDate,
        ],
      ),
      this.dataSource.query<MonthlySeriesRow[]>(
        `
        SELECT
          periodKey AS monthKey,
          SUM(enrollments) AS enrollments,
          SUM(paidEnrollments) AS paidEnrollments,
          SUM(distinctLearners) AS distinctLearners,
          SUM(revenue) AS revenue,
          SUM(openClasses) AS openClasses,
          SUM(clicks) AS clicks
        FROM (
          SELECT
            DATE_FORMAT(ENROLL_DATE, ?) AS periodKey,
            COUNT(*) AS enrollments,
            SUM(CASE WHEN ENROLL_PAYSTATUS = 'Y' THEN 1 ELSE 0 END) AS paidEnrollments,
            COUNT(DISTINCT USER_ID) AS distinctLearners,
            SUM(COALESCE(ENROLL_AMOUNT, 0)) AS revenue,
            0 AS openClasses,
            0 AS clicks
          FROM LLTENROLL
          WHERE ENROLL_DATE BETWEEN ? AND ?
          GROUP BY DATE_FORMAT(ENROLL_DATE, ?)

          UNION ALL

          SELECT
            DATE_FORMAT(OPENCLASS_REGSTARTDATE, ?) AS periodKey,
            0, 0, 0, 0,
            COUNT(*) AS openClasses,
            0 AS clicks
          FROM LLTOPENCLASS
          WHERE OPENCLASS_REGSTARTDATE BETWEEN ? AND ?
          GROUP BY DATE_FORMAT(OPENCLASS_REGSTARTDATE, ?)

          UNION ALL

          SELECT
            DATE_FORMAT(CREATEDATE, ?) AS periodKey,
            0, 0, 0, 0, 0,
            COUNT(*) AS clicks
          FROM LLTOPENCLASSCLICK
          WHERE CREATEDATE BETWEEN ? AND ?
          GROUP BY DATE_FORMAT(CREATEDATE, ?)
        ) AS aggregated
        WHERE periodKey IS NOT NULL
        GROUP BY periodKey
        ORDER BY periodKey ASC
      `,
        [
          cfg.dateFormat,
          cfg.startDate,
          cfg.endDate,
          cfg.dateFormat,
          cfg.dateFormat,
          cfg.startDate,
          cfg.endDate,
          cfg.dateFormat,
          cfg.dateFormat,
          cfg.startDate,
          cfg.endDate,
          cfg.dateFormat,
        ],
      ),
      this.dataSource.query<BreakdownRow[]>(
        `
        SELECT
          CASE WHEN ENROLL_PAYSTATUS = 'Y' THEN 'paid' ELSE 'free' END AS id,
          CASE WHEN ENROLL_PAYSTATUS = 'Y' THEN 'ชำระเงิน' ELSE 'ลงทะเบียนฟรี' END AS label,
          COUNT(*) AS value
        FROM LLTENROLL
        WHERE ENROLL_DATE BETWEEN ? AND ?
        GROUP BY CASE WHEN ENROLL_PAYSTATUS = 'Y' THEN 'paid' ELSE 'free' END
        ORDER BY value DESC
      `,
        [cfg.startDate, cfg.endDate],
      ),
      this.dataSource.query<CategoryPerformanceRow[]>(
        `
        SELECT
          COALESCE(cat.CATEGORY_ID, 0) AS id,
          COALESCE(cat.CATEGORY_NAME, 'ไม่ระบุหมวดหมู่') AS label,
          COUNT(DISTINCT c.COSE_ID) AS courseCount,
          COUNT(e.ENROLL_ID) AS enrollmentCount,
          COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS revenue
        FROM LLTCOURSE c
        LEFT JOIN LLTCATEGORY cat ON cat.CATEGORY_ID = c.CATEGORY_ID
        LEFT JOIN LLTENROLL e ON e.COSE_ID = c.COSE_ID AND e.ENROLL_DATE BETWEEN ? AND ?
        GROUP BY COALESCE(cat.CATEGORY_ID, 0), COALESCE(cat.CATEGORY_NAME, 'ไม่ระบุหมวดหมู่')
        HAVING COUNT(DISTINCT c.COSE_ID) > 0
        ORDER BY enrollmentCount DESC, revenue DESC, courseCount DESC
        LIMIT 6
      `,
        [cfg.startDate, cfg.endDate],
      ),
      this.dataSource.query<FacultyPerformanceRow[]>(
        `
        SELECT
          COALESCE(f.FAC_ID, 0) AS id,
          COALESCE(f.FAC_NAME, 'ไม่ระบุคณะ') AS label,
          COUNT(DISTINCT c.COSE_ID) AS courseCount,
          COUNT(e.ENROLL_ID) AS enrollmentCount,
          COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS revenue
        FROM LLTCOURSE c
        LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
        LEFT JOIN LLTENROLL e ON e.COSE_ID = c.COSE_ID AND e.ENROLL_DATE BETWEEN ? AND ?
        GROUP BY COALESCE(f.FAC_ID, 0), COALESCE(f.FAC_NAME, 'ไม่ระบุคณะ')
        HAVING COUNT(DISTINCT c.COSE_ID) > 0
        ORDER BY enrollmentCount DESC, revenue DESC, courseCount DESC
        LIMIT 6
      `,
        [cfg.startDate, cfg.endDate],
      ),
      this.dataSource.query<TopCourseRow[]>(
        `
        SELECT
          c.COSE_ID AS courseId,
          c.COSE_CODE AS courseCode,
          c.COSE_NAMETH AS courseTitle,
          COALESCE(f.FAC_NAME, 'ไม่ระบุคณะ') AS facultyName,
          COALESCE(cat.CATEGORY_NAME, 'ไม่ระบุหมวดหมู่') AS categoryName,
          COUNT(e.ENROLL_ID) AS enrollmentCount,
          SUM(CASE WHEN e.ENROLL_PAYSTATUS = 'Y' THEN 1 ELSE 0 END) AS paidEnrollmentCount,
          COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS revenue,
          COALESCE(MAX(COALESCE(oc.OPENCLASS_AMOUNT, 0)), 0) AS openClassAmount,
          MAX(oc.OPENCLASS_PUBLIC) AS publicFlag
        FROM LLTCOURSE c
        LEFT JOIN LLTENROLL e ON e.COSE_ID = c.COSE_ID AND e.ENROLL_DATE BETWEEN ? AND ?
        LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = e.OPENCLASS_ID
        LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
        LEFT JOIN LLTCATEGORY cat ON cat.CATEGORY_ID = c.CATEGORY_ID
        GROUP BY c.COSE_ID, c.COSE_CODE, c.COSE_NAMETH,
          COALESCE(f.FAC_NAME,'ไม่ระบุคณะ'), COALESCE(cat.CATEGORY_NAME,'ไม่ระบุหมวดหมู่')
        HAVING COUNT(e.ENROLL_ID) > 0
        ORDER BY revenue DESC, enrollmentCount DESC, courseId ASC
        LIMIT 6
      `,
        [cfg.startDate, cfg.endDate],
      ),
      this.dataSource.query<RecentEnrollmentRow[]>(
        `
        SELECT
          e.ENROLL_ID AS enrollId,
          COALESCE(e.UPDATEDATE, e.CREATEDATE, e.ENROLL_DATE) AS enrolledAt,
          u.USER_FNAMETH AS learnerFirstName,
          u.USER_LNAMETH AS learnerLastName,
          u.USER_EMAIL AS learnerEmail,
          c.COSE_CODE AS courseCode,
          c.COSE_NAMETH AS courseTitle,
          COALESCE(e.ENROLL_AMOUNT, 0) AS amount,
          CASE
            WHEN e.ENROLL_PAYSTATUS = 'Y' THEN 'paid'
            WHEN COALESCE(e.ENROLL_AMOUNT, 0) > 0 THEN 'pending'
            ELSE 'free'
          END AS payStatus
        FROM LLTENROLL e
        LEFT JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
        WHERE e.ENROLL_DATE BETWEEN ? AND ?
        ORDER BY COALESCE(e.UPDATEDATE, e.CREATEDATE, e.ENROLL_DATE) DESC, e.ENROLL_ID DESC
        LIMIT 10
      `,
        [cfg.startDate, cfg.endDate],
      ),
      this.dataSource.query<{ minYear: number | null; maxYear: number | null }[]>(
        `SELECT YEAR(MIN(ENROLL_DATE)) AS minYear, YEAR(MAX(ENROLL_DATE)) AS maxYear
         FROM LLTENROLL
         WHERE ENROLL_DATE IS NOT NULL`,
      ),
    ]);

    const currentYear = new Date().getFullYear();
    const minYear = Number(availableYearsRows[0]?.minYear ?? currentYear);
    const maxYear = Math.min(Number(availableYearsRows[0]?.maxYear ?? currentYear), currentYear);
    const availableYears = Array.from(
      { length: Math.max(maxYear - minYear + 1, 1) },
      (_, i) => minYear + i,
    );

    const totals = this.mapTotals(totalsRows[0]);
    const monthlySeries = this.buildMonthlySeries(monthlyRows, cfg);

    return {
      generatedAt: new Date().toISOString(),
      period,
      periodLabel: cfg.label,
      availableYears,
      totals,
      monthlySeries,
      enrollmentBreakdown: enrollmentBreakdownRows.map((row) => ({
        id: String(row.id ?? 'unknown'),
        label: row.label?.trim() || 'ไม่ระบุ',
        value: this.toNumber(row.value),
      })),
      categoryPerformance: categoryRows.map((row) => ({
        id: String(row.id ?? '0'),
        label: row.label?.trim() || 'ไม่ระบุหมวดหมู่',
        courseCount: this.toNumber(row.courseCount),
        enrollmentCount: this.toNumber(row.enrollmentCount),
        revenue: this.toNumber(row.revenue),
      })),
      facultyPerformance: facultyRows.map((row) => ({
        id: String(row.id ?? '0'),
        label: row.label?.trim() || 'ไม่ระบุคณะ',
        courseCount: this.toNumber(row.courseCount),
        enrollmentCount: this.toNumber(row.enrollmentCount),
        revenue: this.toNumber(row.revenue),
      })),
      topCourses: topCourseRows.map((row) => ({
        courseId: this.toNumber(row.courseId),
        courseCode: row.courseCode?.trim() || '-',
        courseTitle: row.courseTitle?.trim() || 'ไม่ระบุชื่อคอร์ส',
        facultyName: row.facultyName?.trim() || 'ไม่ระบุคณะ',
        categoryName: row.categoryName?.trim() || 'ไม่ระบุหมวดหมู่',
        enrollmentCount: this.toNumber(row.enrollmentCount),
        paidEnrollmentCount: this.toNumber(row.paidEnrollmentCount),
        revenue: this.toNumber(row.revenue),
        openClassAmount: this.toNumber(row.openClassAmount),
        publicFlag: row.publicFlag,
      })),
      recentEnrollments: recentEnrollmentRows.map((row) => ({
        enrollId: this.toNumber(row.enrollId),
        enrolledAt: this.toIsoString(row.enrolledAt),
        learnerName: this.buildLearnerName(row.learnerFirstName, row.learnerLastName),
        learnerEmail: row.learnerEmail?.trim() || null,
        courseCode: row.courseCode?.trim() || '-',
        courseTitle: row.courseTitle?.trim() || 'ไม่ระบุชื่อคอร์ส',
        amount: this.toNumber(row.amount),
        payStatus: this.normalizePayStatus(row.payStatus),
      })),
    };
  }

  private mapTotals(row: TotalsRow | undefined): AdminDashboardTotalsDto {
    return {
      totalCourses: this.toNumber(row?.totalCourses),
      activeCourses: this.toNumber(row?.activeCourses),
      certificateCourses: this.toNumber(row?.certificateCourses),
      creditCourses: this.toNumber(row?.creditCourses),
      publicGeneralCourses: this.toNumber(row?.publicGeneralCourses),
      unspecifiedTypeCourses: this.toNumber(row?.unspecifiedTypeCourses),
      instructorCount: this.toNumber(row?.instructorCount),
      facultyCount: this.toNumber(row?.facultyCount),
      totalOpenClasses: this.toNumber(row?.totalOpenClasses),
      publicOpenClasses: this.toNumber(row?.publicOpenClasses),
      registrationOpenClasses: this.toNumber(row?.registrationOpenClasses),
      distinctLearners: this.toNumber(row?.distinctLearners),
      totalEnrollments: this.toNumber(row?.totalEnrollments),
      paidEnrollments: this.toNumber(row?.paidEnrollments),
      freeEnrollments: this.toNumber(row?.freeEnrollments),
      totalRevenue: this.toNumber(row?.totalRevenue),
      paymentRecords: this.toNumber(row?.paymentRecords),
      paymentAmount: this.toNumber(row?.paymentAmount),
      totalClicks: this.toNumber(row?.totalClicks),
    };
  }

  private buildMonthlySeries(
    rows: MonthlySeriesRow[],
    cfg: PeriodConfig,
  ): AdminDashboardMonthlySeriesDto[] {
    const rowMap = new Map(
      rows
        .filter((r) => r.monthKey)
        .map((r) => [
          r.monthKey as string,
          {
            monthKey: r.monthKey as string,
            enrollments: this.toNumber(r.enrollments),
            paidEnrollments: this.toNumber(r.paidEnrollments),
            distinctLearners: this.toNumber(r.distinctLearners),
            revenue: this.toNumber(r.revenue),
            openClasses: this.toNumber(r.openClasses),
            clicks: this.toNumber(r.clicks),
          },
        ]),
    );

    const keys = this.buildPeriodKeys(cfg);
    return keys.map((key) => {
      const row = rowMap.get(key);
      return {
        monthKey: key,
        enrollments: row?.enrollments ?? 0,
        paidEnrollments: row?.paidEnrollments ?? 0,
        distinctLearners: row?.distinctLearners ?? 0,
        revenue: row?.revenue ?? 0,
        openClasses: row?.openClasses ?? 0,
        clicks: row?.clicks ?? 0,
      };
    });
  }

  private buildPeriodKeys(cfg: PeriodConfig): string[] {
    if (cfg.dateFormat === '%Y') {
      // yearly — build from startDate year
      const startYear = Number(cfg.startDate.substring(0, 4));
      return Array.from({ length: cfg.seriesCount }, (_, i) => String(startYear + i));
    }

    // monthly — build from startDate month
    const [startYearStr, startMonthStr] = cfg.startDate.split('-');
    const startYear = Number(startYearStr);
    const startMonth = Number(startMonthStr) - 1; // 0-indexed

    return Array.from({ length: cfg.seriesCount }, (_, i) => {
      const d = new Date(startYear, startMonth + i, 1);
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${d.getFullYear()}-${m}`;
    });
  }

  private buildLearnerName(firstName: string | null, lastName: string | null): string {
    const parts = [firstName?.trim(), lastName?.trim()].filter((value): value is string =>
      Boolean(value),
    );

    return parts.join(' ') || 'ไม่ระบุผู้เรียน';
  }

  private normalizePayStatus(value: string | null): 'paid' | 'free' | 'pending' {
    if (value === 'paid' || value === 'free' || value === 'pending') {
      return value;
    }

    return 'free';
  }

  private toIsoString(value: Date | string | null): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  private toMonthKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private toNumber(value: number | string | null | undefined): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }
}
