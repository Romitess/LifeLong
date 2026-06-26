import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LltenrollQueryDto } from './dto/lltenroll-query.dto';
import { LltenrollItemDto, LltenrollResponseDto } from './dto/lltenroll-response.dto';
import { EnrollCourseDto } from './dto/enroll-course.dto';

interface LltenrollRow {
  enrollId: number | string | null;
  userId: number | string | null;
  courseId: number | string | null;
  enrollRef1: string | null;
  enrollRef2: string | null;
  studentCode: string | null;
  userCode: string | null;
  learnerFirstName: string | null;
  learnerLastName: string | null;
  learnerFirstNameEn: string | null;
  learnerLastNameEn: string | null;
  receiptName: string | null;
  amount: number | string | null;
  payStatus: string | null;
  contact: string | null;
  courseCode: string | null;
  courseName: string | null;
  facultyName: string | null;
  enrollDate: Date | string | null;
  payDate: Date | string | null;
  notifyDate: Date | string | null;
  receiptIssued: number | string | null;
}

interface CountRow {
  total: number | string | null;
}

@Injectable()
export class LltenrollService {
  constructor(private readonly dataSource: DataSource) {}

  async updateEnrollReceiptInfo(
    enrollId: number,
    info: Pick<EnrollCourseDto, 'citizen' | 'nameReceipt' | 'address' | 'telephone'>,
  ): Promise<void> {
    const receiptInfo = {
      citizen: this.cleanOptional(info.citizen),
      nameReceipt: this.cleanOptional(info.nameReceipt),
      address: this.cleanOptional(info.address),
      telephone: this.cleanOptional(info.telephone),
    };

    if (!Object.values(receiptInfo).some((value) => value !== null)) {
      return;
    }

    await this.dataSource.query(
      `
        UPDATE LLTENROLL
        SET
          ENROLL_CITIZEN = COALESCE(?, ENROLL_CITIZEN),
          ENROLL_NAMERECEIPT = COALESCE(?, ENROLL_NAMERECEIPT),
          ENROLL_ADDRESS = COALESCE(?, ENROLL_ADDRESS),
          ENROLL_TELEPHONE = COALESCE(?, ENROLL_TELEPHONE),
          UPDATEDATE = NOW(),
          UPDATEPROG = 'lltenroll'
        WHERE ENROLL_ID = ?
      `,
      [
        receiptInfo.citizen,
        receiptInfo.nameReceipt,
        receiptInfo.address,
        receiptInfo.telephone,
        enrollId,
      ],
    );
  }

