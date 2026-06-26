import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MoodleService } from '../../moodle/moodle.service';
import { AdminCoursesQueryDto } from './dto/admin-courses-query.dto';
import {
  AdminCourseDetailChapterDto,
  AdminCourseDetailDto,
  AdminCourseItemDto,
  AdminCoursesFilterOptionDto,
  AdminCoursesResponseDto,
  CourseFileDto,
  CourseStutypeFeeDto,
} from './dto/admin-courses-response.dto';
import {
  AdminCourseFormOptionsDto,
  ChapterTypeFormOptionDto,
  CostplanFormOptionDto,
  CourseFormOptionDto,
  StudentTypeFormOptionDto,
  SubcategoryFormOptionDto,
  TargetFormOptionDto,
  SubtargetFormOptionDto,
} from './dto/admin-course-form-options.dto';
import { CreateAdminCourseDto } from './dto/create-admin-course.dto';

export interface CourseFileData {
  filename: string;
  filenameGen: string;
  size: string;
  path: string;
  url: string;
}

interface AdminCourseRow {
  courseId: number | string | null;
  courseCode: string | null;
  titleTh: string | null;
  titleEn: string | null;
  facultyId: number | string | null;
  facultyName: string | null;
  typeCourseId: number | string | null;
  typeCourseName: string | null;
  responsibleName: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
}

interface CountRow {
  total: number | string | null;
}

interface FilterOptionRow {
  id: number | string | null;
  label: string | null;
}

interface CourseFormOptionRow {
  id: number | string | null;
  label: string | null;
}

interface SubcategoryFormOptionRow extends CourseFormOptionRow {
  categoryId: number | string | null;
}

interface TargetFormOptionRow extends CourseFormOptionRow {
  isOther: string | null;
  seq: number | string | null;
}

interface SubtargetFormOptionRow extends TargetFormOptionRow {
  targetId: number | string | null;
}

interface AdminCourseDetailRow {
  COSE_ID: number | string;
  COSE_CODE: string | null;
  COSE_NAMETH: string | null;
  COSE_NAMEEN: string | null;
  COSE_OBJECTIVE: string | null;
  COSE_DESCRIPTION: string | null;
  COSE_IMAGE_URL: string | null;
  COSE_IMAGE_CROP: string | null;
  FAC_ID: number | string | null;
  TYPECOSE_ID: number | string | null;
  COSE_CREDITBANK: number | string | null;
  COSE_THEORYHOUR: number | string | null;
  COSE_ACTIONHOUR: number | string | null;
  TYPESTUDY_ID: number | string | null;
  COSE_STARTDATE: Date | string | null;
  COSE_ENDDATE: Date | string | null;
  CATEGORY_ID: number | string | null;
  SUBCATEGORY_ID: number | string | null;
  COSE_LO: string | null;
  COSE_KEYWORD: string | null;
  COSE_PRIVILEGE: string | null;
  COSE_REMARKCHAPTER: string | null;
  COSE_PROPERTY: string | null;
  COSE_EVALUATION: string | null;
  COSE_COMPETENCY: string | null;
  COSE_PRECONDITION: string | null;
  COSE_STATUS: string | null;
  OPENCLASS_PUBLIC: string | null;
  LMS_STATUS: string | null;
  LMS_ID: number | string | null;
  COSE_CERTIFICATE: string | null;
  COSE_CERTIFICATENAME: string | null;
  COSE_CONTRACTNAME: string | null;
  COSE_CONTRACTTEL: string | null;
  COSE_CONTRACTEMAIL: string | null;
  COSE_CONTRACTURL: string | null;
  OPENCLASS_ID: number | string | null;
  OPENCLASS_REGSTARTDATE: Date | string | null;
  OPENCLASS_REGENDDATE: Date | string | null;
  OPENCLASS_NUMOPEN: number | string | null;
  OPENCLASS_VDO: string | null;
  TYPECLASS_ID: number | string | null;
  COSETYPECLASS_AMOUNT: number | string | null;
  COSETYPECLASS_REMARK: string | null;
  COSTPLAN_ID: number | string | null;
}

@Injectable()
export class AdminCoursesService {
  private readonly logger = new Logger(AdminCoursesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly moodleService: MoodleService,
  ) {}

