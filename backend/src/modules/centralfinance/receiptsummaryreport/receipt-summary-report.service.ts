import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReceiptSummaryReportQueryDto } from './dto/receipt-summary-report-query.dto';
import { parseDdMmYyyy } from '../utils/parse-date.util';

export interface CentralReceiptSummaryItem {
  id: number;
  no: number;
  faculty: string;
  receiptNo: string;
  customerName: string;
  customerNameEn: string | null;
  amount: number | string;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  courseNameEn: string | null;
  collector: string;
  collectorNameEn: string | null;
  status: string;
  cancelBy?: string;
  cancelDate?: string;
}

interface RawReceiptRow {
  id: string | number | null;
  faculty: string | null;
  receiptNo: string | number | null;
  customerName: string | null;
  customerNameEn: string | null;
  amount: string | number | null;
  effectiveDate: string | null;
  learnerName: string | null;
  courseName: string | null;
  courseNameEn: string | null;
  collector: string | null;
  collectorNameEn: string | null;
  status: string | null;
  cancelBy: string | null;
  cancelDate: string | null;
}

@Injectable()
export class ReceiptSummaryReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getReceiptSummary(
    query: ReceiptSummaryReportQueryDto,
  ): Promise<{ success: true; total: number; data: CentralReceiptSummaryItem[] }> {
    try {
      const params: (string | Date)[] = [];
      const conditions: string[] = [];

      if (query.facName) {
        conditions.push('e.FAC_NAME = ?');
        params.push(query.facName);
      }

      const receiptDateStart = parseDdMmYyyy(query.receiptDateStart, false);
      if (receiptDateStart) {
        conditions.push('e.CREATEDATE >= ?');
        params.push(receiptDateStart);
      }

      const receiptDateEnd = parseDdMmYyyy(query.receiptDateEnd, true);
      if (receiptDateEnd) {
        conditions.push('e.CREATEDATE <= ?');
        params.push(receiptDateEnd);
      }

      const effectiveDateStart = parseDdMmYyyy(query.effectiveDateStart, false);
      if (effectiveDateStart) {
        conditions.push('e.PAYDATE >= ?');
        params.push(effectiveDateStart);
      }

      const effectiveDateEnd = parseDdMmYyyy(query.effectiveDateEnd, true);
      if (effectiveDateEnd) {
        conditions.push('e.PAYDATE <= ?');
        params.push(effectiveDateEnd);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const baseSql = `
        FROM LLTENROLLRECEIPT e
        LEFT JOIN LLTRECEIPT r ON r.RECEIPT_ID = e.RECEIPT_ID_COPY
        LEFT JOIN LLTENROLL en ON en.ENROLL_ID = e.ENROLL_ID
        LEFT JOIN LLTCOURSE c ON c.COSE_ID = en.COSE_ID
        LEFT JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        LEFT JOIN LLTUMUSER cu ON cu.USER_USERNAME = e.CREATEUSER
        ${whereClause}
      `;

      const selectSql = `
        SELECT
          e.ENROLLRECEIPT_ID                                                                              AS id,
          COALESCE(e.FAC_NAME, '-')                                                                      AS faculty,
          e.ENROLLRECEIPT_ID                                                                              AS receiptNo,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')))), '') AS customerName,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(u.USER_FNAMEEN, ''), ' ', COALESCE(u.USER_LNAMEEN, '')))), '') AS customerNameEn,
          e.AMOUNT                                                                                        AS amount,
          DATE_FORMAT(e.PAYDATE, '%Y-%m-%d')                                                             AS effectiveDate,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')))), '') AS learnerName,
          e.COSE_NAMETH                                                                                   AS courseName,
          NULLIF(c.COSE_NAMEEN, '')                                                                       AS courseNameEn,
          CONCAT(
            COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(cu.USER_FNAMETH, ''), ' ', COALESCE(cu.USER_LNAMETH, '')))), ''), e.CREATEUSER, '-'),
            CHAR(10),
            COALESCE(DATE_FORMAT(e.CREATEDATE, '%Y-%m-%d %H:%i:%s'), '-')
          )                                                                                               AS collector,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(cu.USER_FNAMEEN, ''), ' ', COALESCE(cu.USER_LNAMEEN, '')))), '') AS collectorNameEn,
          CASE e.RECEIPT_STATUS
            WHEN 'Y' THEN 'ใช้งาน'
            WHEN 'C' THEN 'ยกเลิก'
            ELSE '-'
          END                                                                                             AS status,
          e.RECEIPT_CANCLEUSER_NAME                                                                       AS cancelBy,
          DATE_FORMAT(e.RECEIPT_CANCLEDATE, '%d/%m/%Y')                                                  AS cancelDate
        ${baseSql}
        ORDER BY e.ENROLLRECEIPT_ID ASC
      `;

      const page = Math.max(query.page ?? 1, 1);
      const pageSize = Math.max(query.pageSize ?? 20, 1);
      const usePagination = query.page !== undefined && query.pageSize !== undefined;

      let total: number;
      let rows: RawReceiptRow[];

      if (usePagination) {
        const offset = (page - 1) * pageSize;
        const countSql = `SELECT COUNT(*) AS cnt ${baseSql}`;
        const [countResult, pageRows] = (await Promise.all([
          this.dataSource.query(countSql, params),
          this.dataSource.query(`${selectSql} LIMIT ? OFFSET ?`, [...params, pageSize, offset]),
        ])) as [{ cnt: string }[], RawReceiptRow[]];
        total = Number(countResult[0]?.cnt ?? 0);
        rows = pageRows;
      } else {
        rows = await this.dataSource.query(selectSql, params);
        total = rows.length;
      }

      const offset = usePagination ? (page - 1) * pageSize : 0;
      const data: CentralReceiptSummaryItem[] = rows.map((row, index) => {
        const item: CentralReceiptSummaryItem = {
          id: Number(row.id),
          no: offset + index + 1,
          faculty: row.faculty ?? '-',
          receiptNo: String(row.receiptNo ?? '-'),
          customerName: row.customerName ?? '-',
          customerNameEn: row.customerNameEn?.trim() || null,
          amount: row.amount !== null && row.amount !== undefined ? Number(row.amount) : '-',
          effectiveDate: row.effectiveDate ?? '-',
          learnerName: row.learnerName ?? '-',
          courseName: row.courseName ?? '-',
          courseNameEn: row.courseNameEn?.trim() || null,
          collector: row.collector ?? '-',
          collectorNameEn: row.collectorNameEn?.trim() || null,
          status: row.status ?? '-',
        };

        if (row.cancelBy) item.cancelBy = row.cancelBy;
        if (row.cancelDate) item.cancelDate = row.cancelDate;

        return item;
      });

      return { success: true, total, data };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงรายงานสรุปใบเสร็จ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