  async findAll(
    query: LltenrollQueryDto,
    facCode?: number | string | null,
    authUserId?: number | null,
  ): Promise<LltenrollResponseDto> {
    let resolvedFacCode = facCode;
    if (
      (resolvedFacCode === undefined ||
        resolvedFacCode === null ||
        String(resolvedFacCode).trim() === '') &&
      authUserId
    ) {
      const queryResult: unknown = await this.dataSource.query(
        'SELECT FAC_ID AS facId FROM LLT_AUTH_USERS WHERE USER_ID = ?',
        [authUserId],
      );
      if (Array.isArray(queryResult) && queryResult.length > 0) {
        const first: unknown = (queryResult as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first)) {
          const authUser = first as { facId?: number; FAC_ID?: number };
          resolvedFacCode = authUser.facId ?? authUser.FAC_ID;
        }
      }
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 100;
    const offset = (page - 1) * pageSize;
    const { whereSql, params } = this.buildWhere(query, resolvedFacCode);

    const countRows = await this.dataSource.query<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM LLTENROLL e
        LEFT JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
        ${whereSql}
      `,
      params,
    );

    const rows = await this.dataSource.query<LltenrollRow[]>(
      `
        SELECT
          e.ENROLL_ID AS enrollId,
          e.USER_ID AS userId,
          e.COSE_ID AS courseId,
          e.ENROLL_REF1 AS enrollRef1,
          e.ENROLL_REF2 AS enrollRef2,
          u.STUDENTCODE AS studentCode,
          u.USER_CODE AS userCode,
          u.USER_FNAMETH AS learnerFirstName,
          u.USER_LNAMETH AS learnerLastName,
          u.USER_FNAMEEN AS learnerFirstNameEn,
          u.USER_LNAMEEN AS learnerLastNameEn,
          e.ENROLL_NAMERECEIPT AS receiptName,
          COALESCE(e.ENROLL_AMOUNT, 0) AS amount,
          e.ENROLL_PAYSTATUS AS payStatus,
          COALESCE(NULLIF(e.ENROLL_TELEPHONE, ''), NULLIF(u.USER_TEL, '')) AS contact,
          c.COSE_CODE AS courseCode,
          c.COSE_NAMETH AS courseName,
          f.FAC_NAME AS facultyName,
          e.ENROLL_DATE AS enrollDate,
          e.ENROLL_PAYDATE AS payDate,
          COALESCE(e.UPDATEDATE, e.CREATEDATE, e.ENROLL_DATE) AS notifyDate,
          EXISTS (
            SELECT 1 
            FROM LLTENROLLRECEIPT er 
            WHERE er.ENROLL_ID = e.ENROLL_ID 
              AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
          ) AS receiptIssued
        FROM LLTENROLL e
        LEFT JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
        LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
        ${whereSql}
        ORDER BY COALESCE(e.UPDATEDATE, e.CREATEDATE, e.ENROLL_DATE) DESC, e.ENROLL_ID DESC
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset],
    );

    const total = this.toNumber(countRows[0]?.total);

    return {
      generatedAt: new Date().toISOString(),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
      items: rows.map((row) => this.mapRow(row)),
    };
  }

  private buildWhere(
    query: LltenrollQueryDto,
    facCode?: number | string | null,
  ): { whereSql: string; params: unknown[] } {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (query.keyword?.trim()) {
      const keyword = `%${query.keyword.trim()}%`;
      clauses.push(`
        (
          e.ENROLL_REF1 LIKE ?
          OR e.ENROLL_REF2 LIKE ?
          OR e.ENROLL_NAMERECEIPT LIKE ?
          OR e.ENROLL_TELEPHONE LIKE ?
          OR u.STUDENTCODE LIKE ?
          OR u.USER_CODE LIKE ?
          OR u.USER_FNAMETH LIKE ?
          OR u.USER_LNAMETH LIKE ?
          OR u.USER_FNAMEEN LIKE ?
          OR u.USER_LNAMEEN LIKE ?
          OR u.USER_TEL LIKE ?
          OR c.COSE_CODE LIKE ?
          OR c.COSE_NAMETH LIKE ?
        )
      `);
      params.push(
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
        keyword,
      );
    }

    if (query.status === 'Paid') {
      clauses.push(`e.ENROLL_PAYSTATUS = 'Y'`);
    } else if (query.status === 'Pending') {
      clauses.push(`COALESCE(e.ENROLL_PAYSTATUS, '') <> 'Y'`);
    }

    if (query.notifyOnly) {
      clauses.push(`COALESCE(e.ENROLL_AMOUNT, 0) > 0`);
      clauses.push(`
        (
          NULLIF(LTRIM(RTRIM(COALESCE(e.ENROLL_NAMERECEIPT, ''))), '') IS NOT NULL
          OR NULLIF(LTRIM(RTRIM(COALESCE(e.ENROLL_CITIZEN, ''))), '') IS NOT NULL
          OR NULLIF(LTRIM(RTRIM(COALESCE(e.ENROLL_ADDRESS, ''))), '') IS NOT NULL
          OR NULLIF(LTRIM(RTRIM(COALESCE(e.ENROLL_TELEPHONE, ''))), '') IS NOT NULL
        )
      `);
      if (!query.receiptStatus) {
        clauses.push(`
          NOT EXISTS (
            SELECT 1
            FROM LLTENROLLRECEIPT er
            WHERE er.ENROLL_ID = e.ENROLL_ID
              AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
          )
        `);
      }
    }

    if (query.receiptStatus === 'Issued') {
      clauses.push(`
        EXISTS (
          SELECT 1
          FROM LLTENROLLRECEIPT er
          WHERE er.ENROLL_ID = e.ENROLL_ID
            AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
        )
      `);
    } else if (query.receiptStatus === 'NotIssued') {
      clauses.push(`
        NOT EXISTS (
          SELECT 1
          FROM LLTENROLLRECEIPT er
          WHERE er.ENROLL_ID = e.ENROLL_ID
            AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
        )
      `);
    }

    const resolvedFacId = query.facId ?? facCode;
    if (
      resolvedFacId !== undefined &&
      resolvedFacId !== null &&
      String(resolvedFacId).trim() !== ''
    ) {
      clauses.push(`c.FAC_ID = ?`);
      params.push(Number(resolvedFacId));
    }

    const dateFrom = this.formatLocalDate(this.parseDdMmYyyy(query.dateFrom, false));
    if (dateFrom) {
      clauses.push(`COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE) >= ?`);
      params.push(`${dateFrom} 00:00:00`);
    }

    const dateTo = this.formatLocalDate(this.parseDdMmYyyy(query.dateTo, true));
    if (dateTo) {
      clauses.push(`COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE) <= ?`);
      params.push(`${dateTo} 23:59:59`);
    }

    return {
      whereSql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
      params,
    };
  }

  private mapRow(row: LltenrollRow): LltenrollItemDto {
    const enrollId = this.toNumber(row.enrollId);

    return {
      id: enrollId,
      enrollId,
      userId: this.toNullableNumber(row.userId),
      courseId: this.toNullableNumber(row.courseId),
      learnerRef:
        this.clean(row.enrollRef1) ||
        this.clean(row.userCode) ||
        this.clean(row.studentCode) ||
        this.toFallbackRef(row.userId),
      appRef: this.clean(row.enrollRef2) || String(enrollId),
      learnerName: this.buildLearnerName(row),
      payerName: this.clean(row.receiptName) || null,
      amount: this.toNumber(row.amount),
      courseInfo: this.buildCourseInfo(row),
      status: row.payStatus === 'Y' ? 'Paid' : 'Pending',
      contact: this.clean(row.contact) || null,
      enrollDate: this.toIsoString(row.enrollDate),
      payDate: this.toIsoString(row.payDate),
      notifyDate: this.toIsoString(row.notifyDate),
      receiptIssued: Boolean(Number(row.receiptIssued)),
    };
  }

  private buildLearnerName(row: LltenrollRow): string {
    const thaiName = [this.clean(row.learnerFirstName), this.clean(row.learnerLastName)]
      .filter(Boolean)
      .join(' ');
    const englishName = [this.clean(row.learnerFirstNameEn), this.clean(row.learnerLastNameEn)]
      .filter(Boolean)
      .join(' ');

    return thaiName || englishName || this.clean(row.receiptName) || 'ไม่ระบุผู้เรียน';
  }

  private buildCourseInfo(row: LltenrollRow): string {
    const courseCode = this.clean(row.courseCode);
    const courseName = this.clean(row.courseName);
    const facultyName = this.clean(row.facultyName);
    const courseText = [courseCode, courseName].filter(Boolean).join(' : ');

    if (courseText && facultyName) {
      return `${courseText} (${facultyName})`;
    }

    return courseText || facultyName || '-';
  }

  private clean(value: string | null | undefined): string {
    return value?.trim() ?? '';
  }

  private cleanOptional(value: string | null | undefined): string | null {
    const cleaned = value?.trim();
    return cleaned ? cleaned : null;
  }

  private toFallbackRef(value: number | string | null): string {
    const numericValue = this.toNullableNumber(value);
    return numericValue === null ? '-' : String(numericValue);
  }

  private toNullableNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private toNumber(value: number | string | null | undefined): number {
    return this.toNullableNumber(value) ?? 0;
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

  private parseDdMmYyyy(value?: string, endOfDay = false): Date | null {
    if (!value) return null;
    const [dd, mm, yyyy] = value.split('/');
    const day = Number(dd);
    const month = Number(mm);
    const year = Number(yyyy);
    if (!day || !month || !year) return null;
    const date = new Date(
      year,
      month - 1,
      day,
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
    );
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatLocalDate(value: Date | null): string | null {
    if (!value) return null;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getDashboardTrend(
    facCode?: number | string | null,
    authUserId?: number | null,
    period?: string,
    dateFromStr?: string,
    dateToStr?: string,
  ): Promise<{
    months: string[];
    enrollments: number[];
    paidEnrollments: number[];
    revenue: number[];
  }> {
    let resolvedFacCode = facCode;
    if (
      (resolvedFacCode === undefined ||
        resolvedFacCode === null ||
        String(resolvedFacCode).trim() === '') &&
      authUserId
    ) {
      const queryResult: unknown = await this.dataSource.query(
        'SELECT FAC_ID AS facId FROM LLT_AUTH_USERS WHERE USER_ID = ?',
        [authUserId],
      );
      if (Array.isArray(queryResult) && queryResult.length > 0) {
        const first: unknown = (queryResult as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first)) {
          const authUser = first as { facId?: number; FAC_ID?: number };
          resolvedFacCode = authUser.facId ?? authUser.FAC_ID;
        }
      }
    }

    // Determine the date range for the trend
    let startDate: Date;
    let endDate: Date;

    const d1 = this.parseDdMmYyyy(dateFromStr, false);
    const d2 = this.parseDdMmYyyy(dateToStr, true);

    if (period === 'custom' && d1 && d2) {
      startDate = d1;
      endDate = d2;
    } else {
      // Default (All time): Show from January to December of the current year
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const startDateStr = this.formatLocalDate(startDate);
    const endDateStr = this.formatLocalDate(endDate);

    const facClause =
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
        ? 'AND c.FAC_ID = ?'
        : '';

    const facParams =
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
        ? [Number(resolvedFacCode)]
        : [];

    const filterDateField = `COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE)`;
    const timeDateField = `TIMESTAMP(DATE(COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE)), TIME(COALESCE(e.UPDATEDATE, e.CREATEDATE, '00:00:00')))`;

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);

    let groupByFormat = `'%Y-%m'`;
    let intervalStr = 'month';

    if (diffDays <= 1) {
      groupByFormat = `'%Y-%m-%d %H:00'`;
      intervalStr = 'hour';
    } else if (diffDays <= 31) {
      groupByFormat = `'%Y-%m-%d'`;
      intervalStr = 'day';
    }

    // Query enrollments grouped by the selected format
    const rows = await this.dataSource.query<
      {
        ym: string;
        enrollments: string | number;
        paidEnrollments: string | number;
        revenue: string | number;
      }[]
    >(
      `
      SELECT
        DATE_FORMAT(${timeDateField}, ${groupByFormat}) AS ym,
        COUNT(*) AS enrollments,
        SUM(CASE WHEN e.ENROLL_PAYSTATUS = 'Y' AND COALESCE(e.ENROLL_AMOUNT, 0) > 0 THEN 1 ELSE 0 END) AS paidEnrollments,
        COALESCE(SUM(CASE WHEN e.ENROLL_PAYSTATUS = 'Y' THEN COALESCE(e.ENROLL_AMOUNT, 0) ELSE 0 END), 0) AS revenue
      FROM LLTENROLL e
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      WHERE ${filterDateField} >= ? AND ${filterDateField} <= ?
      ${facClause}
      GROUP BY ym
      ORDER BY ym ASC
      `,
      [`${startDateStr} 00:00:00`, `${endDateStr} 23:59:59`, ...facParams],
    );

    // Build a map of ym -> values
    const dataMap = new Map<
      string,
      { enrollments: number; paidEnrollments: number; revenue: number }
    >();
    for (const row of rows) {
      dataMap.set(String(row.ym), {
        enrollments: this.toNumber(row.enrollments),
        paidEnrollments: this.toNumber(row.paidEnrollments),
        revenue: this.toNumber(row.revenue),
      });
    }

    // Generate all labels in range
    const months: string[] = [];
    const enrollments: number[] = [];
    const paidEnrollments: number[] = [];
    const revenue: number[] = [];

    let cursor: Date;
    let endCursor: Date;

    if (intervalStr === 'hour') {
      cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0);
      endCursor = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        23,
        59,
        59,
      );
    } else if (intervalStr === 'day') {
      cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      endCursor = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    } else {
      cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      endCursor = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    }

    while (cursor <= endCursor) {
      let ym = '';
      if (intervalStr === 'hour') {
        ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')} ${String(cursor.getHours()).padStart(2, '0')}:00`;
      } else if (intervalStr === 'day') {
        ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      } else {
        ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      }

      const data = dataMap.get(ym) ?? { enrollments: 0, paidEnrollments: 0, revenue: 0 };

      months.push(ym);
      enrollments.push(data.enrollments);
      paidEnrollments.push(data.paidEnrollments);
      revenue.push(data.revenue);

      if (intervalStr === 'hour') {
        cursor.setHours(cursor.getHours() + 1);
      } else if (intervalStr === 'day') {
        cursor.setDate(cursor.getDate() + 1);
      } else {
        cursor.setMonth(cursor.getMonth() + 1);
      }
    }

    return { months, enrollments, paidEnrollments, revenue };
  }

  async getDashboardStats(
    facCode?: number | string | null,
    authUserId?: number | null,
    period?: string,
    dateFromStr?: string,
    dateToStr?: string,
  ): Promise<{
    todayRevenue: number;
    yesterdayRevenue: number;
    pendingReceipts: number;
    issuedReceipts: number;
    totalTransactions: number;
  }> {
    let resolvedFacCode = facCode;
    if (
      (resolvedFacCode === undefined ||
        resolvedFacCode === null ||
        String(resolvedFacCode).trim() === '') &&
      authUserId
    ) {
      const queryResult: unknown = await this.dataSource.query(
        'SELECT FAC_ID AS facId FROM LLT_AUTH_USERS WHERE USER_ID = ?',
        [authUserId],
      );
      if (Array.isArray(queryResult) && queryResult.length > 0) {
        const first: unknown = (queryResult as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first)) {
          const authUser = first as { facId?: number; FAC_ID?: number };
          resolvedFacCode = authUser.facId ?? authUser.FAC_ID;
        }
      }
    }

    const clauses: string[] = [];
    const paramsToday: unknown[] = [];
    const paramsYesterday: unknown[] = [];

    if (
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
    ) {
      clauses.push(`c.FAC_ID = ?`);
      paramsToday.push(Number(resolvedFacCode));
      paramsYesterday.push(Number(resolvedFacCode));
    }

    clauses.push(`e.ENROLL_PAYSTATUS = 'Y'`);

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

    let todayDateSql = '';
    let yesterdayDateSql = '';

    const d1 = this.parseDdMmYyyy(dateFromStr, false);
    const d2 = this.parseDdMmYyyy(dateToStr, true);
    const dateFrom = this.formatLocalDate(d1);
    const dateTo = this.formatLocalDate(d2);

    const dateField = `COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE)`;

    if (period === 'custom' && dateFrom && dateTo && d1 && d2) {
      todayDateSql = clauses.length > 0 ? ' AND ' : ' WHERE ';
      todayDateSql += `${dateField} >= ? AND ${dateField} <= ?`;
      paramsToday.push(`${dateFrom} 00:00:00`, `${dateTo} 23:59:59`);

      const msPerDay = 1000 * 60 * 60 * 24;
      const durationDays = Math.ceil((d2.getTime() - d1.getTime()) / msPerDay);

      const prevD1 = new Date(d1.getTime() - durationDays * msPerDay);
      const prevD2 = new Date(d1.getTime() - 1);

      const prevDateFrom = this.formatLocalDate(prevD1);
      const prevDateTo = this.formatLocalDate(prevD2);

      yesterdayDateSql = clauses.length > 0 ? ' AND ' : ' WHERE ';
      yesterdayDateSql += `${dateField} >= ? AND ${dateField} <= ?`;
      paramsYesterday.push(`${prevDateFrom} 00:00:00`, `${prevDateTo} 23:59:59`);
    } else if (period !== 'allTime') {
      todayDateSql = clauses.length > 0 ? ' AND ' : ' WHERE ';
      todayDateSql += `${dateField} >= CURDATE() AND ${dateField} < DATE_ADD(CURDATE(), INTERVAL 1 DAY)`;

      yesterdayDateSql = clauses.length > 0 ? ' AND ' : ' WHERE ';
      yesterdayDateSql += `${dateField} >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND ${dateField} < CURDATE()`;
    }

    const todayRowsPromise = this.dataSource.query<{ total: string | number | null }[]>(
      `
      SELECT COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS total
      FROM LLTENROLL e
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      ${whereSql}${todayDateSql}
      `,
      paramsToday,
    );

    const yesterdayRowsPromise =
      period !== 'allTime'
        ? this.dataSource.query<{ total: string | number | null }[]>(
            `
          SELECT COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS total
          FROM LLTENROLL e
          LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
          ${whereSql}${yesterdayDateSql}
          `,
            paramsYesterday,
          )
        : Promise.resolve([{ total: 0 }]);

    const pendingRowsPromise = this.dataSource.query<{ total: string | number | null }[]>(
      `
      SELECT COUNT(*) AS total
      FROM LLTENROLL e
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      ${whereSql}${todayDateSql}
      AND COALESCE(e.ENROLL_AMOUNT, 0) > 0
      AND NOT EXISTS (
        SELECT 1
        FROM LLTENROLLRECEIPT er
        WHERE er.ENROLL_ID = e.ENROLL_ID
          AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
      )
      `,
      paramsToday,
    );

    const issuedRowsPromise = this.dataSource.query<{ total: string | number | null }[]>(
      `
      SELECT COUNT(*) AS total
      FROM LLTENROLLRECEIPT er
      INNER JOIN LLTENROLL e ON e.ENROLL_ID = er.ENROLL_ID
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      ${whereSql}${todayDateSql}
      AND COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
      `,
      paramsToday,
    );

    const totalTransactionsRowsPromise = this.dataSource.query<{ total: string | number | null }[]>(
      `
      SELECT COUNT(*) AS total
      FROM LLTENROLL e
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      ${whereSql}${todayDateSql}
      AND COALESCE(e.ENROLL_AMOUNT, 0) > 0
      `,
      paramsToday,
    );

    const [todayRows, yesterdayRows, pendingRows, issuedRows, totalTransactionsRows] =
      await Promise.all([
        todayRowsPromise,
        yesterdayRowsPromise,
        pendingRowsPromise,
        issuedRowsPromise,
        totalTransactionsRowsPromise,
      ]);

    let yesterdayTotal = 0;
    if (period !== 'allTime') {
      yesterdayTotal = this.toNumber(yesterdayRows[0]?.total);
    }

    return {
      todayRevenue: this.toNumber(todayRows[0]?.total),
      yesterdayRevenue: yesterdayTotal,
      pendingReceipts: this.toNumber(pendingRows[0]?.total),
      issuedReceipts: this.toNumber(issuedRows[0]?.total),
      totalTransactions: this.toNumber(totalTransactionsRows[0]?.total),
    };
  }

  async getRecentActivity(
    facCode?: number | string | null,
    authUserId?: number | null,
  ): Promise<{
    activities: {
      type: string;
      title: string;
      detail: string;
      time: string;
      icon: string;
      color: string;
    }[];
  }> {
    let resolvedFacCode = facCode;
    if (
      (resolvedFacCode === undefined ||
        resolvedFacCode === null ||
        String(resolvedFacCode).trim() === '') &&
      authUserId
    ) {
      const queryResult: unknown = await this.dataSource.query(
        'SELECT FAC_ID AS facId FROM LLT_AUTH_USERS WHERE USER_ID = ?',
        [authUserId],
      );
      if (Array.isArray(queryResult) && queryResult.length > 0) {
        const first: unknown = (queryResult as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first)) {
          const authUser = first as { facId?: number; FAC_ID?: number };
          resolvedFacCode = authUser.facId ?? authUser.FAC_ID;
        }
      }
    }

    const facClause =
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
        ? 'AND c.FAC_ID = ?'
        : '';
    const facParams =
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
        ? [Number(resolvedFacCode)]
        : [];

    // 1. Recent paid enrollments from LLTENROLL
    const enrollRowsPromise = this.dataSource.query<
      {
        learnerName: string | null;
        amount: string | number;
        openclassId: string | number | null;
        courseCode: string | null;
        eventTime: Date | string;
      }[]
    >(
      `
      SELECT
        CONCAT(COALESCE(u.USER_FNAMETH, u.USER_FNAMEEN, ''), ' ', COALESCE(u.USER_LNAMETH, u.USER_LNAMEEN, '')) AS learnerName,
        COALESCE(e.ENROLL_AMOUNT, 0) AS amount,
        e.OPENCLASS_ID AS openclassId,
        c.COSE_CODE AS courseCode,
        COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE) AS eventTime
      FROM LLTENROLL e
      LEFT JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = e.COSE_ID
      WHERE e.ENROLL_PAYSTATUS = 'Y'
        AND COALESCE(e.ENROLL_AMOUNT, 0) > 0
        ${facClause}
      ORDER BY COALESCE(e.ENROLL_PAYDATE, e.ENROLL_DATE) DESC
      LIMIT 10
      `,
      [...facParams],
    );

    // 2. Recent receipts from LLTENROLLRECEIPT grouped by CREATEDATE
    const receiptFacClause =
      resolvedFacCode !== undefined &&
      resolvedFacCode !== null &&
      String(resolvedFacCode).trim() !== ''
        ? 'AND er.FAC_ID = ?'
        : '';

    const receiptRowsPromise = this.dataSource.query<
      {
        batchTime: Date | string;
        cnt: string | number;
        courseCode: string | null;
        courseName: string | null;
      }[]
    >(
      `
      SELECT
        er.CREATEDATE AS batchTime,
        COUNT(*) AS cnt,
        MIN(er.COSE_CODE) AS courseCode,
        MIN(er.COSE_NAMETH) AS courseName
      FROM LLTENROLLRECEIPT er
      WHERE COALESCE(er.RECEIPT_STATUS, 'Y') <> 'C'
        ${receiptFacClause}
      GROUP BY er.CREATEDATE
      ORDER BY er.CREATEDATE DESC
      LIMIT 10
      `,
      [...facParams],
    );

    const [enrollRows, receiptRows] = await Promise.all([enrollRowsPromise, receiptRowsPromise]);

    // 3. Merge into unified activity list
    interface ActivityItem {
      type: string;
      title: string;
      detail: string;
      time: string;
      icon: string;
      color: string;
      sortTime: number;
    }

    const activities: ActivityItem[] = [];

    for (const row of enrollRows) {
      const name = (row.learnerName ?? '').trim() || 'ไม่ระบุ';
      const amt = this.toNumber(row.amount);
      const openclassId = row.openclassId ? String(row.openclassId) : '';
      const formattedAmt = amt.toLocaleString('th-TH');
      const detail = openclassId
        ? `จากคุณ ${name} - ฿${formattedAmt}, ${openclassId}`
        : `จากคุณ ${name} - ฿${formattedAmt}`;

      const eventTime = row.eventTime ? new Date(row.eventTime) : new Date();

      activities.push({
        type: 'payment',
        title: 'ยืนยันการชำระเงิน',
        detail,
        time: eventTime.toISOString(),
        icon: 'check_circle',
        color: 'positive',
        sortTime: eventTime.getTime(),
      });
    }

    for (const row of receiptRows) {
      const cnt = this.toNumber(row.cnt);
      const courseCode = (row.courseCode ?? '').trim();
      const courseName = (row.courseName ?? '').trim();
      const courseLabel = courseCode || courseName || '-';
      const batchTime = row.batchTime ? new Date(row.batchTime) : new Date();

      let detail: string;
      if (cnt === 1) {
        detail = `ออกใบเสร็จสำเร็จ - ${courseLabel}`;
      } else {
        detail = `ออกใบเสร็จสำเร็จ ${cnt} รายการ - ${courseLabel}`;
      }

      activities.push({
        type: 'receipt',
        title: 'ออกใบเสร็จสำเร็จ',
        detail,
        time: batchTime.toISOString(),
        icon: 'receipt',
        color: 'blue-6',
        sortTime: batchTime.getTime(),
      });
    }

    // Sort by time descending, take top 6
    activities.sort((a, b) => b.sortTime - a.sortTime);
    const top6 = activities.slice(0, 6).map((item) => {
      return {
        type: item.type,
        title: item.title,
        detail: item.detail,
        time: item.time,
        icon: item.icon,
        color: item.color,
      };
    });

    return { activities: top6 };
  }
}
