import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminInterestedCoursesReportQueryDto } from './dto/admin-interested-courses-report-query.dto';
import {
  AdminInterestedCourseReportItemDto,
  AdminInterestedCoursesReportResponseDto,
} from './dto/admin-interested-courses-report-response.dto';
import { AdminRegistrationStatisticsExportQueryDto } from './dto/admin-registration-statistics-export-query.dto';
import {
  AdminRegistrationStatisticsExportFacultyGroupDto,
  AdminRegistrationStatisticsExportResponseDto,
} from './dto/admin-registration-statistics-export-response.dto';
import { AdminRegistrationStatisticsReportQueryDto } from './dto/admin-registration-statistics-report-query.dto';
import {
  AdminRegistrationStatisticsReportCourseItemDto,
  AdminRegistrationStatisticsReportFacultyGroupDto,
  AdminRegistrationStatisticsReportFilterOptionDto,
  AdminRegistrationStatisticsReportResponseDto,
} from './dto/admin-registration-statistics-report-response.dto';

interface InterestedCourseSummaryRow {
  totalCourses: number | string | null;
  totalViews: number | string | null;
  totalEnrollments: number | string | null;
}

interface InterestedCourseRow {
  courseId: number | string | null;
  courseCode: string | null;
  courseName: string | null;
  responsibleName: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  viewCount: number | string | null;
  enrollmentCount: number | string | null;
}

interface RegistrationStatisticsSummaryRow {
  totalCourses: number | string | null;
  totalLearners: number | string | null;
  totalRegistrationFees: number | string | null;
}

interface RegistrationStatisticsOptionRow {
  id: number | string | null;
  label: string | null;
}

interface RegistrationStatisticsCourseRow {
  courseId: number | string | null;
  courseCode: string | null;
  courseName: string | null;
  facultyId: number | string | null;
  facultyName: string | null;
  responsibleName: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  learnerCount: number | string | null;
  unitPrice: number | string | null;
  registrationFee: number | string | null;
}

interface RegistrationStatisticsFacultyTotalRow {
  facultyId: number | string | null;
  facultyName: string | null;
  totalCourses: number | string | null;
  totalLearners: number | string | null;
  totalRegistrationFees: number | string | null;
}