  async findAll(query: AdminCoursesQueryDto): Promise<AdminCoursesResponseDto> {
    const page = Math.max(query.page ?? 1, 1);
    const pageSize = Math.max(query.pageSize ?? 10, 1);
    const offset = (page - 1) * pageSize;

    const courseName = query.courseName?.trim() || null;
    const facultyId = query.facultyId && query.facultyId > 0 ? query.facultyId : null;
    const typeCourseId = query.typeCourseId && query.typeCourseId > 0 ? query.typeCourseId : null;
    const search = query.search?.trim() || null;
    const feeType = query.feeType ?? null;

    const baseQuery = `
      SELECT
        c.COSE_ID                                                              AS courseId,
        c.COSE_CODE                                                            AS courseCode,
        COALESCE(NULLIF(c.COSE_NAMETH, ''), NULLIF(c.COSE_NAMEEN, ''), CONCAT('Course #', c.COSE_ID)) AS titleTh,
        c.COSE_NAMEEN                                                          AS titleEn,
        COALESCE(f.FAC_ID, 0)                                                  AS facultyId,
        COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')                AS facultyName,
        COALESCE(tc.TYPECOSE_ID, 0)                                            AS typeCourseId,
        COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')               AS typeCourseName,
        rc.responsibleNames                                                    AS responsibleName,
        c.COSE_STARTDATE                                                       AS startDate,
        c.COSE_ENDDATE                                                         AS endDate,
        COALESCE(oc.OPENCLASS_AMOUNT, 0)                                       AS classFee
      FROM LLTCOURSE c
      LEFT JOIN LLTFACULTY f      ON f.FAC_ID        = c.FAC_ID
      LEFT JOIN LLTTYPECOURSE tc  ON tc.TYPECOSE_ID  = c.TYPECOSE_ID
      LEFT JOIN LLTOPENCLASS oc   ON oc.COSE_ID       = c.COSE_ID
      LEFT JOIN (
        SELECT
          ci.COSE_ID,
          GROUP_CONCAT(
            DISTINCT COALESCE(
              NULLIF(TRIM(CONCAT_WS(' ',
                NULLIF(p.PRF_NAMETH, ''),
                NULLIF(p.PSN_FNAMETH, ''),
                NULLIF(p.PSN_LNAMETH, '')
              )), ''),
              NULLIF(TRIM(CONCAT(
                COALESCE(u.USER_FNAMETH, ''),
                ' ',
                COALESCE(u.USER_LNAMETH, '')
              )), ''),
              NULLIF(ci.COSEINS_EMAIL, '')
            )
            ORDER BY ci.COSEINS_ID
            SEPARATOR ' | '
          ) AS responsibleNames
        FROM LLTCOURSEINS ci
        LEFT JOIN PSNTPERSON p ON p.PSN_ID = ci.PSN_ID
        LEFT JOIN LLTUMUSER u ON u.USER_EMAIL = ci.COSEINS_EMAIL
                              OR u.USER_USERNAME = ci.COSEINS_EMAIL
        WHERE ci.COSEINS_ADMIN = 'Y'
        GROUP BY ci.COSE_ID
      ) rc ON rc.COSE_ID = c.COSE_ID
    `;

    const filters: string[] = [];
    const params: Array<string | number> = [];

    if (courseName) {
      filters.push('base.titleTh LIKE ?');
      params.push(`%${courseName}%`);
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
      filters.push('COALESCE(base.classFee, 0) = 0');
    } else if (feeType === 'paid') {
      filters.push('COALESCE(base.classFee, 0) > 0');
    }

    if (search) {
      filters.push(`(
        base.titleTh        LIKE ? OR
        base.titleEn        LIKE ? OR
        base.courseCode     LIKE ? OR
        base.facultyName    LIKE ? OR
        base.typeCourseName LIKE ? OR
        base.responsibleName LIKE ?
      )`);
      const like = `%${search}%`;
      params.push(like, like, like, like, like, like);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
    const fromClause = `FROM (${baseQuery}) base ${whereClause}`;

    const [countRows, itemRows, facultyOptionRows, typeOptionRows] = await Promise.all([
      this.dataSource.query<CountRow[]>(`SELECT COUNT(*) AS total ${fromClause}`, params),
      this.dataSource.query<AdminCourseRow[]>(
        `SELECT * ${fromClause} ORDER BY base.facultyName ASC, base.titleTh ASC LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
      ),
      this.dataSource.query<FilterOptionRow[]>(`
        SELECT
          COALESCE(f.FAC_ID, 0)                                          AS id,
          COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')        AS label
        FROM LLTCOURSE c
        LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
        GROUP BY COALESCE(f.FAC_ID, 0), COALESCE(NULLIF(f.FAC_NAME, ''), 'ไม่ระบุคณะ/ส่วนงาน')
        ORDER BY label ASC
      `),
      this.dataSource.query<FilterOptionRow[]>(`
        SELECT
          COALESCE(tc.TYPECOSE_ID, 0)                                    AS id,
          COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')        AS label
        FROM LLTCOURSE c
        LEFT JOIN LLTTYPECOURSE tc ON tc.TYPECOSE_ID = c.TYPECOSE_ID
        GROUP BY COALESCE(tc.TYPECOSE_ID, 0), COALESCE(NULLIF(tc.TYPECOSE_NAME, ''), 'ไม่ระบุประเภท')
        ORDER BY label ASC
      `),
    ]);

    const total = Number(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items: itemRows.map((row) => this.mapCourseRow(row)),
      filterOptions: {
        faculties: this.mapFilterOptions(facultyOptionRows),
        courseTypes: this.mapFilterOptions(typeOptionRows),
      },
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async findOne(courseId: number): Promise<AdminCourseDetailDto | null> {
    const toDateStr = (v: unknown): string | null => {
      if (!v) return null;
      const d = new Date(v as string);
      return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
    };

    const [courseRows, instructorRows, targetRows, skillRows, chapRows, subRows, fileRows] =
      await Promise.all([
        this.dataSource.query<AdminCourseDetailRow[]>(
          `SELECT c.COSE_ID, c.COSE_CODE, c.COSE_NAMETH, c.COSE_NAMEEN, c.COSE_OBJECTIVE, c.COSE_DESCRIPTION,
                  c.COSE_IMAGE_URL, c.COSE_IMAGE_CROP, c.FAC_ID, c.TYPECOSE_ID, c.COSE_CREDITBANK,
                  c.COSE_THEORYHOUR, c.COSE_ACTIONHOUR, c.TYPESTUDY_ID,
                  c.COSE_STARTDATE, c.COSE_ENDDATE,
                  c.CATEGORY_ID, c.SUBCATEGORY_ID,
                  c.COSE_LO, c.COSE_KEYWORD, c.COSE_PRIVILEGE,
                  c.COSE_REMARKCHAPTER, c.COSE_PROPERTY, c.COSE_EVALUATION, c.COSE_COMPETENCY,
                  c.COSE_PRECONDITION, c.COSE_STATUS, c.COSE_CERTIFICATE, c.COSE_CERTIFICATENAME,
                  c.COSE_CONTRACTNAME, c.COSE_CONTRACTTEL, c.COSE_CONTRACTEMAIL, c.COSE_CONTRACTURL,
                  oc.OPENCLASS_ID, oc.OPENCLASS_REGSTARTDATE, oc.OPENCLASS_REGENDDATE, oc.OPENCLASS_NUMOPEN,
                  oc.OPENCLASS_PUBLIC, oc.LMS_STATUS, oc.LMS_ID, oc.OPENCLASS_VDO,
                  tc.TYPECLASS_ID, tc.COSETYPECLASS_AMOUNT, tc.COSETYPECLASS_REMARK,
                  oc.COSTPLAN_ID
           FROM LLTCOURSE c
           LEFT JOIN LLTOPENCLASS oc ON oc.COSE_ID = c.COSE_ID
           LEFT JOIN LLTCOURSETYPECLASS tc ON tc.COSE_ID = c.COSE_ID
           WHERE c.COSE_ID = ?
           LIMIT 1`,
          [courseId],
        ),
        this.dataSource.query<{ username: string | null; email: string | null }[]>(
          `SELECT NULL AS username, COSEINS_EMAIL AS email
           FROM LLTCOURSEINS WHERE COSE_ID = ? ORDER BY COSEINS_ID`,
          [courseId],
        ),
        this.dataSource.query<
          { targetId: number; subtargetId: number | null; other: string | null }[]
        >(
          `SELECT TARGET_ID AS targetId, SUBTARGET_ID AS subtargetId, COSETARGET_OTHER AS \`other\`
           FROM LLTCOURSETARGET WHERE COSE_ID = ? ORDER BY TARGET_ID`,
          [courseId],
        ),
        this.dataSource.query<{ skillId: number; weight: number }[]>(
          `SELECT SKILL_ID AS skillId, SKILL_WEIGHT AS weight FROM LLTCOURSESKILL WHERE COSE_ID = ? ORDER BY SKILL_ID`,
          [courseId],
        ),
        this.dataSource.query<
          {
            chapterId: number;
            name: string;
            hour: number | null;
            seq: number;
            typeId: number | null;
            typeOther: string | null;
          }[]
        >(
          `SELECT ch.COSECHAP_ID AS chapterId, ch.COSECHAP_SUBJECT AS name,
                  ch.COSECHAP_HOUR AS hour, ch.COSECHAP_SEQ AS seq,
                  ct.TYPECHAP_ID AS typeId, ct.COSECHAPTYPE_OTHER AS typeOther
           FROM LLTCOURSECHAPTER ch
           LEFT JOIN LLTCOURSECHAPTERTYPE ct ON ct.COSECHAP_ID = ch.COSECHAP_ID
           WHERE ch.COSE_ID = ? ORDER BY ch.COSECHAP_SEQ`,
          [courseId],
        ),
        this.dataSource.query<{ chapterId: number; subject: string }[]>(
          `SELECT sub.COSECHAP_ID AS chapterId, sub.COSESUBCHAP_SUBJECT AS subject
           FROM LLTCOURSESUBCHAPTER sub
           INNER JOIN LLTCOURSECHAPTER ch ON ch.COSECHAP_ID = sub.COSECHAP_ID
           WHERE ch.COSE_ID = ? ORDER BY sub.COSECHAP_ID, sub.COSESUBCHAP_SEQ`,
          [courseId],
        ),
        this.dataSource.query<{ fileId: number; fileUrl: string; fileName: string }[]>(
          `SELECT COSEFILE_ID AS fileId, COSEFILE_URL AS fileUrl, COSEFILE_NAME AS fileName
           FROM LLTCOURSEFILE WHERE COSE_ID = ? ORDER BY COSEFILE_ID`,
          [courseId],
        ),
      ]);

    if (!courseRows.length) return null;
    const c = courseRows[0];

    const openclassIdForFees = c['OPENCLASS_ID'] ? Number(c['OPENCLASS_ID']) : null;
    const feeRows = openclassIdForFees
      ? await this.dataSource.query<
          { stutypeId: number; stutypeName: string; amount: number | null }[]
        >(
          `SELECT f.STUTYPE_ID AS stutypeId, st.STUTYPE_NAME AS stutypeName, f.STUTYPE_AMOUNT AS amount
           FROM LLTOPENCLASSSTUTYPEFEE f
           JOIN LLTTYPESTUDENT st ON st.STUTYPE_ID = f.STUTYPE_ID
           WHERE f.OPENCLASS_ID = ? ORDER BY f.STUTYPE_ID`,
          [openclassIdForFees],
        )
      : [];

    const subsByChap = new Map<number, string[]>();
    for (const s of subRows) {
      const arr = subsByChap.get(s.chapterId) ?? [];
      arr.push(s.subject);
      subsByChap.set(s.chapterId, arr);
    }

    const chapters: AdminCourseDetailChapterDto[] = chapRows.map((ch) => ({
      subject: ch.name,
      hour: ch.hour,
      chapterTypeId: ch.typeId,
      chapterTypeOther: ch.typeOther,
      subchapters: (subsByChap.get(ch.chapterId) ?? []).map((s) => ({ subject: s })),
    }));

    return {
      courseId: Number(c['COSE_ID']),
      courseCode: c['COSE_CODE'] ?? null,
      nameTh: c['COSE_NAMETH'] ?? '',
      nameEn: c['COSE_NAMEEN'] ?? '',
      summary: c['COSE_OBJECTIVE'] ?? null,
      description: c['COSE_DESCRIPTION'] ?? null,
      files: fileRows.map(
        (f): CourseFileDto => ({
          fileId: Number(f.fileId),
          fileUrl: f.fileUrl,
          fileName: f.fileName,
        }),
      ),
      imageUrl: c['COSE_IMAGE_URL'] ?? null,
      imageCrop: c['COSE_IMAGE_CROP'] ?? null,
      facultyId: c['FAC_ID'] ? Number(c['FAC_ID']) : null,
      typeCourseId: c['TYPECOSE_ID'] ? Number(c['TYPECOSE_ID']) : null,
      creditBank: c['COSE_CREDITBANK'] ? String(c['COSE_CREDITBANK']) : null,
      theoryHours: c['COSE_THEORYHOUR'] ? Number(c['COSE_THEORYHOUR']) : null,
      practiceHours: c['COSE_ACTIONHOUR'] ? Number(c['COSE_ACTIONHOUR']) : null,
      studyTypeId: c['TYPESTUDY_ID'] ? Number(c['TYPESTUDY_ID']) : null,
      skillWeights: skillRows.map((s) => ({ skillId: s.skillId, weight: Number(s.weight) })),
      startDate: toDateStr(c['COSE_STARTDATE']),
      endDate: toDateStr(c['COSE_ENDDATE']),
      categoryId: c['CATEGORY_ID'] ? Number(c['CATEGORY_ID']) : null,
      subcategoryId: c['SUBCATEGORY_ID'] ? Number(c['SUBCATEGORY_ID']) : null,
      targets: targetRows,
      classTypeId: c['TYPECLASS_ID'] ? Number(c['TYPECLASS_ID']) : null,
      classFee: c['COSETYPECLASS_AMOUNT'] ? Number(c['COSETYPECLASS_AMOUNT']) : null,
      classFeeRemark: c['COSETYPECLASS_REMARK'] ?? null,
      lo: c['COSE_LO'] ?? null,
      keyword: c['COSE_KEYWORD'] ?? null,
      privilege: c['COSE_PRIVILEGE'] ?? null,
      remarkChapter: c['COSE_REMARKCHAPTER'] ?? null,
      property: c['COSE_PROPERTY'] ?? null,
      evaluation: c['COSE_EVALUATION'] ?? null,
      competency: c['COSE_COMPETENCY'] ?? null,
      precondition: c['COSE_PRECONDITION'] ?? null,
      status: (c['COSE_STATUS'] ?? 'N') as 'Y' | 'N',
      published: (c['OPENCLASS_PUBLIC'] ?? 'N') as 'Y' | 'N',
      moodleSyncStatus: (c['LMS_STATUS'] ?? 'N') as 'Y' | 'N',
      moodleCourseId: c['LMS_ID'] ? Number(c['LMS_ID']) : null,
      certificate: c['COSE_CERTIFICATE'] ?? null,
      certificateName: c['COSE_CERTIFICATENAME'] ?? null,
      registrationStart: toDateStr(c['OPENCLASS_REGSTARTDATE']),
      registrationEnd: toDateStr(c['OPENCLASS_REGENDDATE']),
      maxSeats: c['OPENCLASS_NUMOPEN'] ? Number(c['OPENCLASS_NUMOPEN']) : null,
      contactName: c['COSE_CONTRACTNAME'] ?? null,
      contactTel: c['COSE_CONTRACTTEL'] ?? null,
      contactEmail: c['COSE_CONTRACTEMAIL'] ?? null,
      contactUrl: c['COSE_CONTRACTURL'] ?? null,
      vdo: c['OPENCLASS_VDO'] ?? null,
      instructors: instructorRows,
      chapters,
      costplanId: c['COSTPLAN_ID'] ? Number(c['COSTPLAN_ID']) : null,
      stutypeFees: feeRows.map(
        (r): CourseStutypeFeeDto => ({
          stutypeId: Number(r.stutypeId),
          stutypeName: r.stutypeName,
          amount: r.amount !== null ? Number(r.amount) : null,
        }),
      ),
    };
  }

  async getFormOptions(): Promise<AdminCourseFormOptionsDto> {
    const toCourseFormOption = (row: CourseFormOptionRow): CourseFormOptionDto => ({
      id: Number(row.id),
      label: row.label ?? '',
    });

    const [
      faculties,
      courseTypes,
      studyTypes,
      classTypes,
      skills,
      categories,
      subcategories,
      targets,
      subtargets,
      chapterTypes,
      studentTypes,
      costplans,
    ] = await Promise.all([
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT FAC_ID AS id, FAC_NAME AS label FROM LLTFACULTY WHERE FAC_ACTIVE = 'Y' ORDER BY FAC_SEQ`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT TYPECOSE_ID AS id, TYPECOSE_NAME AS label FROM LLTTYPECOURSE ORDER BY TYPECOSE_ID`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT TYPESTUDY_ID AS id, TYPESTUDY_NAME AS label FROM LLTTYPESTUDY ORDER BY TYPESTUDY_ID`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT TYPECLASS_ID AS id, TYPECLASS_NAME AS label FROM LLTTYPECLASS ORDER BY TYPECLASS_ID`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT SKILL_ID AS id, SKILL_NAME AS label FROM LLTSKILL ORDER BY SKILL_ID`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT CATEGORY_ID AS id, CATEGORY_NAME AS label FROM LLTCATEGORY WHERE CATEGORY_ACTIVE = 'Y' ORDER BY CATEGORY_ID`,
      ),
      this.dataSource.query<SubcategoryFormOptionRow[]>(
        `SELECT SUBCATEGORY_ID AS id, SUBCATEGORY_NAME AS label, CATEGORY_ID AS categoryId FROM LLTSUBCATEGORY WHERE SUBCATEGORY_ACTIVE = 'Y' ORDER BY CATEGORY_ID, SUBCATEGORY_ID`,
      ),
      this.dataSource.query<TargetFormOptionRow[]>(
        `SELECT TARGET_ID AS id, TARGET_NAME AS label, TARGET_OTHER AS isOther, TARGET_SEQ AS seq FROM LLTTARGET ORDER BY TARGET_SEQ`,
      ),
      this.dataSource.query<SubtargetFormOptionRow[]>(
        `SELECT SUBTARGET_ID AS id, TARGET_ID AS targetId, SUBTARGET_NAME AS label, SUBTARGET_OTHER AS isOther, SUBTARGET_SEQ AS seq FROM LLTSUBTARGET ORDER BY TARGET_ID, SUBTARGET_SEQ`,
      ),
      this.dataSource.query<(CourseFormOptionRow & { isOther: string | null })[]>(
        `SELECT TYPECHAP_ID AS id, TYPECHAP_NAME AS label, TYPECHAP_OTHER AS isOther FROM LLTTYPECHAPTER ORDER BY TYPECHAP_ID`,
      ),
      this.dataSource.query<CourseFormOptionRow[]>(
        `SELECT STUTYPE_ID AS id, STUTYPE_NAME AS label FROM LLTTYPESTUDENT WHERE STUTYPE_STATUS = 'Y' ORDER BY STUTYPE_ID`,
      ),
      this.dataSource.query<
        { id: number | string; code: string | null; label: string | null; isUsed: number }[]
      >(
        `SELECT COSTPLAN_ID AS id, COSTPLAN_CODE AS code, COSTPLAN_NAME AS label,
                (SELECT CASE WHEN COUNT(*) > 0 THEN 1 ELSE 0 END FROM LLTOPENCLASS WHERE COSTPLAN_ID = LLTCOSTPLAN.COSTPLAN_ID) AS isUsed
         FROM LLTCOSTPLAN WHERE COSTPLAN_STATUS = 'Y' ORDER BY COSTPLAN_CODE`,
      ),
    ]);

    const subtargetsByTarget = new Map<number, SubtargetFormOptionDto[]>();
    for (const s of subtargets) {
      const tid = Number(s.targetId);
      if (!subtargetsByTarget.has(tid)) subtargetsByTarget.set(tid, []);
      subtargetsByTarget.get(tid)!.push({
        id: Number(s.id),
        targetId: tid,
        label: s.label ?? '',
        isOther: s.isOther === 'Y',
        seq: Number(s.seq),
      });
    }

    return {
      faculties: faculties.map(toCourseFormOption),
      courseTypes: courseTypes.map(toCourseFormOption),
      studyTypes: studyTypes.map(toCourseFormOption),
      classTypes: classTypes.map(toCourseFormOption),
      skills: skills.map(toCourseFormOption),
      categories: categories.map(toCourseFormOption),
      subcategories: subcategories.map(
        (row): SubcategoryFormOptionDto => ({
          id: Number(row.id),
          label: row.label ?? '',
          categoryId: Number(row.categoryId),
        }),
      ),
      targets: targets.map(
        (row): TargetFormOptionDto => ({
          id: Number(row.id),
          label: row.label ?? '',
          isOther: row.isOther === 'Y',
          seq: Number(row.seq),
          subtargets: subtargetsByTarget.get(Number(row.id)) ?? [],
        }),
      ),
      chapterTypes: chapterTypes.map(
        (row): ChapterTypeFormOptionDto => ({
          id: Number(row.id),
          label: row.label ?? '',
          isOther: (row as { isOther: string | null }).isOther === 'Y',
        }),
      ),
      studentTypes: studentTypes.map(
        (row): StudentTypeFormOptionDto => ({
          id: Number(row.id),
          label: row.label ?? '',
        }),
      ),
      costplans: costplans.map(
        (row): CostplanFormOptionDto => ({
          id: Number(row.id),
          code: row.code ?? '',
          label: row.label ?? '',
          isUsed: Boolean(Number(row.isUsed ?? 0)),
        }),
      ),
    };
  }

