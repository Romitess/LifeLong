import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CentralFinanceFacultyReportQueryDto } from './dto/centralfinance-faculty-report-query.dto';
import { CentralFinanceFacultyReportExportQueryDto } from './dto/centralfinance-faculty-report-export-query.dto';
import {
  CentralFinanceFacultyReportCourseItemDto,
  CentralFinanceFacultyReportFacultyGroupDto,
  CentralFinanceFacultyReportFilterOptionDto,
  CentralFinanceFacultyReportResponseDto,
} from './dto/centralfinance-faculty-report-response.dto';
import {
  CentralFinanceFacultyReportExportFacultyGroupDto,
  CentralFinanceFacultyReportExportResponseDto,
} from './dto/centralfinance-faculty-report-export-response.dto';

interface SummaryRow {
  totalCourses: number | string | null;
  totalLearners: number | string | null;
  totalRegistrationFees: number | string | null;
}

interface OptionRow {
  id: number | string | null;
  label: string | null;
}

interface CourseRow {
  courseId: number | string | null;
  courseCode: string | null;
  courseName: string | null;
  courseNameEn: string | null;
  facultyId: number | string | null;
  facultyName: string | null;
  responsibleName: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  learnerCount: number | string | null;
  unitPrice: number | string | null;
  registrationFee: number | string | null;
}

interface FacultyTotalRow {
  facultyId: number | string | null;
  facultyName: string | null;
  totalCourses: number | string | null;
  totalLearners: number | string | null;
  totalRegistrationFees: number | string | null;
}

@Injectable()
export class CentralFinanceFacultyReportService {
  constructor(private readonly dataSource: DataSource) {}