@Injectable()
export class AdminReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async getRegistrationStatisticsReport(
    query: AdminRegistrationStatisticsReportQueryDto,
  ): Promise<AdminRegistrationStatisticsReportResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const startDate = this.normalizeDateInput(query.startDate);
    const endDate = this.normalizeDateInput(query.endDate);
    const facultyId = query.facultyId && query.facultyId > 0 ? query.facultyId : null;
    const typeCourseId = query.typeCourseId && query.typeCourseId > 0 ? query.typeCourseId : null;
    const feeType = query.feeType;

    const baseRegistrationQuery = `
      SELECT
        c.COSE_ID AS courseId,
        c.COSE_CODE AS courseCode,
        COALESCE(
          NULLIF(c.COSE_NAMETH, ''),
          NULLIF(c.COSE_NAMEEN, ''),
          CONCAT('Course #', c.COSE_ID)
        ) AS courseName,
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
                TRIM(
                  CONCAT(
                    COALESCE(p.PRF_NAMETH, ''),
                    COALESCE(p.PSN_FNAMETH, ''),
                    ' ',
                    COALESCE(p.PSN_LNAMETH, '')
                  )
                ),
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

    const registrationFilters: string[] = [];
    const filterParams: Array<string | number> = [];

    if (startDate) {
      registrationFilters.push('base.startDate >= ?');
      filterParams.push(startDate);
    }

    if (endDate) {
      registrationFilters.push('base.startDate <= ?');
      filterParams.push(endDate);
    }

    if (facultyId !== null) {
      registrationFilters.push('base.facultyId = ?');
      filterParams.push(facultyId);
    }

    if (typeCourseId !== null) {
      registrationFilters.push('base.typeCourseId = ?');
      filterParams.push(typeCourseId);
    }

    if (feeType === 'free') {
      registrationFilters.push(
        'COALESCE(base.unitPrice, 0) = 0 AND COALESCE(base.registrationFee, 0) = 0',
      );
    } else if (feeType === 'paid') {
      registrationFilters.push(
        '(COALESCE(base.unitPrice, 0) > 0 OR COALESCE(base.registrationFee, 0) > 0)',
      );
    }

    const whereClause =
      registrationFilters.length > 0 ? `WHERE ${registrationFilters.join(' AND ')}` : '';
    const filteredBaseFromClause = `
      FROM (
        ${baseRegistrationQuery}
      ) base
      ${whereClause}
    `;

    const [summaryRows, itemRows, facultyTotalRows, facultyOptionRows, typeOptionRows] =
      await Promise.all([
        this.dataSource.query<RegistrationStatisticsSummaryRow[]>(
          `
            SELECT
              COUNT(*) AS totalCourses,
              COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
              COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
            ${filteredBaseFromClause}
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsCourseRow[]>(
          `
            SELECT
              base.courseId,
              base.courseCode,
              base.courseName,
              base.facultyId,
              base.facultyName,
              base.responsibleName,
              base.startDate,
              base.endDate,
              base.learnerCount,
              base.unitPrice,
              base.registrationFee
            ${filteredBaseFromClause}
            ORDER BY
              base.facultyName ASC,
              COALESCE(base.learnerCount, 0) DESC,
              COALESCE(base.unitPrice, 0) DESC,
              COALESCE(base.registrationFee, 0) DESC,
              base.courseName ASC,
              base.courseId ASC
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsFacultyTotalRow[]>(
          `
            SELECT
              base.facultyId,
              base.facultyName,
              COUNT(*) AS totalCourses,
              COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
              COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
            ${filteredBaseFromClause}
            GROUP BY base.facultyId, base.facultyName
            ORDER BY base.facultyName ASC
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsOptionRow[]>(
          `
            SELECT
              COALESCE(f.FAC_ID, 0) AS id,
              COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน') AS label
            FROM LLTCOURSE c
            LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
            GROUP BY COALESCE(f.FAC_ID, 0), COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')
            ORDER BY label ASC
          `,
        ),
        this.dataSource.query<RegistrationStatisticsOptionRow[]>(
          `
            SELECT
              COALESCE(tc.TYPECOSE_ID, 0) AS id,
              COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท') AS label
            FROM LLTCOURSE c
            LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
            GROUP BY COALESCE(tc.TYPECOSE_ID, 0), COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')
            ORDER BY label ASC
          `,
        ),
      ]);

    const summaryRow = summaryRows[0];
    const total = this.toNumber(summaryRow?.totalCourses);
    const facultyTotalsMap = new Map<number, RegistrationStatisticsFacultyTotalRow>(
      facultyTotalRows.map((row) => [this.toNumber(row.facultyId), row]),
    );
    const allGroups = this.groupRegistrationStatisticsRows(itemRows, facultyTotalsMap);
    const paginatedGroupPages = this.paginateRegistrationStatisticsGroups(allGroups, pageSize);
    const totalPages = paginatedGroupPages.length;
    const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages);

    return {
      generatedAt: new Date().toISOString(),
      filterOptions: {
        faculties: this.mapRegistrationFilterOptions(facultyOptionRows),
        courseTypes: this.mapRegistrationFilterOptions(typeOptionRows),
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
      groups: totalPages === 0 ? [] : (paginatedGroupPages[safePage - 1] ?? []),
    };
  }

  async exportRegistrationStatisticsReport(
    query: AdminRegistrationStatisticsExportQueryDto,
  ): Promise<AdminRegistrationStatisticsExportResponseDto> {
    const startDate = this.normalizeDateInput(query.startDate);
    const endDate = this.normalizeDateInput(query.endDate);
    const facultyId = query.facultyId && query.facultyId > 0 ? query.facultyId : null;
    const typeCourseId = query.typeCourseId && query.typeCourseId > 0 ? query.typeCourseId : null;
    const feeType = query.feeType;

    const baseRegistrationQuery = `
      SELECT
        c.COSE_ID AS courseId,
        c.COSE_CODE AS courseCode,
        COALESCE(
          NULLIF(c.COSE_NAMETH, ''),
          NULLIF(c.COSE_NAMEEN, ''),
          CONCAT('Course #', c.COSE_ID)
        ) AS courseName,
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
                TRIM(
                  CONCAT(
                    COALESCE(p.PRF_NAMETH, ''),
                    COALESCE(p.PSN_FNAMETH, ''),
                    ' ',
                    COALESCE(p.PSN_LNAMETH, '')
                  )
                ),
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

    const registrationFilters: string[] = [];
    const filterParams: Array<string | number> = [];

    if (startDate) {
      registrationFilters.push('base.startDate >= ?');
      filterParams.push(startDate);
    }

    if (endDate) {
      registrationFilters.push('base.startDate <= ?');
      filterParams.push(endDate);
    }

    if (facultyId !== null) {
      registrationFilters.push('base.facultyId = ?');
      filterParams.push(facultyId);
    }

    if (typeCourseId !== null) {
      registrationFilters.push('base.typeCourseId = ?');
      filterParams.push(typeCourseId);
    }

    if (feeType === 'free') {
      registrationFilters.push(
        'COALESCE(base.unitPrice, 0) = 0 AND COALESCE(base.registrationFee, 0) = 0',
      );
    } else if (feeType === 'paid') {
      registrationFilters.push(
        '(COALESCE(base.unitPrice, 0) > 0 OR COALESCE(base.registrationFee, 0) > 0)',
      );
    }

    const whereClause =
      registrationFilters.length > 0 ? `WHERE ${registrationFilters.join(' AND ')}` : '';
    const filteredBaseFromClause = `
      FROM (
        ${baseRegistrationQuery}
      ) base
      ${whereClause}
    `;

    const [summaryRows, itemRows, facultyTotalRows, facultyOptionRows, typeOptionRows] =
      await Promise.all([
        this.dataSource.query<RegistrationStatisticsSummaryRow[]>(
          `
            SELECT
              COUNT(*) AS totalCourses,
              COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
              COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
            ${filteredBaseFromClause}
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsCourseRow[]>(
          `
            SELECT
              base.courseId,
              base.courseCode,
              base.courseName,
              base.facultyId,
              base.facultyName,
              base.responsibleName,
              base.startDate,
              base.endDate,
              base.learnerCount,
              base.unitPrice,
              base.registrationFee
            ${filteredBaseFromClause}
            ORDER BY
              base.facultyName ASC,
              COALESCE(base.learnerCount, 0) DESC,
              COALESCE(base.unitPrice, 0) DESC,
              COALESCE(base.registrationFee, 0) DESC,
              base.courseName ASC,
              base.courseId ASC
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsFacultyTotalRow[]>(
          `
            SELECT
              base.facultyId,
              base.facultyName,
              COUNT(*) AS totalCourses,
              COALESCE(SUM(COALESCE(base.learnerCount, 0)), 0) AS totalLearners,
              COALESCE(SUM(COALESCE(base.registrationFee, 0)), 0) AS totalRegistrationFees
            ${filteredBaseFromClause}
            GROUP BY base.facultyId, base.facultyName
            ORDER BY base.facultyName ASC
          `,
          filterParams,
        ),
        this.dataSource.query<RegistrationStatisticsOptionRow[]>(
          `
            SELECT
              COALESCE(f.FAC_ID, 0) AS id,
              COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน') AS label
            FROM LLTCOURSE c
            LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
            GROUP BY COALESCE(f.FAC_ID, 0), COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')
            ORDER BY label ASC
          `,
        ),
        this.dataSource.query<RegistrationStatisticsOptionRow[]>(
          `
            SELECT
              COALESCE(tc.TYPECOSE_ID, 0) AS id,
              COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท') AS label
            FROM LLTCOURSE c
            LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
            GROUP BY COALESCE(tc.TYPECOSE_ID, 0), COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')
            ORDER BY label ASC
          `,
        ),
      ]);

    const summaryRow = summaryRows[0];
    const totalRows = this.toNumber(summaryRow?.totalCourses);
    const facultyTotalsMap = new Map<number, RegistrationStatisticsFacultyTotalRow>(
      facultyTotalRows.map((row) => [this.toNumber(row.facultyId), row]),
    );

    const groups: AdminRegistrationStatisticsExportFacultyGroupDto[] = [];
    const groupedRows = new Map<number, AdminRegistrationStatisticsExportFacultyGroupDto>();

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
        } satisfies AdminRegistrationStatisticsExportFacultyGroupDto);

      group.items.push(this.mapRegistrationStatisticsCourseRow(row, rowIndex + 1));

      if (!groupedRows.has(fId)) {
        groupedRows.set(fId, group);
        groups.push(group);
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      filterOptions: {
        faculties: this.mapRegistrationFilterOptions(facultyOptionRows),
        courseTypes: this.mapRegistrationFilterOptions(typeOptionRows),
      },
      summary: {
        totalCourses: totalRows,
        totalLearners: this.toNumber(summaryRow?.totalLearners),
        totalRegistrationFees: this.toNumber(summaryRow?.totalRegistrationFees),
      },
      totalRows,
      groups,
    };
  }

  async getInterestedCoursesReport(
    query: AdminInterestedCoursesReportQueryDto,
  ): Promise<AdminInterestedCoursesReportResponseDto> {
    const search = query.search?.trim() ?? '';
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const offset = (page - 1) * pageSize;
    const searchPattern = `%${search}%`;

    const baseFromClause = `
      FROM LLTCOURSE c
      LEFT JOIN (
        SELECT
          oc.COSE_ID,
          MIN(oc.OPENCLASS_CLASSSTARTDATE) AS classStartDate,
          MAX(oc.OPENCLASS_CLASSENDDATE) AS classEndDate
        FROM LLTOPENCLASS oc
        GROUP BY oc.COSE_ID
      ) courseSchedules ON courseSchedules.COSE_ID = c.COSE_ID
      LEFT JOIN (
        SELECT
          oc.COSE_ID,
          COUNT(clicks.CLICK_ID) AS viewCount
        FROM LLTOPENCLASS oc
        LEFT JOIN LLTOPENCLASSCLICK clicks ON clicks.OPENCLASS_ID = oc.OPENCLASS_ID
        GROUP BY oc.COSE_ID
      ) courseViews ON courseViews.COSE_ID = c.COSE_ID
      LEFT JOIN (
        SELECT
          e.COSE_ID,
          COUNT(e.ENROLL_ID) AS enrollmentCount
        FROM LLTENROLL e
        GROUP BY e.COSE_ID
      ) courseEnrollments ON courseEnrollments.COSE_ID = c.COSE_ID
      LEFT JOIN (
        SELECT
          ci.COSE_ID,
          GROUP_CONCAT(
            DISTINCT COALESCE(
              NULLIF(
                TRIM(
                  CONCAT(
                    COALESCE(p.PRF_NAMETH, ''),
                    COALESCE(p.PSN_FNAMETH, ''),
                    ' ',
                    COALESCE(p.PSN_LNAMETH, '')
                  )
                ),
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

    const whereClause = search
      ? `
        WHERE (
          COALESCE(c.COSE_CODE, '') LIKE ?
          OR COALESCE(c.COSE_NAMETH, '') LIKE ?
          OR COALESCE(c.COSE_NAMEEN, '') LIKE ?
          OR COALESCE(responsibleCourses.responsibleNames, '') LIKE ?
        )
      `
      : '';

    const filterParams = search ? [searchPattern, searchPattern, searchPattern, searchPattern] : [];

    const [summaryRows, itemRows] = await Promise.all([
      this.dataSource.query<InterestedCourseSummaryRow[]>(
        `
          SELECT
            COUNT(*) AS totalCourses,
            COALESCE(SUM(COALESCE(courseViews.viewCount, 0)), 0) AS totalViews,
            COALESCE(SUM(COALESCE(courseEnrollments.enrollmentCount, 0)), 0) AS totalEnrollments
          ${baseFromClause}
          ${whereClause}
        `,
        filterParams,
      ),
      this.dataSource.query<InterestedCourseRow[]>(
        `
          SELECT
            c.COSE_ID AS courseId,
            c.COSE_CODE AS courseCode,
            COALESCE(
              NULLIF(c.COSE_NAMETH, ''),
              NULLIF(c.COSE_NAMEEN, ''),
              CONCAT('Course #', c.COSE_ID)
            ) AS courseName,
            responsibleCourses.responsibleNames AS responsibleName,
            COALESCE(courseSchedules.classStartDate, c.COSE_STARTDATE) AS startDate,
            COALESCE(courseSchedules.classEndDate, c.COSE_ENDDATE) AS endDate,
            COALESCE(courseViews.viewCount, 0) AS viewCount,
            COALESCE(courseEnrollments.enrollmentCount, 0) AS enrollmentCount
          ${baseFromClause}
          ${whereClause}
          ORDER BY
            COALESCE(courseViews.viewCount, 0) DESC,
            COALESCE(courseEnrollments.enrollmentCount, 0) DESC,
            courseName ASC,
            c.COSE_ID ASC
          LIMIT ?
          OFFSET ?
        `,
        [...filterParams, pageSize, offset],
      ),
    ]);

    const summaryRow = summaryRows[0];
    const total = this.toNumber(summaryRow?.totalCourses);
    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCourses: total,
        totalViews: this.toNumber(summaryRow?.totalViews),
        totalEnrollments: this.toNumber(summaryRow?.totalEnrollments),
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      items: itemRows.map((row) => this.mapInterestedCourseRow(row)),
    };
  }

  private mapInterestedCourseRow(row: InterestedCourseRow): AdminInterestedCourseReportItemDto {
    return {
      courseId: this.toNumber(row.courseId),
      courseCode: row.courseCode,
      courseName: row.courseName?.trim() || `Course #${this.toNumber(row.courseId)}`,
      responsibleName: row.responsibleName?.trim() || null,
      startDate: this.toIsoString(row.startDate),
      endDate: this.toIsoString(row.endDate),
      viewCount: this.toNumber(row.viewCount),
      enrollmentCount: this.toNumber(row.enrollmentCount),
    };
  }

  private groupRegistrationStatisticsRows(
    rows: RegistrationStatisticsCourseRow[],
    facultyTotalsMap: Map<number, RegistrationStatisticsFacultyTotalRow>,
  ): AdminRegistrationStatisticsReportFacultyGroupDto[] {
    const groupedRows = new Map<number, AdminRegistrationStatisticsReportFacultyGroupDto>();

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
        } satisfies AdminRegistrationStatisticsReportFacultyGroupDto);

      group.items.push(this.mapRegistrationStatisticsCourseRow(row, rowIndex + 1));
      groupedRows.set(facultyId, group);
    }

    return Array.from(groupedRows.values());
  }

  private mapRegistrationStatisticsCourseRow(
    row: RegistrationStatisticsCourseRow,
    rowNumber: number,
  ): AdminRegistrationStatisticsReportCourseItemDto {
    return {
      rowNumber,
      courseId: this.toNumber(row.courseId),
      courseCode: row.courseCode?.trim() || null,
      courseName: row.courseName?.trim() || `Course #${this.toNumber(row.courseId)}`,
      responsibleName: row.responsibleName?.trim() || null,
      startDate: this.toIsoString(row.startDate),
      endDate: this.toIsoString(row.endDate),
      learnerCount: this.toNumber(row.learnerCount),
      unitPrice: this.toNumber(row.unitPrice),
      registrationFee: this.toNumber(row.registrationFee),
    };
  }

  private paginateRegistrationStatisticsGroups(
    groups: AdminRegistrationStatisticsReportFacultyGroupDto[],
    pageSize: number,
  ): AdminRegistrationStatisticsReportFacultyGroupDto[][] {
    if (groups.length === 0) {
      return [];
    }

    const pages: AdminRegistrationStatisticsReportFacultyGroupDto[][] = [];
    let currentPage: AdminRegistrationStatisticsReportFacultyGroupDto[] = [];
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

    if (currentPage.length > 0) {
      pages.push(currentPage);
    }

    return pages;
  }

  private mapRegistrationFilterOptions(
    rows: RegistrationStatisticsOptionRow[],
  ): AdminRegistrationStatisticsReportFilterOptionDto[] {
    return rows.map((row) => ({
      id: this.toNumber(row.id),
      label: row.label?.trim() || 'ไม่ระบุ',
    }));
  }

  private toNumber(value: number | string | null | undefined): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toIsoString(value: Date | string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private normalizeDateInput(value: string | undefined): string | null {
    const trimmedValue = value?.trim();
    if (!trimmedValue) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const slashDateMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!slashDateMatch) {
      return null;
    }

    const [, day, month, year] = slashDateMatch;
    return `${year}-${month}-${day}`;
  }
}