  async searchInstructors(
    q: string,
  ): Promise<{ username: string; email: string; fullName: string }[]> {
    if (!q || q.trim().length < 2) return [];
    const like = `%${q.trim()}%`;
    const rows = await this.dataSource.query<
      {
        username: string | null;
        email: string | null;
        fullName: string | null;
      }[]
    >(
      `SELECT
        a.USERNAME AS username,
        a.EMAIL    AS email,
        TRIM(CONCAT(COALESCE(u.USER_FNAMETH, ''), ' ', COALESCE(u.USER_LNAMETH, ''))) AS fullName
      FROM LLT_AUTH_USERS a
      LEFT JOIN LLTUMUSER u ON u.USER_USERNAME = a.USERNAME
      WHERE a.ROLE = 'Instructor'
        AND (a.EMAIL LIKE ? OR u.USER_FNAMETH LIKE ? OR u.USER_LNAMETH LIKE ?
             OR CONCAT(COALESCE(u.USER_FNAMETH,''),' ',COALESCE(u.USER_LNAMETH,'')) LIKE ?)
      LIMIT 20`,
      [like, like, like, like],
    );
    return rows.map((r) => ({
      username: r.username ?? '',
      email: r.email ?? '',
      fullName: r.fullName?.trim() || r.email || r.username || '',
    }));
  }

  private async resolveMoodleCategoryId(
    categoryId: number,
    subcategoryId?: number,
  ): Promise<string> {
    const defaultId = this.configService.get<string>('MOODLE_DEFAULT_CATEGORY_ID') ?? '1';
    if (subcategoryId) {
      const subRows = await this.dataSource.query<{ lmsId: number | null }[]>(
        `SELECT LMS_ID AS lmsId FROM LLTSUBCATEGORY WHERE SUBCATEGORY_ID = ?`,
        [subcategoryId],
      );
      const subLmsId = subRows[0]?.lmsId;
      if (subLmsId) return String(subLmsId);
    }
    const rows = await this.dataSource.query<{ lmsId: number | null }[]>(
      `SELECT LMS_ID AS lmsId FROM LLTCATEGORY WHERE CATEGORY_ID = ?`,
      [categoryId],
    );
    const lmsId = rows[0]?.lmsId;
    return lmsId ? String(lmsId) : defaultId;
  }

  private async generateCourseCode(
    facultyId: number,
    typeCourseId: number | undefined,
  ): Promise<string> {
    const yy = new Date().getFullYear().toString().slice(-2);
    const ff = String(facultyId).padStart(2, '0');
    const x = typeCourseId ? String(typeCourseId).slice(-1) : '0';
    const prefix = `C${yy}${ff}${x}`;

    const rows = await this.dataSource.query<{ maxSeq: string | null }[]>(
      `SELECT MAX(CAST(SUBSTRING(COSE_CODE, 7) AS UNSIGNED)) AS maxSeq
       FROM LLTCOURSE WHERE COSE_CODE LIKE ?`,
      [`${prefix}%`],
    );
    const next = Number(rows[0]?.maxSeq ?? 0) + 1;
    return `${prefix}${String(next).padStart(2, '0')}`;
  }