  private buildFromClause(
    startDate: string | null,
    endDate: string | null,
    facultyId: number | null,
    typeCourseId: number | null,
    feeType: string | undefined,
  ): { fromClause: string; params: Array<string | number> } {
    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (startDate) {
      filters.push('base.startDate >= ?');
      params.push(startDate);
    }
    if (endDate) {
      filters.push('base.startDate <= ?');
      params.push(endDate);
    }
    if (facultyId !== null) {
      filters.push('base.facultyId = ?');
      params.push(facultyId);
    }
    if (typeCourseId !== null) {
      filters.push('base.typeCourseId = ?');
      params.push(typeCourseId);
    }
    if (feeType === 'free') {
      filters.push('COALESCE(base.unitPrice, 0) = 0 AND COALESCE(base.registrationFee, 0) = 0');
    } else if (feeType === 'paid') {
      filters.push('(COALESCE(base.unitPrice, 0) > 0 OR COALESCE(base.registrationFee, 0) > 0)');
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    return {
      fromClause: `FROM (${this.buildBaseQuery()}) base ${whereClause}`,
      params,
    };
  }

  private buildBaseQuery(): string {
    return `
      SELECT
        c.COSE_ID AS courseId,
        c.COSE_CODE AS courseCode,
        COALESCE(
          NULLIF(c.COSE_NAMETH, ''),
          NULLIF(c.COSE_NAMEEN, ''),
          CONCAT('Course #', c.COSE_ID)
        ) AS courseName,
        NULLIF(c.COSE_NAMEEN, '') AS courseNameEn,
        COALESCE(f.FAC_ID, 0) AS facultyId,
        COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน') AS facultyName,
        COALESCE(tc.TYPECOSE_ID, 0) AS typeCourseId,
        COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท') AS typeCourseName,
        responsibleCourses.responsibleNames AS responsibleName,
        COALESCE(courseSchedules.classStartDate, c.COSE_STARTDATE) AS startDate,
        COALESCE(courseSchedules.classEndDate, c.COSE_ENDDATE) AS endDate,
        COALESCE(courseSchedules.unitPrice, courseEnrollments.unitPrice, 0) AS unitPrice,
        COALESCE(courseEnrollments.registrationFee, 0) AS registrationFee,
        COALESCE(courseEnrollments.learnerCount, 0) AS learnerCount
      FROM LLTCOURSE c
      LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
      LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
      LEFT JOIN (
        SELECT
          oc.COSE_ID,
          MIN(oc.OPENCLASS_CLASSSTARTDATE) AS classStartDate,
          MAX(oc.OPENCLASS_CLASSENDDATE) AS classEndDate,
          MAX(COALESCE(oc.OPENCLASS_AMOUNT, 0)) AS unitPrice
        FROM LLTOPENCLASS oc
        GROUP BY oc.COSE_ID
      ) courseSchedules ON courseSchedules.COSE_ID = c.COSE_ID
      LEFT JOIN (
        SELECT
          e.COSE_ID,
          COUNT(e.ENROLL_ID) AS learnerCount,
          MAX(COALESCE(e.ENROLL_AMOUNT, 0)) AS unitPrice,
          COALESCE(SUM(COALESCE(e.ENROLL_AMOUNT, 0)), 0) AS registrationFee
        FROM LLTENROLL e
        WHERE COALESCE(e.ENROLL_STATUS, '') <> 'C'
        GROUP BY e.COSE_ID
      ) courseEnrollments ON courseEnrollments.COSE_ID = c.COSE_ID
      LEFT JOIN (
        SELECT
          ci.COSE_ID,
          GROUP_CONCAT(
            DISTINCT COALESCE(
              NULLIF(
                TRIM(CONCAT(
                  COALESCE(p.PRF_NAMETH, ''),
                  COALESCE(p.PSN_FNAMETH, ''),
                  ' ',
                  COALESCE(p.PSN_LNAMETH, '')
                )),
                ''
              ),
              NULLIF(ci.COSEINS_EMAIL, '')
            )
            ORDER BY ci.COSEINS_ID
            SEPARATOR ' | '
          ) AS responsibleNames
        FROM LLTCOURSEINS ci
        LEFT JOIN PSNTPERSON p ON p.PSN_ID = ci.PSN_ID
        WHERE ci.COSEINS_ADMIN = 'Y'
        GROUP BY ci.COSE_ID
      ) responsibleCourses ON responsibleCourses.COSE_ID = c.COSE_ID
    `;
  }

  async getRegistrationStatisticsReport(
    query: CentralFinanceFacultyReportQueryDto,
  ): Promise<CentralFinanceFacultyReportResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const startDate = this.normalizeDateInput(query.startDate);
    const endDate = this.normalizeDateInput(query.endDate);
    const facultyId = query.facultyId && query.facultyId > 0 ? query.facultyId : null;
    const typeCourseId = query.typeCourseId && query.typeCourseId > 0 ? query.typeCourseId : null;
    const feeType = query.feeType;

    const { fromClause, params } = this.buildFromClause(
      startDate,
      endDate,
      facultyId,
      typeCourseId,
      feeType,
    );

    const [summaryRows, itemRows, facultyTotalRows, facultyOptionRows, typeOptionRows] =
      await Promise.all([
        this.dataSource.query<SummaryRow[]>(
          `SELECT
            COUNT(*) AS totalCourses,
            COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
            COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
          ${fromClause}`,
          params,
        ),
        this.dataSource.query<CourseRow[]>(
          `SELECT
            base.courseId, base.courseCode, base.courseName,
            base.facultyId, base.facultyName, base.responsibleName,
            base.startDate, base.endDate,
            base.learnerCount, base.unitPrice, base.registrationFee
          ${fromClause}
          ORDER BY
            base.facultyName ASC,
            COALESCE(base.learnerCount, 0) DESC,
            COALESCE(base.unitPrice, 0) DESC,
            COALESCE(base.registrationFee, 0) DESC,
            base.courseName ASC,
            base.courseId ASC`,
          params,
        ),
        this.dataSource.query<FacultyTotalRow[]>(
          `SELECT
            base.facultyId, base.facultyName,
            COUNT(*) AS totalCourses,
            COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
            COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
          ${fromClause}
          GROUP BY base.facultyId, base.facultyName
          ORDER BY base.facultyName ASC`,
          params,
        ),
        this.dataSource.query<OptionRow[]>(
          `SELECT
            COALESCE(f.FAC_ID, 0) AS id,
            COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน') AS label
          FROM LLTCOURSE c
          LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
          GROUP BY COALESCE(f.FAC_ID, 0), COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')
          ORDER BY label ASC`,
        ),
        this.dataSource.query<OptionRow[]>(
          `SELECT
            COALESCE(tc.TYPECOSE_ID, 0) AS id,
            COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท') AS label
          FROM LLTCOURSE c
          LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
          GROUP BY COALESCE(tc.TYPECOSE_ID, 0), COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')
          ORDER BY label ASC`,
        ),
      ]);

    const summaryRow = summaryRows[0];
    const total = this.toNumber(summaryRow?.totalCourses);
    const facultyTotalsMap = new Map<number, FacultyTotalRow>(
      facultyTotalRows.map((row) => [this.toNumber(row.facultyId), row]),
    );
    const allGroups = this.groupRows(itemRows, facultyTotalsMap);
    const paginatedPages = this.paginateGroups(allGroups, pageSize);
    const totalPages = paginatedPages.length;
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    return {
      generatedAt: new Date().toISOString(),
      filterOptions: {
        faculties: this.mapFilterOptions(facultyOptionRows),
        courseTypes: this.mapFilterOptions(typeOptionRows),
      },
      summary: {
        totalCourses: total,
        totalLearners: this.toNumber(summaryRow?.totalLearners),
        totalRegistrationFees: this.toNumber(summaryRow?.totalRegistrationFees),
      },
      pagination: {
        page: safePage,
        pageSize,
        total: allGroups.length,
        totalPages,
      },
      groups: totalPages === 0 ? [] : (paginatedPages[safePage - 1] ?? []),
    };
  }

