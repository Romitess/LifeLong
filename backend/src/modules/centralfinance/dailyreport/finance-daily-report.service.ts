import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FinanceDailyReportQueryDto } from './dto/finance-daily-report-query.dto';
import { parseDdMmYyyy } from '../utils/parse-date.util';

export interface FinanceDailyReportItem {
  id: number;
  no: number;
  courseCode: string | null;
  courseName: string;
  courseNameEn: string | null;
  fundCode: string | null;
  fundName: string | null;
  amount: number;
  faculty: string;
  receiptDate: string | null;
  receiptStatus: string;
}

interface RawDailyReportRow {
  id: string | number | null;
  courseCode: string | null;
  courseName: string | null;
  courseNameEn: string | null;
  fundCode: string | null;
  fundName: string | null;
  amount: string | number | null;
  faculty: string | null;
  receiptDate: string | null;
  receiptStatus: string | null;
}

const PAYDATE_EXPR = 'e.PAYDATE';

@Injectable()
export class FinanceDailyReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getDailyReport(query: FinanceDailyReportQueryDto): Promise<{
    success: true;
    total: number;
    data: FinanceDailyReportItem[];
  }> {
    try {
      const params: (string | Date | number)[] = [];
      const conditions: string[] = [];

      const receiptDateStart = parseDdMmYyyy(query.receiptDateStart, false);
      if (receiptDateStart) {
        conditions.push(`${PAYDATE_EXPR} >= ?`);
        params.push(receiptDateStart);
      }

      const receiptDateEnd = parseDdMmYyyy(query.receiptDateEnd, true);
      if (receiptDateEnd) {
        conditions.push(`${PAYDATE_EXPR} <= ?`);
        params.push(receiptDateEnd);
      }

      if (query.facName) {
        conditions.push('e.FAC_NAME = ?');
        params.push(query.facName);
      }

      if (query.facId) {
        conditions.push('(e.FAC_ID = ? OR c.FAC_ID = ?)');
        params.push(query.facId, query.facId);
      }

      if (query.courseName) {
        conditions.push('c.COSE_NAMETH LIKE ?');
        params.push(`%${query.courseName}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `
        SELECT
          MIN(e.ENROLLRECEIPT_ID)                                              AS id,
          MAX(c.COSE_CODE)                                                     AS courseCode,
          COALESCE(c.COSE_NAMETH, e.COSE_NAMETH, '-')                          AS courseName,
          MAX(NULLIF(c.COSE_NAMEEN, ''))                                        AS courseNameEn,
          COALESCE(NULLIF(TRIM(CONCAT_WS(' ', cp.COSTPLAN_CODE, cp.COSTPLAN_NAME)), ''), '-') AS fundCode,
          NULL                                                                 AS fundName,
          SUM(COALESCE(CAST(en.ENROLL_AMOUNT AS DECIMAL(15,2)), CAST(e.AMOUNT AS DECIMAL(15,2)), 0)) AS amount,
          COALESCE(e.FAC_NAME, '-')                                            AS faculty,
          MAX(DATE_FORMAT(${PAYDATE_EXPR}, '%d/%m/%Y'))                        AS receiptDate,
          MAX(CASE e.RECEIPT_STATUS
            WHEN 'Y' THEN 'ใช้งาน'
            WHEN 'C' THEN 'ยกเลิก'
            ELSE '-'
          END)                                                                 AS receiptStatus
        FROM LLTENROLLRECEIPT e
        LEFT JOIN LLTENROLL en ON en.ENROLL_ID = e.ENROLL_ID
        LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = en.OPENCLASS_ID
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = en.COSE_ID
        LEFT JOIN LLTCOSTPLAN cp ON cp.COSTPLAN_ID = oc.COSTPLAN_ID
        ${whereClause}
        GROUP BY
          COALESCE(e.FAC_NAME, '-'),
          COALESCE(c.COSE_NAMETH, e.COSE_NAMETH, '-'),
          COALESCE(NULLIF(TRIM(CONCAT_WS(' ', cp.COSTPLAN_CODE, cp.COSTPLAN_NAME)), ''), '-')
        ORDER BY faculty ASC, courseName ASC
      `;

      const rows = (await this.dataSource.query(sql, params)) as unknown as RawDailyReportRow[];

      const data: FinanceDailyReportItem[] = rows.map((row, index) => ({
        id: Number(row.id),
        no: index + 1,
        courseCode: row.courseCode?.trim() ?? null,
        courseName: row.courseName ?? '-',
        courseNameEn: row.courseNameEn?.trim() || null,
        fundCode: row.fundCode?.trim() || '-',
        fundName: row.fundName?.trim() ?? null,
        amount: row.amount !== null && row.amount !== undefined ? Number(row.amount) : 0,
        faculty: row.faculty ?? '-',
        receiptDate: row.receiptDate ?? null,
        receiptStatus: row.receiptStatus ?? '-',
      }));

      return { success: true, total: data.length, data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงรายงานประจำวัน: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFacultyOptions(): Promise<{ id: number; name: string; nameEn: string | null }[]> {
    const sql = `
      SELECT FAC_ID AS id, COALESCE(FAC_NAME, '') AS name, FAC_NAMEEN AS nameEn
      FROM LLTFACULTY
      ORDER BY FAC_SEQ ASC, FAC_ID ASC
    `;
    const rows: { id: number; name: string; nameEn: string | null }[] =
      await this.dataSource.query(sql);
    return rows;
  }

  async getCourseOptions(facId?: string | number): Promise<{ id: string; name: string }[]> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (facId) {
      conditions.push('(e.FAC_ID = ? OR c.FAC_ID = ?)');
      params.push(facId, facId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT DISTINCT
        COALESCE(c.COSE_NAMETH, e.COSE_NAMETH, '-') AS name
      FROM LLTENROLLRECEIPT e
      LEFT JOIN LLTENROLL en ON en.ENROLL_ID = e.ENROLL_ID
      LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = en.OPENCLASS_ID
      LEFT JOIN LLTCOURSE c ON c.COSE_ID = en.COSE_ID
      ${whereClause}
      ORDER BY name ASC
    `;

    const rows = (await this.dataSource.query(sql, params)) as unknown as { name: string }[];
    return rows.map((r, i) => ({ id: `course_${i}`, name: r.name }));
  }
}