  async create(dto: CreateAdminCourseDto, files?: CourseFileData[]): Promise<{ courseId: number }> {
    const createUser = dto.createUser ?? 'ADMIN';
    const totalHours = (dto.theoryHours ?? 0) + (dto.practiceHours ?? 0);
    const courseCode = await this.generateCourseCode(dto.facultyId, dto.typeCourseId);

    const year = dto.startDate ? String(new Date(dto.startDate).getFullYear() + 543) : null;
    const creditBank = dto.typeCourseId === 2 && dto.creditBank ? parseFloat(dto.creditBank) : null;

    const result = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTCOURSE (
        COSE_CODE, COSE_NAMETH, COSE_NAMEEN, COSE_OBJECTIVE, COSE_DESCRIPTION, COSE_IMAGE_URL, COSE_IMAGE_CROP, FAC_ID, TYPECOSE_ID,
        COSE_HOUR, COSE_THEORYHOUR, COSE_ACTIONHOUR, COSE_CREDITBANK,
        TYPESTUDY_ID, COSE_STARTDATE, COSE_ENDDATE, COSE_YEAR,
        CATEGORY_ID, SUBCATEGORY_ID,
        COSE_LO, COSE_KEYWORD, COSE_PRIVILEGE,
        COSE_REMARKCHAPTER, COSE_PROPERTY, COSE_EVALUATION, COSE_COMPETENCY,
        COSE_PRECONDITION, COSE_CERTIFICATE, COSE_CERTIFICATENAME,
        COSE_CONTRACTNAME, COSE_CONTRACTTEL, COSE_CONTRACTEMAIL, COSE_CONTRACTURL,
        COSE_STATUS, CREATEUSER, CREATEDATE
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N', ?, NOW())`,
      [
        courseCode,
        dto.nameTh,
        dto.nameEn,
        dto.summary ?? null,
        dto.description ?? null,
        dto.imageUrl ?? null,
        dto.imageCrop ?? null,
        dto.facultyId,
        dto.typeCourseId ?? null,
        totalHours || null,
        dto.theoryHours ?? null,
        dto.practiceHours ?? null,
        creditBank,
        dto.studyTypeId,
        dto.startDate,
        dto.endDate,
        year,
        dto.categoryId,
        dto.subcategoryId ?? null,
        dto.lo ?? null,
        dto.keyword ?? null,
        dto.privilege ?? null,
        dto.remarkChapter ?? null,
        dto.property ?? null,
        dto.evaluation ?? null,
        dto.competency ?? null,
        dto.precondition ?? null,
        dto.certificate ?? null,
        dto.certificateName ?? null,
        dto.contactName,
        dto.contactTel,
        dto.contactEmail,
        dto.contactUrl ?? null,
        createUser,
      ],
    );

    const courseId = result.insertId;

    const tasks: Promise<unknown>[] = [];

    if (dto.classTypeId) {
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSETYPECLASS (COSE_ID, TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, NOW())`,
          [courseId, dto.classTypeId, dto.classFee ?? 0, dto.classFeeRemark ?? null, createUser],
        ),
      );
    }

    if (dto.skillWeightsJson) {
      try {
        const skillWeights = JSON.parse(dto.skillWeightsJson) as {
          skillId: number;
          weight: number;
        }[];
        for (const sw of skillWeights) {
          tasks.push(
            this.dataSource.query(
              `INSERT IGNORE INTO LLTCOURSESKILL (COSE_ID, SKILL_ID, SKILL_WEIGHT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
              [courseId, sw.skillId, sw.weight, createUser],
            ),
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to parse skillWeightsJson: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    if (dto.targets?.length) {
      for (let i = 0; i < dto.targets.length; i++) {
        const t = dto.targets[i];
        tasks.push(
          this.dataSource.query(
            `INSERT INTO LLTCOURSETARGET (COSE_ID, TARGET_ID, SUBTARGET_ID, COSETARGET_SEQ, COSETARGET_OTHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [courseId, t.targetId, t.subtargetId ?? null, i + 1, t.other ?? null, createUser],
          ),
        );
      }
    }

    for (const f of files ?? []) {
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSEFILE (COSE_ID, COSEFILE_NAME, COSEFILE_NAMEGEN, COSEFILE_SIZE, COSEFILE_PATH, COSEFILE_URL, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [courseId, f.filename, f.filenameGen, f.size, f.path, f.url, createUser],
        ),
      );
    }

    // Insert LLTOPENCLASS separately to capture insertId for Moodle sync
    const openclassResult = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTOPENCLASS (COSE_ID, OPENCLASS_PUBLIC, TYPECLASS_ID, OPENCLASS_AMOUNT, OPENCLASS_NUMOPEN, OPENCLASS_CLASSSTARTDATE, OPENCLASS_CLASSENDDATE, OPENCLASS_REGSTARTDATE, OPENCLASS_REGENDDATE, OPENCLASS_VDO, COSTPLAN_ID, CREATEUSER, CREATEDATE) VALUES (?, 'N', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        courseId,
        dto.classTypeId ?? null,
        dto.classFee ?? 0,
        dto.maxSeats ?? null,
        dto.startDate,
        dto.endDate,
        dto.registrationStart ?? null,
        dto.registrationEnd ?? null,
        dto.vdo ?? null,
        dto.costplanId ?? null,
        createUser,
      ],
    );
    const openclassId = openclassResult.insertId;

    // Insert student type fees
    if (dto.stutypeFeesJson) {
      try {
        const fees = JSON.parse(dto.stutypeFeesJson) as {
          stutypeId: number;
          amount: number | null;
        }[];
        for (const fee of fees) {
          if (fee.amount === null || fee.amount === undefined) continue;
          await this.dataSource.query(
            `INSERT INTO LLTOPENCLASSSTUTYPEFEE (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
            [openclassId, fee.stutypeId, fee.amount, createUser],
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to save stutype fees: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    await Promise.all(tasks);

    // Insert LLTCOURSEINS + LLTOPENCLASSINS for each assigned instructor
    if (dto.instructorsJson) {
      try {
        const instructors = JSON.parse(dto.instructorsJson) as {
          username?: string;
          email?: string;
        }[];
        for (const inst of instructors) {
          const emailOrUser = inst.email ?? inst.username;
          if (!emailOrUser) continue;
          const psnRows = await this.dataSource.query<{ PSN_ID: string | null }[]>(
            `SELECT PSN_ID FROM LLTUMUSER WHERE USER_EMAIL = ? OR USER_USERNAME = ? LIMIT 1`,
            [emailOrUser, emailOrUser],
          );
          const psnId = psnRows[0]?.PSN_ID ?? null;
          const courseinResult = await this.dataSource.query<{ insertId: number }>(
            `INSERT INTO LLTCOURSEINS (COSE_ID, COSEINS_EMAIL, PSN_ID, COSEINS_ADMIN, COSEINS_TEACHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, 'Y', 'Y', ?, NOW())`,
            [courseId, emailOrUser, psnId, createUser],
          );
          await this.dataSource.query(
            `INSERT INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, NOW())`,
            [openclassId, courseinResult.insertId, createUser],
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to save instructor records: ${msg}`);
      }
    }

    // Save chapters
    let chaptersForMoodle: {
      name: string;
      hour?: number;
      typeName?: string;
      subchapters?: string[];
    }[] = [];
    if (dto.chaptersJson) {
      await this.saveChapters(courseId, dto.chaptersJson, createUser);
      try {
        const parsed = JSON.parse(dto.chaptersJson) as {
          subject: string;
          hour?: number;
          chapterTypeId?: number;
          chapterTypeOther?: string;
          subchapters?: { subject: string }[];
        }[];

        const typeIds = [
          ...new Set(parsed.map((c) => c.chapterTypeId).filter(Boolean)),
        ] as number[];
        const typeMap = new Map<number, string>();
        if (typeIds.length > 0) {
          const rows = await this.dataSource.query<{ id: number; label: string }[]>(
            `SELECT TYPECHAP_ID AS id, TYPECHAP_NAME AS label FROM LLTTYPECHAPTER WHERE TYPECHAP_ID IN (${typeIds.map(() => '?').join(',')})`,
            typeIds,
          );
          rows.forEach((r) => typeMap.set(r.id, r.label));
        }

        chaptersForMoodle = parsed
          .filter((c) => c.subject?.trim())
          .map((c) => {
            let typeName: string | undefined;
            if (c.chapterTypeId) {
              const base = typeMap.get(c.chapterTypeId);
              typeName = c.chapterTypeOther?.trim() ? `${c.chapterTypeOther.trim()} (อื่นๆ)` : base;
            }
            return {
              name: c.subject.trim(),
              hour: c.hour ?? undefined,
              typeName,
              subchapters: c.subchapters?.map((s) => s.subject?.trim()).filter(Boolean) as string[],
            };
          });
      } catch {
        // ignore parse error — chaptersForMoodle stays empty
      }
    }

    // Sync to Moodle
    try {
      const moodleCategoryId = await this.resolveMoodleCategoryId(dto.categoryId);
      const courseParams = new URLSearchParams();
      courseParams.append('courses[0][fullname]', dto.nameTh);
      courseParams.append('courses[0][shortname]', courseCode);
      courseParams.append('courses[0][categoryid]', moodleCategoryId);
      courseParams.append('courses[0][summary]', dto.summary ?? '');
      courseParams.append('courses[0][summaryformat]', '1');
      courseParams.append('courses[0][visible]', '1');
      if (dto.startDate) {
        courseParams.append(
          'courses[0][startdate]',
          String(Math.floor(new Date(dto.startDate).getTime() / 1000)),
        );
      }
      if (dto.endDate) {
        courseParams.append(
          'courses[0][enddate]',
          String(Math.floor(new Date(dto.endDate).getTime() / 1000)),
        );
      }
      const numSections = chaptersForMoodle.length > 0 ? chaptersForMoodle.length : 1;
      courseParams.append('courses[0][courseformatoptions][0][name]', 'numsections');
      courseParams.append('courses[0][courseformatoptions][0][value]', String(numSections));

      const moodleCourses = await this.moodleService.callMoodleApi(
        'core_course_create_courses',
        courseParams,
      );

      let moodleCourseId: number | null = null;

      if (Array.isArray(moodleCourses) && (moodleCourses as { id: number }[])[0]?.id) {
        moodleCourseId = (moodleCourses as { id: number }[])[0].id;
      }

      // Verify: confirm course actually exists in Moodle by shortname
      const verifiedId = await this.moodleService.getCourseMoodleIdByShortname(courseCode);
      if (!verifiedId) {
        this.logger.warn(
          `Moodle course create returned id=${moodleCourseId} but verification by shortname failed — not marking LMS_STATUS=Y`,
        );
      } else {
        moodleCourseId = verifiedId;
        this.logger.log(
          `Verified Moodle course id=${moodleCourseId} for LLL course id=${courseId}`,
        );
        await this.dataSource.query(
          `UPDATE LLTOPENCLASS SET LMS_ID=?, LMS_STATUS='Y', LMS_USER=?, LMS_DATE=NOW() WHERE OPENCLASS_ID=?`,
          [moodleCourseId, createUser, openclassId],
        );
        await this.moodleService.ensureManualEnrolInstance(moodleCourseId, courseCode);
        await this.syncInstructorsToMoodle(courseId, openclassId, moodleCourseId, createUser);
        if (chaptersForMoodle.length > 0) {
          await this.moodleService.initialChapterSync(moodleCourseId, chaptersForMoodle);
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Moodle course sync failed (DB records saved): ${msg}`);
    }

    return { courseId };
  }

  async copy(sourceId: number): Promise<{ courseId: number }> {
    const createUser = 'ADMIN';

    const [
      srcRows,
      srcOcRows,
      srcInsRows,
      srcTargetRows,
      srcTcRows,
      srcChapRows,
      srcSubRows,
      srcFeeRows,
    ] = await Promise.all([
      this.dataSource.query<
        {
          FAC_ID: number;
          TYPECOSE_ID: number | null;
          COSE_NAMETH: string;
          COSE_NAMEEN: string;
          COSE_OBJECTIVE: string | null;
          COSE_DESCRIPTION: string | null;
          COSE_IMAGE_URL: string | null;
          COSE_HOUR: number | null;
          COSE_THEORYHOUR: number | null;
          COSE_ACTIONHOUR: number | null;
          COSE_CREDITBANK: number | null;
          TYPESTUDY_ID: number | null;
          COSE_STARTDATE: string | null;
          COSE_ENDDATE: string | null;
          COSE_YEAR: string | null;
          CATEGORY_ID: number | null;
          SUBCATEGORY_ID: number | null;
          COSE_LO: string | null;
          COSE_KEYWORD: string | null;
          COSE_PRIVILEGE: string | null;
          COSE_REMARKCHAPTER: string | null;
          COSE_PROPERTY: string | null;
          COSE_EVALUATION: string | null;
          COSE_COMPETENCY: string | null;
          COSE_PRECONDITION: string | null;
          COSE_CERTIFICATE: string | null;
          COSE_CERTIFICATENAME: string | null;
          COSE_CONTRACTNAME: string | null;
          COSE_CONTRACTTEL: string | null;
          COSE_CONTRACTEMAIL: string | null;
          COSE_CONTRACTURL: string | null;
        }[]
      >(
        `SELECT FAC_ID, TYPECOSE_ID, COSE_NAMETH, COSE_NAMEEN, COSE_OBJECTIVE, COSE_DESCRIPTION,
                  COSE_IMAGE_URL, COSE_HOUR, COSE_THEORYHOUR, COSE_ACTIONHOUR, COSE_CREDITBANK,
                  TYPESTUDY_ID, COSE_STARTDATE, COSE_ENDDATE, COSE_YEAR,
                  CATEGORY_ID, SUBCATEGORY_ID,
                  COSE_LO, COSE_KEYWORD, COSE_PRIVILEGE,
                  COSE_REMARKCHAPTER, COSE_PROPERTY, COSE_EVALUATION, COSE_COMPETENCY,
                  COSE_PRECONDITION, COSE_CERTIFICATE, COSE_CERTIFICATENAME,
                  COSE_CONTRACTNAME, COSE_CONTRACTTEL, COSE_CONTRACTEMAIL, COSE_CONTRACTURL
           FROM LLTCOURSE WHERE COSE_ID = ?`,
        [sourceId],
      ),
      this.dataSource.query<
        {
          OPENCLASS_PUBLIC: string;
          TYPECLASS_ID: number | null;
          OPENCLASS_AMOUNT: number | null;
          OPENCLASS_NUMOPEN: number | null;
          OPENCLASS_CLASSSTARTDATE: string | null;
          OPENCLASS_CLASSENDDATE: string | null;
          OPENCLASS_REGSTARTDATE: string | null;
          OPENCLASS_REGENDDATE: string | null;
        }[]
      >(
        `SELECT OPENCLASS_PUBLIC, TYPECLASS_ID, OPENCLASS_AMOUNT, OPENCLASS_NUMOPEN,
                  OPENCLASS_CLASSSTARTDATE, OPENCLASS_CLASSENDDATE,
                  OPENCLASS_REGSTARTDATE, OPENCLASS_REGENDDATE
           FROM LLTOPENCLASS WHERE COSE_ID = ? ORDER BY OPENCLASS_ID DESC LIMIT 1`,
        [sourceId],
      ),
      this.dataSource.query<{ COSEINS_EMAIL: string; PSN_ID: number | null }[]>(
        `SELECT COSEINS_EMAIL, PSN_ID FROM LLTCOURSEINS WHERE COSE_ID = ?`,
        [sourceId],
      ),
      this.dataSource.query<
        {
          TARGET_ID: number;
          SUBTARGET_ID: number | null;
          COSETARGET_OTHER: string | null;
          COSETARGET_SEQ: number;
        }[]
      >(
        `SELECT TARGET_ID, SUBTARGET_ID, COSETARGET_OTHER, COSETARGET_SEQ
           FROM LLTCOURSETARGET WHERE COSE_ID = ? ORDER BY COSETARGET_SEQ`,
        [sourceId],
      ),
      this.dataSource.query<
        {
          TYPECLASS_ID: number;
          COSETYPECLASS_AMOUNT: number | null;
          COSETYPECLASS_REMARK: string | null;
        }[]
      >(
        `SELECT TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK
           FROM LLTCOURSETYPECLASS WHERE COSE_ID = ? LIMIT 1`,
        [sourceId],
      ),
      this.dataSource.query<
        {
          COSECHAP_ID: number;
          COSECHAP_SUBJECT: string;
          COSECHAP_HOUR: number | null;
          COSECHAP_SEQ: number;
          TYPECHAP_ID: number | null;
          COSECHAPTYPE_OTHER: string | null;
        }[]
      >(
        `SELECT ch.COSECHAP_ID, ch.COSECHAP_SUBJECT, ch.COSECHAP_HOUR, ch.COSECHAP_SEQ,
                  ct.TYPECHAP_ID, ct.COSECHAPTYPE_OTHER
           FROM LLTCOURSECHAPTER ch
           LEFT JOIN LLTCOURSECHAPTERTYPE ct ON ct.COSECHAP_ID = ch.COSECHAP_ID
           WHERE ch.COSE_ID = ? ORDER BY ch.COSECHAP_SEQ`,
        [sourceId],
      ),
      this.dataSource.query<
        { COSECHAP_ID: number; COSESUBCHAP_SUBJECT: string; COSESUBCHAP_SEQ: number }[]
      >(
        `SELECT sub.COSECHAP_ID, sub.COSESUBCHAP_SUBJECT, sub.COSESUBCHAP_SEQ
           FROM LLTCOURSESUBCHAPTER sub
           INNER JOIN LLTCOURSECHAPTER ch ON ch.COSECHAP_ID = sub.COSECHAP_ID
           WHERE ch.COSE_ID = ? ORDER BY sub.COSECHAP_ID, sub.COSESUBCHAP_SEQ`,
        [sourceId],
      ),
      this.dataSource.query<{ STUTYPE_ID: number; STUTYPE_AMOUNT: number | null }[]>(
        `SELECT f.STUTYPE_ID, f.STUTYPE_AMOUNT
           FROM LLTOPENCLASSSTUTYPEFEE f
           JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = f.OPENCLASS_ID
           WHERE oc.COSE_ID = ? ORDER BY f.STUTYPE_ID`,
        [sourceId],
      ),
    ]);

    if (!srcRows.length) {
      throw new Error(`Source course ${sourceId} not found`);
    }
    const src = srcRows[0];
    const srcOc = srcOcRows[0] ?? null;

    let courseCode = await this.generateCourseCode(src.FAC_ID, src.TYPECOSE_ID ?? undefined);

    const result = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTCOURSE (
        COSE_CODE, COSE_NAMETH, COSE_NAMEEN, COSE_OBJECTIVE, COSE_DESCRIPTION, COSE_IMAGE_URL,
        FAC_ID, TYPECOSE_ID, COSE_HOUR, COSE_THEORYHOUR, COSE_ACTIONHOUR, COSE_CREDITBANK,
        TYPESTUDY_ID, COSE_STARTDATE, COSE_ENDDATE, COSE_YEAR,
        CATEGORY_ID, SUBCATEGORY_ID,
        COSE_LO, COSE_KEYWORD, COSE_PRIVILEGE,
        COSE_REMARKCHAPTER, COSE_PROPERTY, COSE_EVALUATION, COSE_COMPETENCY,
        COSE_PRECONDITION, COSE_CERTIFICATE, COSE_CERTIFICATENAME,
        COSE_CONTRACTNAME, COSE_CONTRACTTEL, COSE_CONTRACTEMAIL, COSE_CONTRACTURL,
        COSE_STATUS, CREATEUSER, CREATEDATE
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'N', ?, NOW())`,
      [
        courseCode,
        src.COSE_NAMETH,
        src.COSE_NAMEEN,
        src.COSE_OBJECTIVE,
        src.COSE_DESCRIPTION,
        null, // image not copied per spec
        src.FAC_ID,
        src.TYPECOSE_ID,
        src.COSE_HOUR,
        src.COSE_THEORYHOUR,
        src.COSE_ACTIONHOUR,
        src.COSE_CREDITBANK,
        src.TYPESTUDY_ID,
        src.COSE_STARTDATE,
        src.COSE_ENDDATE,
        src.COSE_YEAR,
        src.CATEGORY_ID,
        src.SUBCATEGORY_ID,
        src.COSE_LO,
        src.COSE_KEYWORD,
        src.COSE_PRIVILEGE,
        src.COSE_REMARKCHAPTER,
        src.COSE_PROPERTY,
        src.COSE_EVALUATION,
        src.COSE_COMPETENCY,
        src.COSE_PRECONDITION,
        src.COSE_CERTIFICATE,
        src.COSE_CERTIFICATENAME,
        src.COSE_CONTRACTNAME,
        src.COSE_CONTRACTTEL,
        src.COSE_CONTRACTEMAIL,
        src.COSE_CONTRACTURL,
        createUser,
      ],
    );
    const courseId = result.insertId;

    const ocResult = await this.dataSource.query<{ insertId: number }>(
      `INSERT INTO LLTOPENCLASS (
        COSE_ID, OPENCLASS_PUBLIC, TYPECLASS_ID, OPENCLASS_AMOUNT, OPENCLASS_NUMOPEN,
        OPENCLASS_CLASSSTARTDATE, OPENCLASS_CLASSENDDATE,
        OPENCLASS_REGSTARTDATE, OPENCLASS_REGENDDATE,
        CREATEUSER, CREATEDATE
      ) VALUES (?, 'N', ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        courseId,
        srcOc?.TYPECLASS_ID ?? null,
        srcOc?.OPENCLASS_AMOUNT ?? 0,
        srcOc?.OPENCLASS_NUMOPEN ?? null,
        srcOc?.OPENCLASS_CLASSSTARTDATE ?? null,
        srcOc?.OPENCLASS_CLASSENDDATE ?? null,
        srcOc?.OPENCLASS_REGSTARTDATE ?? null,
        srcOc?.OPENCLASS_REGENDDATE ?? null,
        createUser,
      ],
    );
    const openclassId = ocResult.insertId;

    const tasks: Promise<unknown>[] = [];

    // Copy LLTCOURSETYPECLASS (skip LLTCOURSESKILL per spec)
    if (srcTcRows.length) {
      const tc = srcTcRows[0];
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSETYPECLASS (COSE_ID, TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            courseId,
            tc.TYPECLASS_ID,
            tc.COSETYPECLASS_AMOUNT ?? 0,
            tc.COSETYPECLASS_REMARK ?? null,
            createUser,
          ],
        ),
      );
    }

    // Copy LLTCOURSETARGET
    for (let i = 0; i < srcTargetRows.length; i++) {
      const t = srcTargetRows[i];
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSETARGET (COSE_ID, TARGET_ID, SUBTARGET_ID, COSETARGET_SEQ, COSETARGET_OTHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [
            courseId,
            t.TARGET_ID,
            t.SUBTARGET_ID ?? null,
            t.COSETARGET_SEQ,
            t.COSETARGET_OTHER ?? null,
            createUser,
          ],
        ),
      );
    }

    await Promise.all(tasks);

    // Copy student type fees
    for (const fee of srcFeeRows) {
      if (fee.STUTYPE_AMOUNT === null) continue;
      await this.dataSource.query(
        `INSERT INTO LLTOPENCLASSSTUTYPEFEE (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
        [openclassId, fee.STUTYPE_ID, fee.STUTYPE_AMOUNT, createUser],
      );
    }

    // Copy LLTCOURSEINS + LLTOPENCLASSINS
    for (const inst of srcInsRows) {
      if (!inst.COSEINS_EMAIL) continue;
      const insResult = await this.dataSource.query<{ insertId: number }>(
        `INSERT INTO LLTCOURSEINS (COSE_ID, COSEINS_EMAIL, PSN_ID, COSEINS_ADMIN, COSEINS_TEACHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, 'Y', 'Y', ?, NOW())`,
        [courseId, inst.COSEINS_EMAIL, inst.PSN_ID ?? null, createUser],
      );
      await this.dataSource.query(
        `INSERT INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, NOW())`,
        [openclassId, insResult.insertId, createUser],
      );
    }

    // Copy chapters
    const subsByChap = new Map<number, { subject: string; seq: number }[]>();
    for (const sub of srcSubRows) {
      const list = subsByChap.get(sub.COSECHAP_ID) ?? [];
      list.push({ subject: sub.COSESUBCHAP_SUBJECT, seq: sub.COSESUBCHAP_SEQ });
      subsByChap.set(sub.COSECHAP_ID, list);
    }

    const chaptersForMoodle: {
      name: string;
      hour?: number;
      typeName?: string;
      subchapters?: string[];
    }[] = [];
    const typeIds = [...new Set(srcChapRows.map((c) => c.TYPECHAP_ID).filter(Boolean))] as number[];
    const typeMap = new Map<number, string>();
    if (typeIds.length > 0) {
      const typeRows = await this.dataSource.query<{ id: number; label: string }[]>(
        `SELECT TYPECHAP_ID AS id, TYPECHAP_NAME AS label FROM LLTTYPECHAPTER WHERE TYPECHAP_ID IN (${typeIds.map(() => '?').join(',')})`,
        typeIds,
      );
      typeRows.forEach((r) => typeMap.set(r.id, r.label));
    }

    for (const ch of srcChapRows) {
      const chapResult = await this.dataSource.query<{ insertId: number }>(
        `INSERT INTO LLTCOURSECHAPTER (COSE_ID, COSECHAP_SUBJECT, COSECHAP_HOUR, COSECHAP_SEQ, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [courseId, ch.COSECHAP_SUBJECT, ch.COSECHAP_HOUR ?? null, ch.COSECHAP_SEQ, createUser],
      );
      const newChapId = chapResult.insertId;

      if (ch.TYPECHAP_ID) {
        await this.dataSource.query(
          `INSERT INTO LLTCOURSECHAPTERTYPE (COSECHAP_ID, TYPECHAP_ID, COSECHAPTYPE_OTHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
          [newChapId, ch.TYPECHAP_ID, ch.COSECHAPTYPE_OTHER ?? null, createUser],
        );
      }

      const subs = subsByChap.get(ch.COSECHAP_ID) ?? [];
      for (const sub of subs) {
        await this.dataSource.query(
          `INSERT INTO LLTCOURSESUBCHAPTER (COSECHAP_ID, COSESUBCHAP_SUBJECT, COSESUBCHAP_SEQ, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
          [newChapId, sub.subject, sub.seq, createUser],
        );
      }

      let typeName: string | undefined;
      if (ch.TYPECHAP_ID) {
        const base = typeMap.get(ch.TYPECHAP_ID);
        typeName = ch.COSECHAPTYPE_OTHER?.trim() ? `${ch.COSECHAPTYPE_OTHER.trim()} (อื่นๆ)` : base;
      }
      chaptersForMoodle.push({
        name: ch.COSECHAP_SUBJECT,
        hour: ch.COSECHAP_HOUR ?? undefined,
        typeName,
        subchapters: (subsByChap.get(ch.COSECHAP_ID) ?? []).map((s) => s.subject),
      });
    }

    // Moodle sync (non-critical)
    try {
      const moodleCategoryId = await this.resolveMoodleCategoryId(
        src.CATEGORY_ID ?? 1,
        src.SUBCATEGORY_ID ?? undefined,
      );

      const buildCourseParams = (code: string): URLSearchParams => {
        const p = new URLSearchParams();
        p.append('courses[0][fullname]', src.COSE_NAMETH);
        p.append('courses[0][shortname]', code);
        p.append('courses[0][categoryid]', moodleCategoryId);
        p.append('courses[0][summary]', src.COSE_OBJECTIVE ?? '');
        p.append('courses[0][summaryformat]', '1');
        p.append('courses[0][visible]', '1');
        if (src.COSE_STARTDATE)
          p.append(
            'courses[0][startdate]',
            String(Math.floor(new Date(src.COSE_STARTDATE).getTime() / 1000)),
          );
        if (src.COSE_ENDDATE)
          p.append(
            'courses[0][enddate]',
            String(Math.floor(new Date(src.COSE_ENDDATE).getTime() / 1000)),
          );
        const numSections = chaptersForMoodle.length > 0 ? chaptersForMoodle.length : 1;
        p.append('courses[0][courseformatoptions][0][name]', 'numsections');
        p.append('courses[0][courseformatoptions][0][value]', String(numSections));
        return p;
      };

      let moodleCourseId: number | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await this.moodleService.callMoodleApi(
            'core_course_create_courses',
            buildCourseParams(courseCode),
          );
          moodleCourseId = await this.moodleService.getCourseMoodleIdByShortname(courseCode);
          break;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (attempt === 0 && msg.toLowerCase().includes('shortnametaken')) {
            this.logger.warn(
              `copy: shortname ${courseCode} taken in Moodle — generating new code for LLL course ${courseId}`,
            );
            const newCode = await this.generateCourseCode(src.FAC_ID, src.TYPECOSE_ID ?? undefined);
            await this.dataSource.query(`UPDATE LLTCOURSE SET COSE_CODE = ? WHERE COSE_ID = ?`, [
              newCode,
              courseId,
            ]);
            courseCode = newCode;
            continue;
          }
          throw err;
        }
      }

      if (moodleCourseId) {
        await this.dataSource.query(
          `UPDATE LLTOPENCLASS SET LMS_ID=?, LMS_STATUS='Y', LMS_USER=?, LMS_DATE=NOW() WHERE OPENCLASS_ID=?`,
          [moodleCourseId, createUser, openclassId],
        );
        await this.moodleService.ensureManualEnrolInstance(moodleCourseId, courseCode);
        await this.syncInstructorsToMoodle(courseId, openclassId, moodleCourseId, createUser);
        if (chaptersForMoodle.length > 0) {
          await this.moodleService.initialChapterSync(moodleCourseId, chaptersForMoodle);
        }
      } else {
        this.logger.warn(
          `Moodle copy: created course (shortname=${courseCode}) but verification returned null — LMS_ID not set for LLL course ${courseId}`,
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Moodle sync failed for copied course ${courseId}: ${msg}`);
    }

    return { courseId };
  }

  private async saveChapters(
    courseId: number,
    chaptersJson: string,
    createUser: string,
  ): Promise<void> {
    interface ChapterInput {
      subject: string;
      hour?: number;
      chapterTypeId?: number;
      chapterTypeOther?: string;
      subchapters?: { subject: string }[];
    }

    let chapters: ChapterInput[];
    try {
      chapters = JSON.parse(chaptersJson) as ChapterInput[];
    } catch {
      this.logger.warn(`Invalid chaptersJson — skipping chapter save`);
      return;
    }

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch.subject?.trim()) continue;

      const chapResult = await this.dataSource.query<{ insertId: number }>(
        `INSERT INTO LLTCOURSECHAPTER (COSE_ID, COSECHAP_SUBJECT, COSECHAP_HOUR, COSECHAP_SEQ, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [courseId, ch.subject.trim(), ch.hour ?? null, i + 1, createUser],
      );
      const chapId = chapResult.insertId;

      if (ch.chapterTypeId) {
        await this.dataSource.query(
          `INSERT INTO LLTCOURSECHAPTERTYPE (COSECHAP_ID, TYPECHAP_ID, COSECHAPTYPE_OTHER, CREATEUSER, CREATEDATE)
           VALUES (?, ?, ?, ?, NOW())`,
          [chapId, ch.chapterTypeId, ch.chapterTypeOther ?? null, createUser],
        );
      }

      if (ch.subchapters?.length) {
        for (let j = 0; j < ch.subchapters.length; j++) {
          const sub = ch.subchapters[j];
          if (!sub.subject?.trim()) continue;
          await this.dataSource.query(
            `INSERT INTO LLTCOURSESUBCHAPTER (COSECHAP_ID, COSESUBCHAP_SUBJECT, COSESUBCHAP_SEQ, CREATEUSER, CREATEDATE)
             VALUES (?, ?, ?, ?, NOW())`,
            [chapId, sub.subject.trim(), j + 1, createUser],
          );
        }
      }
    }
  }

  private async syncInstructorsToMoodle(
    courseId: number,
    openclassId: number,
    moodleCourseId: number,
    createUser: string,
  ): Promise<void> {
    const instructors = await this.dataSource.query<
      {
        courseinId: number;
        email: string | null;
        username: string | null;
        lmsId: number | null;
      }[]
    >(
      `SELECT ci.COSEINS_ID AS courseinId, ci.COSEINS_EMAIL AS email,
              u.USER_USERNAME AS username, u.LMS_ID AS lmsId
       FROM LLTCOURSEINS ci
       LEFT JOIN LLTUMUSER u ON u.USER_EMAIL = ci.COSEINS_EMAIL
                             OR u.USER_USERNAME = ci.COSEINS_EMAIL
       WHERE ci.COSE_ID = ?`,
      [courseId],
    );

    for (const inst of instructors) {
      // Backfill LLTOPENCLASSINS if missing
      await this.dataSource.query(
        `INSERT IGNORE INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, NOW())`,
        [openclassId, inst.courseinId, createUser],
      );

      // Lookup Moodle user: LMS_ID → username → email
      let moodleUserId: number | null = inst.lmsId ?? null;
      if (!moodleUserId && inst.username) {
        moodleUserId = await this.moodleService.getUserIdByUsername(inst.username);
      }
      if (!moodleUserId && inst.email) {
        moodleUserId = await this.moodleService.getUserIdByEmail(inst.email);
      }

      if (!moodleUserId) {
        this.logger.warn(
          `No Moodle user found for instructor "${inst.email ?? inst.username}" — skipping teacher role`,
        );
        continue;
      }

      // Cache LMS_ID back to LLTUMUSER for future lookups
      if (!inst.lmsId) {
        await this.dataSource.query(
          `UPDATE LLTUMUSER SET LMS_ID=? WHERE USER_EMAIL=? AND LMS_ID IS NULL`,
          [moodleUserId, inst.email],
        );
      }

      // Assign teacher role (enrol_manual_enrol_users is idempotent for same user/course/role)
      try {
        await this.moodleService.enrolUserInCourse(moodleCourseId, moodleUserId, 3);
        this.logger.log(
          `Teacher role assigned: Moodle user ${moodleUserId} → course ${moodleCourseId}`,
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Failed to assign teacher role for Moodle user ${moodleUserId} on course ${moodleCourseId}: ${msg}`,
        );
      }
    }
  }

  async update(
    courseId: number,
    dto: CreateAdminCourseDto,
    files?: CourseFileData[],
  ): Promise<{ courseId: number }> {
    const existing = await this.dataSource.query<{ COSE_ID: number }[]>(
      'SELECT COSE_ID FROM LLTCOURSE WHERE COSE_ID = ? LIMIT 1',
      [courseId],
    );
    if (!existing.length) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const updateUser = dto.createUser ?? 'ADMIN';
    const totalHours = (dto.theoryHours ?? 0) + (dto.practiceHours ?? 0);
    const year = dto.startDate ? String(new Date(dto.startDate).getFullYear() + 543) : null;
    const creditBank = dto.typeCourseId === 2 && dto.creditBank ? parseFloat(dto.creditBank) : null;

    await this.dataSource.query(
      `UPDATE LLTCOURSE SET
        COSE_NAMETH = ?, COSE_NAMEEN = ?, COSE_OBJECTIVE = ?, COSE_DESCRIPTION = ?,
        FAC_ID = ?, TYPECOSE_ID = ?,
        COSE_HOUR = ?, COSE_THEORYHOUR = ?, COSE_ACTIONHOUR = ?, COSE_CREDITBANK = ?,
        TYPESTUDY_ID = ?, COSE_STARTDATE = ?, COSE_ENDDATE = ?, COSE_YEAR = ?,
        CATEGORY_ID = ?, SUBCATEGORY_ID = ?,
        COSE_LO = ?, COSE_KEYWORD = ?, COSE_PRIVILEGE = ?,
        COSE_REMARKCHAPTER = ?, COSE_PROPERTY = ?, COSE_EVALUATION = ?, COSE_COMPETENCY = ?,
        COSE_PRECONDITION = ?, COSE_CERTIFICATE = ?, COSE_CERTIFICATENAME = ?,
        COSE_CONTRACTNAME = ?, COSE_CONTRACTTEL = ?, COSE_CONTRACTEMAIL = ?, COSE_CONTRACTURL = ?,
        ${dto.imageUrl ? 'COSE_IMAGE_URL = ?,' : dto.removeImage === 'true' ? 'COSE_IMAGE_URL = NULL,' : ''}
        ${dto.imageCrop !== undefined ? 'COSE_IMAGE_CROP = ?,' : ''}
        UPDATEUSER = ?, UPDATEDATE = NOW(), UPDATEPROG = 'ADMIN'
       WHERE COSE_ID = ?`,
      [
        dto.nameTh,
        dto.nameEn,
        dto.summary ?? null,
        dto.description ?? null,
        dto.facultyId,
        dto.typeCourseId ?? null,
        totalHours || null,
        dto.theoryHours ?? null,
        dto.practiceHours ?? null,
        creditBank,
        dto.studyTypeId,
        dto.startDate,
        dto.endDate,
        year,
        dto.categoryId,
        dto.subcategoryId ?? null,
        dto.lo ?? null,
        dto.keyword ?? null,
        dto.privilege ?? null,
        dto.remarkChapter ?? null,
        dto.property ?? null,
        dto.evaluation ?? null,
        dto.competency ?? null,
        dto.precondition ?? null,
        dto.certificate ?? null,
        dto.certificateName ?? null,
        dto.contactName,
        dto.contactTel,
        dto.contactEmail,
        dto.contactUrl ?? null,
        ...(dto.imageUrl ? [dto.imageUrl] : []),
        ...(dto.imageCrop !== undefined ? [dto.imageCrop ?? null] : []),
        updateUser,
        courseId,
      ],
    );

    // Update LLTOPENCLASS
    await this.dataSource.query(
      `UPDATE LLTOPENCLASS SET
        TYPECLASS_ID = ?, OPENCLASS_AMOUNT = ?, OPENCLASS_NUMOPEN = ?,
        OPENCLASS_CLASSSTARTDATE = ?, OPENCLASS_CLASSENDDATE = ?,
        OPENCLASS_REGSTARTDATE = ?, OPENCLASS_REGENDDATE = ?,
        OPENCLASS_VDO = ?, COSTPLAN_ID = ?,
        UPDATEUSER = ?, UPDATEDATE = NOW()
       WHERE COSE_ID = ?`,
      [
        dto.classTypeId ?? null,
        dto.classFee ?? 0,
        dto.maxSeats ?? null,
        dto.startDate,
        dto.endDate,
        dto.registrationStart ?? null,
        dto.registrationEnd ?? null,
        dto.vdo ?? null,
        dto.costplanId ?? null,
        updateUser,
        courseId,
      ],
    );

    // Re-insert related tables (delete first)
    const openclassRowsForFee = await this.dataSource.query<{ openclassId: number }[]>(
      `SELECT OPENCLASS_ID AS openclassId FROM LLTOPENCLASS WHERE COSE_ID = ? LIMIT 1`,
      [courseId],
    );
    const openclassIdForFee = openclassRowsForFee[0]?.openclassId;

    const deletePromises: Promise<unknown>[] = [
      this.dataSource.query('DELETE FROM LLTCOURSETYPECLASS WHERE COSE_ID = ?', [courseId]),
      this.dataSource.query('DELETE FROM LLTCOURSESKILL WHERE COSE_ID = ?', [courseId]),
      this.dataSource.query('DELETE FROM LLTCOURSETARGET WHERE COSE_ID = ?', [courseId]),
    ];
    if (openclassIdForFee) {
      deletePromises.push(
        this.dataSource.query('DELETE FROM LLTOPENCLASSSTUTYPEFEE WHERE OPENCLASS_ID = ?', [
          openclassIdForFee,
        ]),
      );
    }
    await Promise.all(deletePromises);

    const tasks: Promise<unknown>[] = [];

    if (dto.classTypeId) {
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSETYPECLASS (COSE_ID, TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, NOW())`,
          [courseId, dto.classTypeId, dto.classFee ?? 0, dto.classFeeRemark ?? null, updateUser],
        ),
      );
    }

    if (dto.skillWeightsJson) {
      try {
        const skillWeights = JSON.parse(dto.skillWeightsJson) as {
          skillId: number;
          weight: number;
        }[];
        for (const sw of skillWeights) {
          tasks.push(
            this.dataSource.query(
              `INSERT IGNORE INTO LLTCOURSESKILL (COSE_ID, SKILL_ID, SKILL_WEIGHT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
              [courseId, sw.skillId, sw.weight, updateUser],
            ),
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to parse skillWeightsJson: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    if (dto.targets?.length) {
      for (let i = 0; i < dto.targets.length; i++) {
        const t = dto.targets[i];
        tasks.push(
          this.dataSource.query(
            `INSERT INTO LLTCOURSETARGET (COSE_ID, TARGET_ID, SUBTARGET_ID, COSETARGET_SEQ, COSETARGET_OTHER, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [courseId, t.targetId, t.subtargetId ?? null, i + 1, t.other ?? null, updateUser],
          ),
        );
      }
    }

    const removeIds = (dto.removeFileIds ?? '')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => n > 0);
    if (removeIds.length) {
      tasks.push(
        this.dataSource.query(
          `DELETE FROM LLTCOURSEFILE WHERE COSE_ID = ? AND COSEFILE_ID IN (${removeIds.map(() => '?').join(',')})`,
          [courseId, ...removeIds],
        ),
      );
    }
    for (const f of files ?? []) {
      tasks.push(
        this.dataSource.query(
          `INSERT INTO LLTCOURSEFILE (COSE_ID, COSEFILE_NAME, COSEFILE_NAMEGEN, COSEFILE_SIZE, COSEFILE_PATH, COSEFILE_URL, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [courseId, f.filename, f.filenameGen, f.size, f.path, f.url, updateUser],
        ),
      );
    }

    await Promise.all(tasks);

    // Re-insert student type fees
    if (dto.stutypeFeesJson && openclassIdForFee) {
      try {
        const fees = JSON.parse(dto.stutypeFeesJson) as {
          stutypeId: number;
          amount: number | null;
        }[];
        for (const fee of fees) {
          if (fee.amount === null || fee.amount === undefined) continue;
          await this.dataSource.query(
            `INSERT INTO LLTOPENCLASSSTUTYPEFEE (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
            [openclassIdForFee, fee.stutypeId, fee.amount, updateUser],
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to update stutype fees: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // Re-insert instructors
    const openclassId = openclassIdForFee;

    // Sync course metadata to Moodle (fullname, summary, category, dates)
    if (openclassId) {
      try {
        const moodleMetaRow = await this.dataSource.query<{ lmsId: number | null }[]>(
          `SELECT LMS_ID AS lmsId FROM LLTOPENCLASS WHERE OPENCLASS_ID = ?`,
          [openclassId],
        );
        const moodleId = moodleMetaRow[0]?.lmsId;
        if (moodleId) {
          const moodleCategoryId = await this.resolveMoodleCategoryId(
            dto.categoryId,
            dto.subcategoryId ?? undefined,
          );
          await this.moodleService.updateCourseMeta(moodleId, {
            fullname: dto.nameTh,
            summary: dto.summary ?? '',
            categoryId: moodleCategoryId,
            startdate: dto.startDate
              ? Math.floor(new Date(dto.startDate).getTime() / 1000)
              : undefined,
            enddate: dto.endDate ? Math.floor(new Date(dto.endDate).getTime() / 1000) : undefined,
          });
          await this.dataSource.query(
            `UPDATE LLTOPENCLASS SET LMS_STATUS='Y', LMS_USER=?, LMS_DATE=NOW() WHERE OPENCLASS_ID=?`,
            [updateUser, openclassId],
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Moodle course metadata sync failed on update: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    if (dto.instructorsJson && openclassId) {
      try {
        await this.dataSource.query('DELETE FROM LLTCOURSEINS WHERE COSE_ID = ?', [courseId]);
        const instructors = JSON.parse(dto.instructorsJson) as {
          username?: string;
          email?: string;
        }[];
        for (const inst of instructors) {
          const emailOrUser = inst.email ?? inst.username;
          if (!emailOrUser) continue;
          const insResult = await this.dataSource.query<{ insertId: number }>(
            `INSERT INTO LLTCOURSEINS (COSE_ID, COSEINS_EMAIL, COSEINS_ADMIN, COSEINS_TEACHER, CREATEUSER, CREATEDATE) VALUES (?, ?, 'Y', 'Y', ?, NOW())`,
            [courseId, emailOrUser, updateUser],
          );
          await this.dataSource.query(
            `INSERT INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, NOW())`,
            [openclassId, insResult.insertId, updateUser],
          );
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Failed to update instructor records: ${err instanceof Error ? err.message : String(err)}`,
        );
      }

      // Sync updated instructors to Moodle
      if (openclassId) {
        try {
          const moodleRow = await this.dataSource.query<{ lmsId: number | null }[]>(
            `SELECT LMS_ID AS lmsId FROM LLTOPENCLASS WHERE OPENCLASS_ID = ?`,
            [openclassId],
          );
          const moodleId = moodleRow[0]?.lmsId;
          if (moodleId) {
            await this.syncInstructorsToMoodle(courseId, openclassId, moodleId, updateUser);
          }
        } catch (err: unknown) {
          this.logger.warn(
            `Failed to sync instructors to Moodle on update: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    }

    // Update chapters + sync Moodle
    if (dto.chaptersJson) {
      await this.dataSource.query(
        `DELETE FROM LLTCOURSECHAPTERTYPE WHERE COSECHAP_ID IN (SELECT COSECHAP_ID FROM LLTCOURSECHAPTER WHERE COSE_ID = ?)`,
        [courseId],
      );
      await this.dataSource.query(
        `DELETE FROM LLTCOURSESUBCHAPTER WHERE COSECHAP_ID IN (SELECT COSECHAP_ID FROM LLTCOURSECHAPTER WHERE COSE_ID = ?)`,
        [courseId],
      );
      await this.dataSource.query(`DELETE FROM LLTCOURSECHAPTER WHERE COSE_ID = ?`, [courseId]);
      await this.saveChapters(courseId, dto.chaptersJson, updateUser);
      try {
        const moodleId = openclassId
          ? (
              await this.dataSource.query<{ lmsId: number | null }[]>(
                `SELECT LMS_ID AS lmsId FROM LLTOPENCLASS WHERE OPENCLASS_ID = ?`,
                [openclassId],
              )
            )[0]?.lmsId
          : null;

        if (moodleId) {
          const parsed = JSON.parse(dto.chaptersJson) as {
            subject: string;
            hour?: number;
            chapterTypeId?: number;
            chapterTypeOther?: string;
            subchapters?: { subject: string }[];
          }[];
          const typeIds = [
            ...new Set(parsed.map((c) => c.chapterTypeId).filter(Boolean)),
          ] as number[];
          const typeMap = new Map<number, string>();
          if (typeIds.length > 0) {
            const rows = await this.dataSource.query<
              { id: number; label: string; isOther: string }[]
            >(
              `SELECT TYPECHAP_ID AS id, TYPECHAP_NAME AS label, TYPECHAP_OTHER AS isOther FROM LLTTYPECHAPTER WHERE TYPECHAP_ID IN (${typeIds.map(() => '?').join(',')})`,
              typeIds,
            );
            for (const r of rows) typeMap.set(r.id, r.isOther === 'Y' ? '' : r.label);
          }
          const chaptersForMoodle = parsed.map((ch) => ({
            name: ch.subject,
            hour: ch.hour,
            typeName: ch.chapterTypeId
              ? ch.chapterTypeOther
                ? `${ch.chapterTypeOther} (อื่นๆ)`
                : typeMap.get(ch.chapterTypeId)
              : undefined,
            subchapters: ch.subchapters?.map((s) => s.subject),
          }));
          await this.moodleService.resyncChapters(moodleId, chaptersForMoodle);
        }
      } catch (err: unknown) {
        this.logger.warn(
          `Moodle chapter sync failed on update: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { courseId };
  }

  async publish(id: number): Promise<{ courseId: number; warnings: string[] }> {
    const rows = await this.dataSource.query<
      {
        COSE_ID: number;
        COSE_NAMETH: string | null;
        COSE_NAMEEN: string | null;
        FAC_ID: number | null;
        TYPECOSE_ID: number | null;
        TYPESTUDY_ID: number | null;
        CATEGORY_ID: number | null;
        COSE_STARTDATE: Date | string | null;
        COSE_ENDDATE: Date | string | null;
        COSE_CONTRACTNAME: string | null;
        COSE_CONTRACTTEL: string | null;
        COSE_CONTRACTEMAIL: string | null;
        OPENCLASS_ID: number | null;
        LMS_ID: number | null;
        instructorCount: number | string;
      }[]
    >(
      `SELECT c.COSE_ID, c.COSE_NAMETH, c.COSE_NAMEEN, c.FAC_ID, c.TYPECOSE_ID, c.TYPESTUDY_ID,
              c.CATEGORY_ID, c.COSE_STARTDATE, c.COSE_ENDDATE,
              c.COSE_CONTRACTNAME, c.COSE_CONTRACTTEL, c.COSE_CONTRACTEMAIL,
              oc.OPENCLASS_ID, oc.LMS_ID,
              (SELECT COUNT(*) FROM LLTCOURSEINS WHERE COSE_ID = c.COSE_ID) AS instructorCount
       FROM LLTCOURSE c
       LEFT JOIN LLTOPENCLASS oc ON oc.COSE_ID = c.COSE_ID
       WHERE c.COSE_ID = ?
       LIMIT 1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Course ${id} not found`);
    const c = rows[0];

    const missing: string[] = [];
    if (!c.COSE_NAMETH) missing.push('ชื่อภาษาไทย');
    if (!c.COSE_NAMEEN) missing.push('ชื่อภาษาอังกฤษ');
    if (!c.FAC_ID) missing.push('คณะ/ส่วนงาน');
    if (!c.TYPECOSE_ID) missing.push('ประเภทหลักสูตร');
    if (!c.TYPESTUDY_ID) missing.push('รูปแบบการเรียน');
    if (!c.CATEGORY_ID) missing.push('หมวดหมู่');
    if (!c.COSE_STARTDATE) missing.push('วันเริ่ม');
    if (!c.COSE_ENDDATE) missing.push('วันสิ้นสุด');
    if (!c.COSE_CONTRACTNAME) missing.push('ชื่อผู้ติดต่อ');
    if (!c.COSE_CONTRACTTEL) missing.push('เบอร์โทรผู้ติดต่อ');
    if (!c.COSE_CONTRACTEMAIL) missing.push('อีเมลผู้ติดต่อ');
    if (missing.length) {
      throw new UnprocessableEntityException({
        message: `Cannot publish: missing required fields`,
        missing,
      });
    }

    const warnings: string[] = [];
    if (Number(c.instructorCount) === 0) {
      warnings.push('ยังไม่มี instructor ที่ถูก assign');
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(`UPDATE LLTCOURSE SET COSE_STATUS='Y' WHERE COSE_ID=?`, [id]);
      if (c.OPENCLASS_ID) {
        await runner.query(`UPDATE LLTOPENCLASS SET OPENCLASS_PUBLIC='Y' WHERE OPENCLASS_ID=?`, [
          c.OPENCLASS_ID,
        ]);
      }
      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }

    if (c.LMS_ID) {
      await this.moodleService.updateCourseVisibility(Number(c.LMS_ID), true);
    } else {
      warnings.push('ยังไม่ได้ sync Moodle (LMS_ID เป็น null)');
    }

    return { courseId: id, warnings };
  }

  async unpublish(id: number): Promise<{ courseId: number }> {
    const rows = await this.dataSource.query<
      { OPENCLASS_ID: number | null; LMS_ID: number | null }[]
    >(
      `SELECT oc.OPENCLASS_ID, oc.LMS_ID
       FROM LLTCOURSE c
       LEFT JOIN LLTOPENCLASS oc ON oc.COSE_ID = c.COSE_ID
       WHERE c.COSE_ID = ?
       LIMIT 1`,
      [id],
    );
    if (!rows.length) throw new NotFoundException(`Course ${id} not found`);
    const c = rows[0];

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(`UPDATE LLTCOURSE SET COSE_STATUS='N' WHERE COSE_ID=?`, [id]);
      if (c.OPENCLASS_ID) {
        await runner.query(`UPDATE LLTOPENCLASS SET OPENCLASS_PUBLIC='N' WHERE OPENCLASS_ID=?`, [
          c.OPENCLASS_ID,
        ]);
      }
      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }

    if (c.LMS_ID) {
      await this.moodleService.updateCourseVisibility(Number(c.LMS_ID), false);
    }

    return { courseId: id };
  }

  async remove(id: number): Promise<void> {
    const existing = await this.dataSource.query<{ COSE_ID: number }[]>(
      'SELECT COSE_ID FROM LLTCOURSE WHERE COSE_ID = ? LIMIT 1',
      [id],
    );
    if (!existing.length) {
      throw new NotFoundException(`Course ${id} not found`);
    }

    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();
    try {
      await runner.query(
        `DELETE FROM LLTOPENCLASSINS WHERE OPENCLASS_ID IN (SELECT OPENCLASS_ID FROM LLTOPENCLASS WHERE COSE_ID = ?)`,
        [id],
      );
      await runner.query(
        `DELETE FROM LLTOPENCLASSSTUTYPEFEE WHERE OPENCLASS_ID IN (SELECT OPENCLASS_ID FROM LLTOPENCLASS WHERE COSE_ID = ?)`,
        [id],
      );
      await runner.query('DELETE FROM LLTOPENCLASS WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSEINS WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSETYPECLASS WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSESKILL WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSETARGET WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSEFILE WHERE COSE_ID = ?', [id]);
      await runner.query(
        `DELETE FROM LLTCOURSESUBCHAPTER WHERE COSECHAP_ID IN (SELECT COSECHAP_ID FROM LLTCOURSECHAPTER WHERE COSE_ID = ?)`,
        [id],
      );
      await runner.query(
        `DELETE FROM LLTCOURSECHAPTERTYPE WHERE COSECHAP_ID IN (SELECT COSECHAP_ID FROM LLTCOURSECHAPTER WHERE COSE_ID = ?)`,
        [id],
      );
      await runner.query('DELETE FROM LLTCOURSECHAPTER WHERE COSE_ID = ?', [id]);
      await runner.query('DELETE FROM LLTCOURSE WHERE COSE_ID = ?', [id]);
      await runner.commitTransaction();
    } catch (err) {
      await runner.rollbackTransaction();
      throw err;
    } finally {
      await runner.release();
    }
  }

  async retryMoodleSync(courseId: number): Promise<{ ok: boolean }> {
    const rows = await this.dataSource.query<
      {
        COSE_CODE: string;
        COSE_NAMETH: string;
        COSE_OBJECTIVE: string | null;
        COSE_DESCRIPTION: string | null;
        FAC_ID: number | null;
        TYPECOSE_ID: number | null;
        CATEGORY_ID: number | null;
        SUBCATEGORY_ID: number | null;
        COSE_STARTDATE: string | null;
        COSE_ENDDATE: string | null;
        OPENCLASS_ID: number | null;
        LMS_ID: number | null;
      }[]
    >(
      `SELECT c.COSE_CODE, c.COSE_NAMETH, c.COSE_OBJECTIVE, c.COSE_DESCRIPTION,
              c.FAC_ID, c.TYPECOSE_ID, c.CATEGORY_ID, c.SUBCATEGORY_ID,
              c.COSE_STARTDATE, c.COSE_ENDDATE,
              oc.OPENCLASS_ID, oc.LMS_ID
       FROM LLTCOURSE c
       LEFT JOIN LLTOPENCLASS oc ON oc.COSE_ID = c.COSE_ID
       WHERE c.COSE_ID = ? LIMIT 1`,
      [courseId],
    );

    if (!rows.length) throw new NotFoundException(`Course ${courseId} not found`);
    const row = rows[0];

    const moodleCategoryId = await this.resolveMoodleCategoryId(
      row.CATEGORY_ID ?? 1,
      row.SUBCATEGORY_ID ?? undefined,
    );

    if (row.LMS_ID) {
      const stillExists = await this.moodleService.getCourseByField('id', row.LMS_ID);
      if (stillExists) {
        // Moodle course still exists — update metadata only
        await this.moodleService.updateCourseMeta(row.LMS_ID, {
          fullname: row.COSE_NAMETH,
          summary: row.COSE_OBJECTIVE ?? '',
          categoryId: moodleCategoryId,
          startdate: row.COSE_STARTDATE
            ? Math.floor(new Date(row.COSE_STARTDATE).getTime() / 1000)
            : undefined,
          enddate: row.COSE_ENDDATE
            ? Math.floor(new Date(row.COSE_ENDDATE).getTime() / 1000)
            : undefined,
        });
        if (row.OPENCLASS_ID) {
          await this.syncInstructorsToMoodle(courseId, row.OPENCLASS_ID, row.LMS_ID, 'ADMIN');
        }
        await this.dataSource.query(
          `UPDATE LLTOPENCLASS SET LMS_STATUS='Y', LMS_USER='ADMIN', LMS_DATE=NOW() WHERE OPENCLASS_ID=?`,
          [row.OPENCLASS_ID],
        );
        return { ok: true };
      }
      // Moodle course was deleted — clear stale LMS_ID and fall through to re-create
      this.logger.warn(
        `retryMoodleSync: Moodle course id=${row.LMS_ID} not found for LLL course ${courseId} — clearing stale LMS_ID and re-creating`,
      );
      await this.dataSource.query(
        `UPDATE LLTOPENCLASS SET LMS_ID=NULL, LMS_STATUS='N' WHERE OPENCLASS_ID=?`,
        [row.OPENCLASS_ID],
      );
      row.LMS_ID = null;
    }

    // LMS_ID is null — need to create a new Moodle course
    // Try with current code first; if shortname is taken, generate a new code
    let courseCode = row.COSE_CODE;
    let moodleCourseId: number | null = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      const courseParams = new URLSearchParams();
      courseParams.append('courses[0][fullname]', row.COSE_NAMETH);
      courseParams.append('courses[0][shortname]', courseCode);
      courseParams.append('courses[0][categoryid]', moodleCategoryId);
      courseParams.append('courses[0][summary]', row.COSE_OBJECTIVE ?? '');
      courseParams.append('courses[0][summaryformat]', '1');
      courseParams.append('courses[0][visible]', '1');
      if (row.COSE_STARTDATE) {
        courseParams.append(
          'courses[0][startdate]',
          String(Math.floor(new Date(row.COSE_STARTDATE).getTime() / 1000)),
        );
      }
      if (row.COSE_ENDDATE) {
        courseParams.append(
          'courses[0][enddate]',
          String(Math.floor(new Date(row.COSE_ENDDATE).getTime() / 1000)),
        );
      }

      try {
        await this.moodleService.callMoodleApi('core_course_create_courses', courseParams);
        moodleCourseId = await this.moodleService.getCourseMoodleIdByShortname(courseCode);
        break;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt === 0 && msg.toLowerCase().includes('shortnametaken')) {
          this.logger.warn(
            `retryMoodleSync: shortname ${courseCode} taken in Moodle — generating new code for course ${courseId}`,
          );
          courseCode = await this.generateCourseCode(row.FAC_ID ?? 1, row.TYPECOSE_ID ?? undefined);
          continue;
        }
        throw err;
      }
    }

    if (!moodleCourseId) {
      throw new Error(
        `Failed to create Moodle course for LLL course ${courseId} (shortname=${courseCode})`,
      );
    }

    // Update LLTCOURSE code if it changed
    if (courseCode !== row.COSE_CODE) {
      await this.dataSource.query(`UPDATE LLTCOURSE SET COSE_CODE = ? WHERE COSE_ID = ?`, [
        courseCode,
        courseId,
      ]);
      this.logger.log(
        `retryMoodleSync: updated course code ${row.COSE_CODE} → ${courseCode} for LLL course ${courseId}`,
      );
    }

    await this.dataSource.query(
      `UPDATE LLTOPENCLASS SET LMS_ID=?, LMS_STATUS='Y', LMS_USER='ADMIN', LMS_DATE=NOW() WHERE OPENCLASS_ID=?`,
      [moodleCourseId, row.OPENCLASS_ID],
    );
    await this.moodleService.ensureManualEnrolInstance(moodleCourseId, courseCode);
    if (row.OPENCLASS_ID) {
      await this.syncInstructorsToMoodle(courseId, row.OPENCLASS_ID, moodleCourseId, 'ADMIN');
    }

    this.logger.log(
      `retryMoodleSync: created Moodle course id=${moodleCourseId} (shortname=${courseCode}) for LLL course ${courseId}`,
    );
    return { ok: true };
  }

  async backfill(): Promise<{
    openclassinsInserted: number;
    sectionsBackfilled: number[];
    errors: string[];
  }> {
    const insertResult = await this.dataSource.query<{ affectedRows: number }>(
      `INSERT IGNORE INTO LLTOPENCLASSINS (OPENCLASS_ID, COSEINS_ID, CREATEUSER, CREATEDATE)
       SELECT oc.OPENCLASS_ID, ci.COSEINS_ID, 'BACKFILL', NOW()
       FROM LLTOPENCLASS oc
       JOIN LLTCOURSEINS ci ON ci.COSE_ID = oc.COSE_ID
       WHERE oc.OPENCLASS_PUBLIC = 'Y'
         AND NOT EXISTS (
           SELECT 1 FROM LLTOPENCLASSINS oci WHERE oci.OPENCLASS_ID = oc.OPENCLASS_ID
         )`,
    );
    const openclassinsInserted = insertResult.affectedRows ?? 0;
    this.logger.log(`backfill: inserted ${openclassinsInserted} LLTOPENCLASSINS record(s)`);

    const chapRows = await this.dataSource.query<
      { moodleCourseId: number; subject: string; hour: number | null; seq: number }[]
    >(
      `SELECT oc.LMS_ID AS moodleCourseId, ch.COSECHAP_SUBJECT AS subject,
              ch.COSECHAP_HOUR AS hour, ch.COSECHAP_SEQ AS seq
       FROM LLTCOURSECHAPTER ch
       JOIN LLTOPENCLASS oc ON oc.COSE_ID = ch.COSE_ID
       WHERE oc.OPENCLASS_PUBLIC = 'Y' AND oc.LMS_ID IS NOT NULL AND oc.LMS_STATUS = 'Y'
       ORDER BY oc.LMS_ID, ch.COSECHAP_SEQ`,
    );

    const byMoodleCourse = new Map<number, { name: string; hour?: number }[]>();
    for (const row of chapRows) {
      const arr = byMoodleCourse.get(row.moodleCourseId) ?? [];
      arr.push({ name: row.subject, ...(row.hour != null ? { hour: row.hour } : {}) });
      byMoodleCourse.set(row.moodleCourseId, arr);
    }

    const sectionsBackfilled: number[] = [];
    const errors: string[] = [];
    for (const [moodleCourseId, chapters] of byMoodleCourse) {
      try {
        await this.moodleService.initialChapterSync(moodleCourseId, chapters);
        sectionsBackfilled.push(moodleCourseId);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Moodle course ${moodleCourseId}: ${msg}`);
      }
    }

    return { openclassinsInserted, sectionsBackfilled, errors };
  }

  /** Read a course's chapters + subchapters from LLL DB in the Moodle-sync shape. */
  private async readChaptersForMoodle(
    coseId: number,
  ): Promise<{ name: string; hour?: number; typeName?: string; subchapters?: string[] }[]> {
    const [chapterRows, subRows] = await Promise.all([
      this.dataSource.query<
        {
          COSECHAP_ID: number;
          COSECHAP_SUBJECT: string;
          COSECHAP_HOUR: number | null;
          TYPECHAP_ID: number | null;
          COSECHAPTYPE_OTHER: string | null;
        }[]
      >(
        `SELECT ch.COSECHAP_ID, ch.COSECHAP_SUBJECT, ch.COSECHAP_HOUR,
                ct.TYPECHAP_ID, ct.COSECHAPTYPE_OTHER
         FROM LLTCOURSECHAPTER ch
         LEFT JOIN LLTCOURSECHAPTERTYPE ct ON ct.COSECHAP_ID = ch.COSECHAP_ID
         WHERE ch.COSE_ID = ? ORDER BY ch.COSECHAP_SEQ`,
        [coseId],
      ),
      this.dataSource.query<
        { COSECHAP_ID: number; COSESUBCHAP_SUBJECT: string; COSESUBCHAP_SEQ: number }[]
      >(
        `SELECT sub.COSECHAP_ID, sub.COSESUBCHAP_SUBJECT, sub.COSESUBCHAP_SEQ
         FROM LLTCOURSESUBCHAPTER sub
         INNER JOIN LLTCOURSECHAPTER ch ON ch.COSECHAP_ID = sub.COSECHAP_ID
         WHERE ch.COSE_ID = ? ORDER BY sub.COSECHAP_ID, sub.COSESUBCHAP_SEQ`,
        [coseId],
      ),
    ]);

    const typeIds = [...new Set(chapterRows.map((c) => c.TYPECHAP_ID).filter(Boolean))] as number[];
    const typeMap = new Map<number, string>();
    if (typeIds.length > 0) {
      const rows = await this.dataSource.query<{ id: number; label: string; isOther: string }[]>(
        `SELECT TYPECHAP_ID AS id, TYPECHAP_NAME AS label, TYPECHAP_OTHER AS isOther FROM LLTTYPECHAPTER WHERE TYPECHAP_ID IN (${typeIds.map(() => '?').join(',')})`,
        typeIds,
      );
      for (const r of rows) typeMap.set(r.id, r.isOther === 'Y' ? '' : r.label);
    }

    const subsByChap = new Map<number, string[]>();
    for (const s of subRows) {
      const list = subsByChap.get(s.COSECHAP_ID) ?? [];
      list.push(s.COSESUBCHAP_SUBJECT);
      subsByChap.set(s.COSECHAP_ID, list);
    }

    return chapterRows.map((ch) => ({
      name: ch.COSECHAP_SUBJECT,
      hour: ch.COSECHAP_HOUR ?? undefined,
      typeName: ch.TYPECHAP_ID
        ? ch.COSECHAPTYPE_OTHER
          ? `${ch.COSECHAPTYPE_OTHER} (อื่นๆ)`
          : typeMap.get(ch.TYPECHAP_ID)
        : undefined,
      subchapters: subsByChap.get(ch.COSECHAP_ID) ?? [],
    }));
  }

  /**
   * Migrate existing courses from the old "subchapters in section summary" format
   * to Moodle subsections. Re-syncs via resyncChapters (safe path: preserves teacher
   * content, idempotent). Pass a coseId to migrate a single course (for testing).
   */
  async migrateSubsections(coseId?: number): Promise<{ migrated: number[]; errors: string[] }> {
    const courses = await this.dataSource.query<{ COSE_ID: number; LMS_ID: number }[]>(
      `SELECT oc.COSE_ID, oc.LMS_ID FROM LLTOPENCLASS oc
       WHERE oc.LMS_ID IS NOT NULL AND oc.LMS_ID > 0 ${coseId ? 'AND oc.COSE_ID = ?' : ''}`,
      coseId ? [coseId] : [],
    );

    const migrated: number[] = [];
    const errors: string[] = [];
    for (const c of courses) {
      try {
        const chapters = await this.readChaptersForMoodle(c.COSE_ID);
        if (chapters.length === 0) continue;
        await this.moodleService.migrateCourseSubsections(c.LMS_ID, chapters);
        migrated.push(c.LMS_ID);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`course COSE_ID=${c.COSE_ID} LMS_ID=${c.LMS_ID}: ${msg}`);
      }
    }
    return { migrated, errors };
  }

  private mapCourseRow(row: AdminCourseRow): AdminCourseItemDto {
    return {
      courseId: Number(row.courseId),
      courseCode: row.courseCode,
      titleTh: row.titleTh,
      titleEn: row.titleEn,
      facultyId: Number(row.facultyId ?? 0),
      facultyName: row.facultyName ?? 'ไม่ระบุคณะ/ส่วนงาน',
      typeCourseId: Number(row.typeCourseId ?? 0),
      typeCourseName: row.typeCourseName ?? 'ไม่ระบุประเภท',
      responsibleName: row.responsibleName,
      startDate: (row.startDate as string | null) ?? null,
      endDate: (row.endDate as string | null) ?? null,
    };
  }

  private mapFilterOptions(rows: FilterOptionRow[]): AdminCoursesFilterOptionDto[] {
    return rows.map((row) => ({
      id: Number(row.id ?? 0),
      label: row.label ?? '',
    }));
  }
}
