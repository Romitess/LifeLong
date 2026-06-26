import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { parseDdMmYyyy } from '../utils/parse-date.util';

const DATE_EXPR = 'PAYDATE';

@Injectable()
export class CentralFinanceDashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboardStats(query: DashboardQueryDto): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    pendingReceipts: number;
    issuedReceipts: number;
    activeFaculties: number;
  }> {
    try {
      const { conditions, params } = this.buildDateConditions(query, false);
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `
        SELECT
          COALESCE(SUM(CASE WHEN RECEIPT_STATUS = 'Y' THEN CAST(AMOUNT AS DECIMAL(15,2)) ELSE 0 END), 0) AS totalRevenue,
          COUNT(*)                                                                                          AS totalTransactions,
          SUM(CASE WHEN RECEIPT_STATUS = 'C' THEN 1 ELSE 0 END)                                           AS pendingReceipts,
          SUM(CASE WHEN RECEIPT_STATUS = 'Y' THEN 1 ELSE 0 END)                                           AS issuedReceipts,
          COUNT(DISTINCT CASE WHEN RECEIPT_STATUS = 'Y' THEN FAC_NAME END)                                AS activeFaculties
        FROM LLTENROLLRECEIPT
        ${whereClause}
      `;

      const rows: {
        totalRevenue: string;
        totalTransactions: string;
        pendingReceipts: string;
        issuedReceipts: string;
        activeFaculties: string;
      }[] = await this.dataSource.query(sql, params);
      const row = rows[0] ?? {
        totalRevenue: '0',
        totalTransactions: '0',
        pendingReceipts: '0',
        issuedReceipts: '0',
        activeFaculties: '0',
      };

      return {
        totalRevenue: Number(row.totalRevenue ?? 0),
        totalTransactions: Number(row.totalTransactions ?? 0),
        pendingReceipts: Number(row.pendingReceipts ?? 0),
        issuedReceipts: Number(row.issuedReceipts ?? 0),
        activeFaculties: Number(row.activeFaculties ?? 0),
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึง dashboard stats: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDashboardTrend(
    query: DashboardQueryDto,
  ): Promise<{ months: string[]; revenue: number[]; fundRequests: number[] }> {
    try {
      const now = new Date();
      let startDate: Date;
      let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const d1 = parseDdMmYyyy(query.dateFrom, false);
      const d2 = parseDdMmYyyy(query.dateTo, false);

      if (query.period === 'custom' && d1 && d2) {
        startDate = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
        endDate = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      }

      const msPerDay = 1000 * 60 * 60 * 24;
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / msPerDay);
      const isDaily = diffDays <= 31;
      const groupByFormat = isDaily ? `'%Y-%m-%d'` : `'%Y-%m'`;

      const { conditions, params } = this.buildDateConditions(query, true);
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const sql = `
        SELECT
          DATE_FORMAT(${DATE_EXPR}, ${groupByFormat}) AS period,
          COALESCE(SUM(CASE WHEN RECEIPT_STATUS = 'Y' THEN CAST(AMOUNT AS DECIMAL(15,2)) ELSE 0 END), 0) AS revenue,
          COUNT(*) AS fundRequests
        FROM LLTENROLLRECEIPT
        ${whereClause}
        GROUP BY period
        ORDER BY period ASC
      `;

      const rows: { period: string; revenue: string; fundRequests: string }[] =
        await this.dataSource.query(sql, params);

      const dataMap = new Map<string, { revenue: number; fundRequests: number }>();
      for (const row of rows) {
        dataMap.set(String(row.period), {
          revenue: Number(row.revenue ?? 0),
          fundRequests: Number(row.fundRequests ?? 0),
        });
      }

      const months: string[] = [];
      const revenue: number[] = [];
      const fundRequests: number[] = [];

      if (isDaily) {
        const cursor = new Date(startDate);
        while (cursor <= endDate) {
          const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
          const data = dataMap.get(label) ?? { revenue: 0, fundRequests: 0 };
          months.push(label);
          revenue.push(data.revenue);
          fundRequests.push(data.fundRequests);
          cursor.setDate(cursor.getDate() + 1);
        }
      } else {
        const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        const endCursor = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        while (cursor <= endCursor && months.length < 24) {
          const label = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
          const data = dataMap.get(label) ?? { revenue: 0, fundRequests: 0 };
          months.push(label);
          revenue.push(data.revenue);
          fundRequests.push(data.fundRequests);
          cursor.setMonth(cursor.getMonth() + 1);
        }
      }

      return { months, revenue, fundRequests };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึง dashboard trend: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFacultyBreakdown(
    query: DashboardQueryDto,
  ): Promise<{ faculty: string; totalAmount: number }[]> {
    try {
      const { conditions, params } = this.buildDateConditions(query, false);
      conditions.push("RECEIPT_STATUS = 'Y'");
      const whereClause = `WHERE ${conditions.join(' AND ')}`;

      const sql = `
        SELECT
          COALESCE(FAC_NAME, '-')                          AS faculty,
          COALESCE(SUM(CAST(AMOUNT AS DECIMAL(15,2))), 0)  AS totalAmount
        FROM LLTENROLLRECEIPT
        ${whereClause}
        GROUP BY FAC_NAME
        ORDER BY totalAmount DESC
        LIMIT 6
      `;

      const rows: { faculty: string; totalAmount: string }[] = await this.dataSource.query(
        sql,
        params,
      );

      return rows.map((r) => ({
        faculty: r.faculty ?? '-',
        totalAmount: Number(r.totalAmount ?? 0),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        'เกิดข้อผิดพลาดในการดึงยอดรายรับตามคณะ: ' + message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildDateConditions(
    query: DashboardQueryDto,
    applyAllTimeLimit: boolean,
  ): { conditions: string[]; params: (string | Date)[] } {
    const conditions: string[] = [];
    const params: (string | Date)[] = [];

    if (query.period === 'custom') {
      const dateFrom = parseDdMmYyyy(query.dateFrom, false);
      if (dateFrom) {
        conditions.push(`${DATE_EXPR} >= ?`);
        params.push(dateFrom);
      }
      const dateTo = parseDdMmYyyy(query.dateTo, true);
      if (dateTo) {
        conditions.push(`${DATE_EXPR} <= ?`);
        params.push(dateTo);
      }
    } else if (applyAllTimeLimit) {
      conditions.push(`${DATE_EXPR} >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`);
    }

    return { conditions, params };
  }
}