  async exportRegistrationStatistics(
    query: CentralFinanceFacultyReportExportQueryDto,
  ): Promise<CentralFinanceFacultyReportExportResponseDto> {
    const startDate = this.normalizeDateInput(query.startDate);
    const endDate = this.normalizeDateInput(query.endDate);
    const facultyId = query.facultyId && query.facultyId > 0 ? query.facultyId : null;
    const typeCourseId = query.typeCourseId && query.typeCourseId > 0 ? query.typeCourseId : null;
    const feeType = query.feeType;

    const { fromClause, params } = this.buildFromClause(
      startDate,
      endDate,
      facultyId,
      typeCourseId,
      feeType,
    );

    const [summaryRows, itemRows, facultyTotalRows, facultyOptionRows, typeOptionRows] =
      await Promise.all([
        this.dataSource.query<SummaryRow[]>(
          `SELECT COUNT(*) AS totalCourses,
            COALESCE(SUM(COALESCE(base.learnerCount,0)),0) AS totalLearners,
            COALESCE(SUM(COALESCE(base.registrationFee,0)),0) AS totalRegistrationFees
          ${fromClause}`,
          params,
        ),
        this.dataSource.query<CourseRow[]>(
          `SELECT base.courseId, base.courseCode, base.courseName,
            base.facultyId, base.facultyName, base.responsibleName,
            base.startDate, base.endDate, base.learnerCount, base.unitPrice, base.registrationFee
          ${fromClause}
          ORDER BY base.facultyName ASC, COALESCE(base.learnerCount,0) DESC,
            COALESCE(base.unitPrice,0) DESC, COALESCE(base.registrationFee,0) DESC,
            base.courseName ASC, base.courseId ASC`,
          params,
        ),
        this.dataSource.query<FacultyTotalRow[]>(
          `SELECT base.facultyId, base.facultyName,
            COUNT(*) AS totalCourses,
            COALESCE(SUM(COALESCE(base.learnerCount,0)),0) AS totalLearners,
            COALESCE(SUM(COALESCE(base.registrationFee,0)),0) AS totalRegistrationFees
          ${fromClause}
          GROUP BY base.facultyId, base.facultyName ORDER BY base.facultyName ASC`,
          params,
        ),
        this.dataSource.query<OptionRow[]>(
          `SELECT COALESCE(f.FAC_ID,0) AS id, COALESCE(NULLIF(f.FAC_NAME,''),'ไม่ระบุคณะ/ส่วนงาน') AS label
          FROM LLTCOURSE c LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
          GROUP BY COALESCE(f.FAC_ID,0), COALESCE(NULLIF(f.FAC_NAME,''),'ไม่ระบุคณะ/ส่วนงาน')
          ORDER BY label ASC`,
        ),
        this.dataSource.query<OptionRow[]>(
          `SELECT COALESCE(tc.TYPECOSE_ID,0) AS id, COALESCE(NULLIF(tc.TYPECOSE_NAME,''),'ไม่ระบุประเภท') AS label
          FROM LLTCOURSE c LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
          GROUP BY COALESCE(tc.TYPECOSE_ID,0), COALESCE(NULLIF(tc.TYPECOSE_NAME,''),'ไม่ระบุประเภท')
          ORDER BY label ASC`,
        ),
      ]);

    const summaryRow = summaryRows[0];
    const facultyTotalsMap = new Map<number, FacultyTotalRow>(
      facultyTotalRows.map((row) => [this.toNumber(row.facultyId), row]),
    );

    const groups: CentralFinanceFacultyReportExportFacultyGroupDto[] = [];
    const groupedRows = new Map<number, CentralFinanceFacultyReportExportFacultyGroupDto>();

    for (const [rowIndex, row] of itemRows.entries()) {
      const fId = this.toNumber(row.facultyId);
      const totals = facultyTotalsMap.get(fId);
      const group =
        groupedRows.get(fId) ??
        ({
          facultyId: fId,
          facultyName: row.facultyName?.trim() || 'ไม่ระบุคณะ/ส่วนงาน',
          totalCourses: this.toNumber(totals?.totalCourses),
          totalLearners: this.toNumber(totals?.totalLearners),
          totalRegistrationFees: this.toNumber(totals?.totalRegistrationFees),
          items: [],
        } satisfies CentralFinanceFacultyReportExportFacultyGroupDto);

      group.items.push(this.mapCourseRow(row, rowIndex + 1));
      if (!groupedRows.has(fId)) {
        groupedRows.set(fId, group);
        groups.push(group);
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      filterOptions: {
        faculties: this.mapFilterOptions(facultyOptionRows),
        courseTypes: this.mapFilterOptions(typeOptionRows),
      },
      summary: {
        totalCourses: this.toNumber(summaryRow?.totalCourses),
        totalLearners: this.toNumber(summaryRow?.totalLearners),
        totalRegistrationFees: this.toNumber(summaryRow?.totalRegistrationFees),
      },
      totalRows: itemRows.length,
      groups,
    };
  }

  private groupRows(
    rows: CourseRow[],
    facultyTotalsMap: Map<number, FacultyTotalRow>,
  ): CentralFinanceFacultyReportFacultyGroupDto[] {
    const groupedRows = new Map<number, CentralFinanceFacultyReportFacultyGroupDto>();

    for (const [rowIndex, row] of rows.entries()) {
      const facultyId = this.toNumber(row.facultyId);
      const totals = facultyTotalsMap.get(facultyId);
      const group =
        groupedRows.get(facultyId) ??
        ({
          facultyId,
          facultyName: row.facultyName?.trim() || 'ไม่ระบุคณะ/ส่วนงาน',
          totalCourses: this.toNumber(totals?.totalCourses),
          totalLearners: this.toNumber(totals?.totalLearners),
          totalRegistrationFees: this.toNumber(totals?.totalRegistrationFees),
          items: [],
        } satisfies CentralFinanceFacultyReportFacultyGroupDto);

      group.items.push(this.mapCourseRow(row, rowIndex + 1));
      groupedRows.set(facultyId, group);
    }

    return Array.from(groupedRows.values());
  }

  private mapCourseRow(
    row: CourseRow,
    rowNumber: number,
  ): CentralFinanceFacultyReportCourseItemDto {
    return {
      rowNumber,
      courseId: this.toNumber(row.courseId),
      courseCode: row.courseCode?.trim() || null,
      courseName: row.courseName?.trim() || `Course #${this.toNumber(row.courseId)}`,
      courseNameEn: row.courseNameEn?.trim() || null,
      responsibleName: row.responsibleName?.trim() || null,
      startDate: this.toIsoString(row.startDate),
      endDate: this.toIsoString(row.endDate),
      learnerCount: this.toNumber(row.learnerCount),
      unitPrice: this.toNumber(row.unitPrice),
      registrationFee: this.toNumber(row.registrationFee),
    };
  }

  private paginateGroups(
    groups: CentralFinanceFacultyReportFacultyGroupDto[],
    pageSize: number,
  ): CentralFinanceFacultyReportFacultyGroupDto[][] {
    if (groups.length === 0) return [];

    const pages: CentralFinanceFacultyReportFacultyGroupDto[][] = [];
    let currentPage: CentralFinanceFacultyReportFacultyGroupDto[] = [];
    let currentPageWeight = 0;

    for (const group of groups) {
      const groupWeight = group.items.length + 2;
      const wouldOverflow = currentPageWeight > 0 && currentPageWeight + groupWeight > pageSize;

      if (wouldOverflow) {
        pages.push(currentPage);
        currentPage = [];
        currentPageWeight = 0;
      }

      currentPage.push(group);
      currentPageWeight += groupWeight;
    }

    if (currentPage.length > 0) pages.push(currentPage);
    return pages;
  }

  private mapFilterOptions(rows: OptionRow[]): CentralFinanceFacultyReportFilterOptionDto[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      label: row.label?.trim() || 'ไม่ระบุ',
    }));
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toIsoString(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private normalizeDateInput(value: string | undefined): string | null {
    const trimmed = value?.trim();
    if (!trimmed) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
}
