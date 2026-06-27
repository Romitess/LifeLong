import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReceiptUsageReportQueryDto } from './dto/receipt-usage-report-query.dto';
import { parseDdMmYyyy } from '../utils/parse-date.util';

export interface ReceiptUsageItem {
  id: number;
  no: number;
  departmentCode: number;
  faculty: string;
  receiptNo: string;
  receiptFilename: string | null;
  receiptType: string | null;
  customerName: string;
  customerNameEn: string | null;
  amount: number | string;
  effectiveDate: string;
  fiscalYear: string;
  courseName: string;
  courseNameEn: string | null;
  collector: string;
  collectorNameEn: string | null;
  status: string;
  cancelBy?: string;
  cancelDate?: string;
}

interface RawReceiptUsageRow {
  id: string | number | null;
  departmentCode: string | number | null;
  faculty: string | null;
  receiptNo: string | number | null;
  receiptFilename: string | null;
  receiptType: string | null;
  customerName: string | null;
  customerNameEn: string | null;
  amount: string | number | null;
  effectiveDate: string | null;
  fiscalYear: string | null;
  courseName: string | null;
  courseNameEn: string | null;
  collector: string | null;
  collectorNameEn: string | null;
  status: string | null;
  cancelBy: string | null;
  cancelDate: string | null;
}

@Injectable()
export class ReceiptUsageReportService {
  constructor(private readonly dataSource: DataSource) {}

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

  async getReceiptUsage(
    query: ReceiptUsageReportQueryDto,
  ): Promise<{ success: true; total: number; data: ReceiptUsageItem[] }> {
    try {
      const params: (string | Date)[] = [];
      const conditions: string[] = [];

      if (query.fiscalYear) {
        conditions.push('e.PAYDATE >= ? AND e.PAYDATE < ?');
        params.push(`${query.fiscalYear}-01-01`, `${Number(query.fiscalYear) + 1}-01-01`);
      }

      const receiptDateStart = parseDdMmYyyy(query.receiptDateStart, false);
      if (receiptDateStart) {
        conditions.push('e.PAYDATE >= ?');
        params.push(receiptDateStart);
      }

      const receiptDateEnd = parseDdMmYyyy(query.receiptDateEnd, true);
      if (receiptDateEnd) {
        conditions.push('e.PAYDATE <= ?');
        params.push(receiptDateEnd);
      }

      if (query.facName) {
        conditions.push('e.FAC_NAME = ?');
        params.push(query.facName);
      }

      if (query.courseName) {
        conditions.push('e.COSE_NAMETH LIKE ?');
        params.push(`%${query.courseName}%`);
      }

      if (query.customerName) {
        conditions.push(
          "CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')) LIKE ?",
        );
        params.push(`%${query.customerName}%`);
      }

      if (query.collector) {
        conditions.push('e.CREATEUSER LIKE ?');
        params.push(`%${query.collector}%`);
      }

      if (query.receiptNo) {
        conditions.push(
          'COALESCE(CAST(e.RECEIPT_NO AS CHAR), CAST(e.ENROLLRECEIPT_ID AS CHAR)) LIKE ?',
        );
        params.push(`%${query.receiptNo}%`);
      }

      if (query.status) {
        const statusCode = this.mapStatusToCode(query.status);
        if (statusCode) {
          conditions.push('e.RECEIPT_STATUS = ?');
          params.push(statusCode);
        }
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
          e.ENROLLRECEIPT_ID                                                                                AS id,
          COALESCE(e.FAC_ID, 0)                                                                            AS departmentCode,
          COALESCE(e.FAC_NAME, '-')                                                                        AS faculty,
          COALESCE(CAST(e.RECEIPT_NO AS CHAR), CAST(e.ENROLLRECEIPT_ID AS CHAR))                          AS receiptNo,
          r.RECEIPT_FILENAME                                                                                AS receiptFilename,
          r.RECEIPT_TYPE                                                                                    AS receiptType,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(e.USER_FNAMETH, ''), ' ', COALESCE(e.USER_LNAMETH, '')))), '') AS customerName,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(u.USER_FNAMEEN, ''), ' ', COALESCE(u.USER_LNAMEEN, '')))), '') AS customerNameEn,
          e.AMOUNT                                                                                          AS amount,
          DATE_FORMAT(e.PAYDATE, '%Y-%m-%d')                                                               AS effectiveDate,
          COALESCE(CAST(YEAR(e.PAYDATE) AS CHAR), '-')                                                     AS fiscalYear,
          COALESCE(e.COSE_NAMETH, '-')                                                                     AS courseName,
          NULLIF(c.COSE_NAMEEN, '')                                                                        AS courseNameEn,
          COALESCE(NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(cu.USER_FNAMETH, ''), ' ', COALESCE(cu.USER_LNAMETH, '')))), ''), e.CREATEUSER, '-') AS collector,
          NULLIF(LTRIM(RTRIM(CONCAT(COALESCE(cu.USER_FNAMEEN, ''), ' ', COALESCE(cu.USER_LNAMEEN, '')))), '') AS collectorNameEn,
          CASE e.RECEIPT_STATUS
            WHEN 'Y' THEN 'ใช้งาน'
            WHEN 'C' THEN 'ยกเลิก'
            ELSE '-'
          END                                                                                               AS status,
          e.RECEIPT_CANCLEUSER_NAME                                                                        AS cancelBy,
          DATE_FORMAT(e.RECEIPT_CANCLEDATE, '%d/%m/%Y')                                                   AS cancelDate
        ${baseSql}
        ORDER BY e.ENROLLRECEIPT_ID ASC
      `;

      const page = Math.max(Number(query.page ?? 1), 1);
      const pageSize = Math.max(Number(query.pageSize ?? 20), 1);
      const usePagination = query.page !== undefined && query.pageSize !== undefined;

      let total: number;
      let rows: RawReceiptUsageRow[];

      if (usePagination) {
        const offset = (page - 1) * pageSize;
        const countSql = `SELECT COUNT(*) AS cnt ${baseSql}`;
        const [countResult, pageRows] = (await Promise.all([
          this.dataSource.query(countSql, params),
          this.dataSource.query(`${selectSql} LIMIT ? OFFSET ?`, [...params, pageSize, offset]),
        ])) as [{ cnt: string }[], RawReceiptUsageRow[]];
        total = Number(countResult[0]?.cnt ?? 0);
        rows = pageRows;
      } else {
        rows = await this.dataSource.query(selectSql, params);
        total = rows.length;
      }

      const offset = usePagination ? (page - 1) * pageSize : 0;
      const data: ReceiptUsageItem[] = rows.map((row, index) => {
        const item: ReceiptUsageItem = {
          id: Number(row.id),
          no: offset + index + 1,
          departmentCode: Number(row.departmentCode ?? 0),
          faculty: row.faculty ?? '-',
          receiptNo: String(row.receiptNo ?? '-'),
          receiptFilename: row.receiptFilename ?? null,
          receiptType: row.receiptType ?? null,
          customerName: row.customerName ?? '-',
          customerNameEn: row.customerNameEn?.trim() || null,
          amount: row.amount !== null && row.amount !== undefined ? Number(row.amount) : '-',
          effectiveDate: row.effectiveDate ?? '-',
          fiscalYear: row.fiscalYear ?? '-',
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
        'เกิดข้อผิดพลาดในการดึงรายงานการใช้ใบเสร็จรับเงิน: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private mapStatusToCode(status: string): string | null {
    if (status === 'Y' || status === 'ใช้งาน') return 'Y';
    if (status === 'C' || status === 'ยกเลิก') return 'C';
    return null;
  }
}
