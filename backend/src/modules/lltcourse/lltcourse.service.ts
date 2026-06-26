import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult, In, DataSource } from 'typeorm';
import { Readable } from 'node:stream';
import { Lltcourse } from './entities/lltcourse.entity';
import { LltOpenclass } from './entities/llt-openclass.entity';
import { LltOpenclassIns } from './entities/llt-openclassins.entity';
import { LltEnroll } from '../../lltenroll/entities/llt-enroll.entity';
import { LltOpenclassClick } from './entities/llt-openclass-click.entity';
import { LltumUser } from '../auth/entities/lltum-user.entity';
import { Lltevaluation } from '../../lltevaluation/entities/lltevaluation.entity';
import { Lltcategory } from '../../lltcategory/entities/lltcategory.entity';
import { Lltsubcategory } from '../../lltsubcategory/entities/lltsubcategory.entity';
import { Lltcoursein } from '../../lltcourseins/entities/lltcoursein.entity';
import { Lltcoursetarget } from '../../lltcoursetarget/entities/lltcoursetarget.entity';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';
import { Llttarget } from '../../llttarget/entities/llttarget.entity';
import { Lltsubtarget } from '../../lltsubtarget/entities/lltsubtarget.entity';
import { Llttypestudy } from '../../llttypestudy/entities/llttypestudy.entity';
import { CreateLltcourseDto } from './dto/create-lltcourse.dto';
import { UpdateLltcourseDto } from './dto/update-lltcourse.dto';
import { EnrollCourseDto } from '../../lltenroll/dto/enroll-course.dto';
import { ConfigService } from '@nestjs/config';
import { MoodleService } from '../moodle/moodle.service';
import { MoodleFileProxyService } from '../moodle/moodle-file-proxy.service';
import { ChatGateway } from '../../lltchat/chat-gateway';
import { LltenrollService } from '../../lltenroll/lltenroll.service';
import { getCourseImageUrl } from './course-image-catalog';
import {
  MoodleModule,
  MoodleSection,
  MoodleCourseSearchResult,
  MoodleCreateCourseResult,
  MoodleAnnouncement,
  MoodleModuleContent,
} from '../moodle/interfaces/moodle.interfaces';
import { annotateMoodleSections } from '../moodle/moodle-module-registry';

/** Raw shape of core_course_get_contents (parsing-only — not exposed to clients). */
interface RawMoodleContent {
  type?: string;
  filename?: string;
  fileurl?: string;
  mimetype?: string;
}

interface RawMoodleModule {
  id: number;
  name?: string;
  modname?: string;
  description?: string;
  url?: string;
  contents?: RawMoodleContent[];
}

interface RawMoodleSection {
  modules?: RawMoodleModule[];
}

interface RawMoodleForum {
  id: number;
  name?: string;
  type?: string;
  intro?: string;
  coursemodule?: number;
  cmid?: number;
}

export interface CoursePublicSummary {
  id: number;
  code: string | null;
  titleTh: string | null;
  titleEn: string | null;
  objective: string | null;
  imageUrl: string | null;
  imageCrop?: string | null;
  status: string | null;
  hours: number | null;
  moodleId: number | null;
  openclassId: number | null;
  maxSeats: number | null;
  amount: number | null;
  regStartDate: string | null;
  regEndDate: string | null;
  enrolledCount: number;
  clickCount: number;
  topEnrollmentRank?: number;
  facultyName: string | null;
  categoryId: number | null;
  typestudyDetail: { id: number; name: string | null } | null;
  updatedAt: string | null;
}

export interface CourseFileData {
  filename: string;
  filenameGen: string;
  size: string;
  type: string;
  path: string;
  url: string;
}

export interface CourseTargetDetail {
  id: number;
  targetId: number | null;
  subtargetId: number | null;
  targetName: string | null;
  subtargetName: string | null;
  other: string | null;
  sequence: number | null;
}

export interface CourseTypeClassDetail {
  typeclassId: number;
  typeclassName: string | null;
  amount: number | null;
  remark: string | null;
}

@Injectable()
export class LltcourseService {
  private readonly logger = new Logger(LltcourseService.name);
  private readonly moodleEnrollmentCache = new Map<string, number>();
  private readonly moodleEnrollmentCacheTtlMs = 10 * 60 * 1000;

  constructor(
    @InjectRepository(Lltcourse)
    private readonly lltcourseRepository: Repository<Lltcourse>,
    @InjectRepository(LltOpenclass)
    private readonly openclassRepository: Repository<LltOpenclass>,
    @InjectRepository(LltOpenclassIns)
    private readonly openclassInsRepository: Repository<LltOpenclassIns>,
    @InjectRepository(LltEnroll)
    private readonly enrollRepository: Repository<LltEnroll>,
    @InjectRepository(LltOpenclassClick)
    private readonly clickRepository: Repository<LltOpenclassClick>,
    @InjectRepository(LltumUser)
    private readonly lltumUserRepository: Repository<LltumUser>,
    @InjectRepository(Lltevaluation)
    private readonly evaluationRepository: Repository<Lltevaluation>,
    @InjectRepository(Lltcategory)
    private readonly categoryRepository: Repository<Lltcategory>,
    @InjectRepository(Lltsubcategory)
    private readonly subcategoryRepository: Repository<Lltsubcategory>,
    @InjectRepository(Lltcoursein)
    private readonly courseinRepository: Repository<Lltcoursein>,
    @InjectRepository(Lltcoursetarget)
    private readonly coursetargetRepository: Repository<Lltcoursetarget>,
    private configService: ConfigService,
    private moodleService: MoodleService,
    private fileProxy: MoodleFileProxyService,
    private dataSource: DataSource,
    private chatGateway: ChatGateway,
    private lltenrollService: LltenrollService,
    private platformGatewayService: PlatformGatewayService,
  ) {}

  private async generateCourseCode(
    facultyId: number | undefined,
    typeCourseId: number | undefined,
  ): Promise<string> {
    const yy = new Date().getFullYear().toString().slice(-2);
    const ff = String(facultyId ?? 0).padStart(2, '0');
    const x = typeCourseId ? String(typeCourseId).slice(-1) : '0';
    const prefix = `C${yy}${ff}${x}`;

    const rows = await this.dataSource.query<{ maxSeq: string | null }[]>(
      `SELECT MAX(CAST(SUBSTRING(COSE_CODE, 7) AS UNSIGNED)) AS maxSeq FROM LLTCOURSE WHERE COSE_CODE LIKE ?`,
      [`${prefix}%`],
    );
    const next = Number(rows[0]?.maxSeq ?? 0) + 1;
    return `${prefix}${String(next).padStart(2, '0')}`;
  }

  private async resolveMoodleCategoryId(dto: CreateLltcourseDto): Promise<string> {
    const defaultId = this.configService.get<string>('MOODLE_DEFAULT_CATEGORY_ID') ?? '1';
    if (!dto.categoryid) return defaultId;

    const categoryId = parseInt(dto.categoryid, 10);
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) return defaultId;

    if (!category.lmsId) {
      throw new BadRequestException(
        `หมวดหมู่ "${category.name}" ยังไม่ได้ sync กับ Moodle — กรุณา create หรือ update หมวดหมู่นี้ก่อนสร้าง course`,
      );
    }

    return category.lmsId.toString();
  }

  async create(
    dto: CreateLltcourseDto,
    actor: string,
    cbsFile?: CourseFileData,
  ): Promise<Lltcourse & { moodleId: number | null }> {
    const facultyId = dto.facultyId ? parseInt(dto.facultyId) : undefined;
    const typeCourseId = dto.typeCourseId ? parseInt(dto.typeCourseId) : undefined;
    const classTypeId = dto.classTypeId ? parseInt(dto.classTypeId) : undefined;
    const classFee = dto.classFee ? parseInt(dto.classFee) : 0;
    const courseCode = await this.generateCourseCode(facultyId, typeCourseId);
    this.logger.log(`Creating course: ${courseCode}`);

    // 1. Save LLTCOURSE
    const theoryHours = dto.theoryHours ? parseInt(dto.theoryHours) : undefined;
    const practiceHours = dto.practiceHours ? parseInt(dto.practiceHours) : undefined;
    const totalHours =
      theoryHours !== undefined || practiceHours !== undefined
        ? (theoryHours ?? 0) + (practiceHours ?? 0)
        : dto.hours
          ? parseInt(dto.hours)
          : undefined;
    // COSE_YEAR: auto-derive from startDate as Buddhist year (พ.ศ.)
    const year = dto.startDate ? String(new Date(dto.startDate).getFullYear() + 543) : undefined;
    const course = this.lltcourseRepository.create({
      titleTh: dto.fullname,
      titleEn: dto.titleEn,
      code: courseCode,
      categoryId: dto.categoryid ? parseInt(dto.categoryid) : undefined,
      subcategoryId: dto.subcategoryId ? parseInt(dto.subcategoryId) : undefined,
      facultyId,
      typeCourseId,
      typestudyId: dto.studyTypeId ? parseInt(dto.studyTypeId) : undefined,
      objective: dto.summary,
      imageUrl: dto.imageUrl,
      hours: totalHours,
      theoryHour: theoryHours,
      actionHour: practiceHours,
      creditBank: dto.creditBank ? parseFloat(dto.creditBank) : undefined,
      year,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      contractName: dto.contactName,
      contractEmail: dto.contactEmail,
      contractTel: dto.contactPhone,
      contractUrl: dto.contactUrl,
      precondition: dto.precondition,
      certificate: dto.certificate,
      certificateName: dto.certificateName,
      status: 'Y',
      createUser: actor,
      createDate: new Date(),
    });

    const savedCourse = await this.lltcourseRepository.save(course);

    // 2. Save LLTOPENCLASS
    const openclass = this.openclassRepository.create({
      courseId: savedCourse.id,
      isPublic: 'N',
      numOpen: dto.maxSeats ? parseInt(dto.maxSeats) : undefined,
      typeclassId: classTypeId,
      amount: classFee,
      regStartDate: dto.registrationStart ? new Date(dto.registrationStart) : undefined,
      regEndDate: dto.registrationEnd ? new Date(dto.registrationEnd) : undefined,
      classStartDate: dto.startDate ? new Date(dto.startDate) : undefined,
      classEndDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    const savedOpenclass = await this.openclassRepository.save(openclass);

    if (classTypeId) {
      await this.dataSource.query(
        `INSERT INTO LLTCOURSETYPECLASS (COSE_ID, TYPECLASS_ID, COSETYPECLASS_AMOUNT, COSETYPECLASS_REMARK, CREATEUSER, CREATEDATE)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [savedCourse.id, classTypeId, classFee, dto.classFeeRemark ?? null, actor],
      );
    }

    if (cbsFile) {
      await this.dataSource.query(
        `INSERT INTO LLTCOURSEFILE (COSE_ID, COSEFILE_NAME, COSEFILE_NAMEGEN, COSEFILE_SIZE, COSEFILE_TYPE, COSEFILE_PATH, COSEFILE_URL, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          savedCourse.id,
          cbsFile.filename,
          cbsFile.filenameGen,
          cbsFile.size,
          cbsFile.type,
          cbsFile.path,
          cbsFile.url,
          actor,
        ],
      );
    }

    // 3. Save LLTCOURSETARGET from targets JSON array
    if (dto.targets?.trim()) {
      try {
        const targetList = JSON.parse(dto.targets) as Array<{
          targetId: number;
          subtargetId?: number;
          other?: string;
        }>;
        for (let i = 0; i < targetList.length; i++) {
          const t = targetList[i];
          if (!t?.targetId) continue;
          await this.coursetargetRepository.save(
            this.coursetargetRepository.create({
              courseId: savedCourse.id,
              targetId: t.targetId,
              subtargetId: t.subtargetId ?? undefined,
              other: t.other?.trim() || undefined,
              sequence: i + 1,
              createUser: actor,
              createDate: new Date(),
            }),
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to parse/save targets: ${msg}`);
      }
    }

    // 4. Save LLTCOURSESKILL with weights if skillIds provided
    if (dto.skillIds?.trim()) {
      try {
        const skillWeights = JSON.parse(dto.skillIds) as
          | { skillId: number; weight: number }[]
          | number[];
        for (const item of skillWeights) {
          const skillId = typeof item === 'number' ? item : item.skillId;
          const weight = typeof item === 'number' ? 0 : (item.weight ?? 0);
          await this.dataSource.query(
            `INSERT IGNORE INTO LLTCOURSESKILL (COSE_ID, SKILL_ID, SKILL_WEIGHT, CREATEUSER, CREATEDATE) VALUES (?, ?, ?, ?, NOW())`,
            [savedCourse.id, skillId, weight, actor],
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to save skillIds: ${msg}`);
      }
    }

    // 5. Save LLTCOURSEINS + LLTOPENCLASSINS if instructor provided
    if (dto.instructorUsername || dto.instructorEmail) {
      try {
        const coursein = this.courseinRepository.create({
          courseId: savedCourse.id,
          email: dto.instructorEmail,
          isAdmin: 'Y',
          isTeacher: 'Y',
          createUser: actor,
          createDate: new Date(),
        });
        const savedCoursein = await this.courseinRepository.save(coursein);

        const openclassIns = this.openclassInsRepository.create({
          openclassId: savedOpenclass.id,
          courseinId: savedCoursein.id,
          createUser: actor,
          createDate: new Date(),
        });
        await this.openclassInsRepository.save(openclassIns);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to save instructor records: ${msg}`);
      }
    }

    // 6. Sync to Moodle — only mark LMS_STATUS='Y' on success
    try {
      const moodleCategoryId = await this.resolveMoodleCategoryId(dto);
      const courseParams = new URLSearchParams();
      courseParams.append('courses[0][fullname]', dto.fullname);
      courseParams.append('courses[0][shortname]', courseCode);
      courseParams.append('courses[0][categoryid]', moodleCategoryId);
      courseParams.append('courses[0][summary]', dto.summary || '');

      const moodleCourses = await this.moodleService.callMoodleApi(
        'core_course_create_courses',
        courseParams,
      );

      if (Array.isArray(moodleCourses) && (moodleCourses as MoodleCreateCourseResult[])[0]?.id) {
        const moodleCourseId = (moodleCourses as MoodleCreateCourseResult[])[0].id;
        this.logger.log(
          `Created Moodle course id=${moodleCourseId} for LLL course id=${savedCourse.id}`,
        );
        await this.saveMoodleCourseMapping(savedCourse.id, moodleCourseId);
        await this.syncMoodleCourseImage(savedCourse, moodleCourseId);
        await this.openclassRepository.update(savedOpenclass.id, {
          lmsId: moodleCourseId,
          lmsUser: 'SYSTEM',
          lmsDate: new Date(),
          lmsStatus: 'Y',
        });
        if (dto.instructorUsername) {
          try {
            const moodleUserId = await this.moodleService.getUserIdByUsername(
              dto.instructorUsername,
            );
            if (moodleUserId) {
              await this.moodleService.enrolUserInCourse(moodleCourseId, moodleUserId, 3);
              this.logger.log(
                `Enrolled instructor ${dto.instructorUsername} in Moodle course ${moodleCourseId}`,
              );
            } else {
              this.logger.warn(`Moodle user not found for instructor: ${dto.instructorUsername}`);
            }
          } catch (enrolErr: unknown) {
            const msg = enrolErr instanceof Error ? enrolErr.message : String(enrolErr);
            this.logger.warn(`Instructor Moodle enrol failed: ${msg}`);
          }
        }
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Moodle course sync failed (DB records saved): ${msg}`);
    }

    return this.withCourseImage(savedCourse, await this.getMappedMoodleId(savedCourse.id));
  }

  async findByInstructorEmail(email: string): Promise<
    Array<{
      id: number;
      code: string;
      titleTh: string;
      titleEn: string | null;
      moodleId: number | null;
      instructorEmail: string;
      startDate: Date | null;
      endDate: Date | null;
      imageUrl: string | null;
      status: string | null;
      categoryId: number | null;
    }>
  > {
    if (!email?.trim()) return [];

    const rows = await this.dataSource.query<
      {
        id: number;
        code: string;
        titleTh: string;
        titleEn: string | null;
        moodleId: number | null;
        instructorEmail: string;
        startDate: Date | null;
        endDate: Date | null;
        imageUrl: string | null;
        status: string | null;
        categoryId: number | null;
      }[]
    >(
      `SELECT
        c.COSE_ID         AS id,
        c.COSE_CODE       AS code,
        c.COSE_NAMETH     AS titleTh,
        c.COSE_NAMEEN     AS titleEn,
        c.COSE_STARTDATE  AS startDate,
        c.COSE_ENDDATE    AS endDate,
        c.COSE_IMAGE_URL  AS imageUrl,
        c.COSE_STATUS     AS status,
        c.CATEGORY_ID     AS categoryId,
        oc.LMS_ID         AS moodleId,
        ci.COSEINS_EMAIL  AS instructorEmail
      FROM LLTCOURSE c
      JOIN LLTCOURSEINS ci ON ci.COSE_ID = c.COSE_ID
      LEFT JOIN LLTOPENCLASS oc ON oc.COSE_ID = c.COSE_ID
      WHERE LOWER(TRIM(ci.COSEINS_EMAIL)) = LOWER(TRIM(?))
      GROUP BY c.COSE_ID, ci.COSEINS_EMAIL, oc.LMS_ID`,
      [email.trim()],
    );

    return rows;
  }

  // learner-facing published course list
  async findAll(): Promise<CoursePublicSummary[]> {
    const rows = await this.dataSource.query<
      {
        id: number;
        code: string | null;
        titleTh: string | null;
        titleEn: string | null;
        objective: string | null;
        imageUrl: string | null;
        imageCrop: string | null;
        status: string | null;
        hours: number | null;
        categoryId: number | null;
        typestudyId: number | null;
        typestudyName: string | null;
        moodleId: number | null;
        maxSeats: number | null;
        amount: number | null;
        regStartDate: string | null;
        regEndDate: string | null;
        enrolledCount: string | number;
        clickCount: string | number;
        openclassId: number | null;
        facultyName: string | null;
        updatedAt: Date | string | null;
      }[]
    >(`
      SELECT
        c.COSE_ID              AS id,
        c.COSE_CODE            AS code,
        c.COSE_NAMETH          AS titleTh,
        c.COSE_NAMEEN          AS titleEn,
        c.COSE_OBJECTIVE       AS objective,
        c.COSE_IMAGE_URL       AS imageUrl,
        c.COSE_IMAGE_CROP      AS imageCrop,
        c.COSE_STATUS          AS status,
        c.COSE_HOUR            AS hours,
        c.CATEGORY_ID          AS categoryId,
        c.TYPESTUDY_ID         AS typestudyId,
        ts.TYPESTUDY_NAME      AS typestudyName,
        f.FAC_NAME             AS facultyName,
        oc.LMS_ID              AS moodleId,
        oc.OPENCLASS_NUMOPEN   AS maxSeats,
        oc.OPENCLASS_AMOUNT    AS amount,
        oc.OPENCLASS_REGSTARTDATE AS regStartDate,
        oc.OPENCLASS_REGENDDATE   AS regEndDate,
        (SELECT COUNT(*) FROM LLTENROLL e WHERE e.OPENCLASS_ID = oc.OPENCLASS_ID AND NOT EXISTS (SELECT 1 FROM LLTCERTIFICATE cert WHERE cert.ENROLL_ID = e.ENROLL_ID)) AS enrolledCount,
        (SELECT COUNT(*) FROM LLTOPENCLASSCLICK ck WHERE ck.OPENCLASS_ID = oc.OPENCLASS_ID) AS clickCount,
        oc.OPENCLASS_ID AS openclassId,
        COALESCE(c.UPDATEDATE, c.CREATEDATE) AS updatedAt
      FROM LLTCOURSE c
      INNER JOIN LLTOPENCLASS oc
        ON oc.OPENCLASS_ID = (
          SELECT MIN(oc2.OPENCLASS_ID)
          FROM LLTOPENCLASS oc2
          WHERE oc2.COSE_ID = c.COSE_ID AND oc2.OPENCLASS_PUBLIC = 'Y'
        )
      LEFT JOIN LLTTYPESTUDY ts ON ts.TYPESTUDY_ID = c.TYPESTUDY_ID
      LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
      WHERE c.COSE_STATUS = 'Y'
      ORDER BY c.COSE_ID DESC
    `);

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      titleTh: row.titleTh,
      titleEn: row.titleEn,
      objective: row.objective,
      imageUrl: row.imageUrl || getCourseImageUrl(),
      imageCrop: row.imageCrop ?? null,
      status: row.status,
      hours: row.hours,
      moodleId: row.moodleId ?? null,
      maxSeats: row.maxSeats ?? null,
      amount: row.amount ?? null,
      regStartDate: row.regStartDate
        ? new Date(row.regStartDate).toISOString().substring(0, 10)
        : null,
      regEndDate: row.regEndDate ? new Date(row.regEndDate).toISOString().substring(0, 10) : null,
      enrolledCount: Number(row.enrolledCount ?? 0),
      clickCount: Number(row.clickCount ?? 0),
      openclassId: row.openclassId ?? null,
      facultyName: row.facultyName ?? null,
      categoryId: row.categoryId,
      typestudyDetail: row.typestudyId ? { id: row.typestudyId, name: row.typestudyName } : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    }));
  }

  async findTopEnrolled(limit = 10): Promise<CoursePublicSummary[]> {
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 10);
    const rows = await this.dataSource.query<
      {
        id: number;
        code: string | null;
        titleTh: string | null;
        titleEn: string | null;
        objective: string | null;
        imageUrl: string | null;
        imageCrop: string | null;
        status: string | null;
        hours: number | null;
        categoryId: number | null;
        typestudyId: number | null;
        typestudyName: string | null;
        moodleId: number | null;
        maxSeats: number | null;
        amount: number | null;
        regStartDate: string | null;
        regEndDate: string | null;
        enrolledCount: string | number;
        clickCount: string | number;
        openclassId: number | null;
        facultyName: string | null;
        updatedAt: Date | string | null;
      }[]
    >(
      `
      SELECT
        c.COSE_ID              AS id,
        c.COSE_CODE            AS code,
        c.COSE_NAMETH          AS titleTh,
        c.COSE_NAMEEN          AS titleEn,
        c.COSE_OBJECTIVE       AS objective,
        c.COSE_IMAGE_URL       AS imageUrl,
        c.COSE_IMAGE_CROP      AS imageCrop,
        c.COSE_STATUS          AS status,
        c.COSE_HOUR            AS hours,
        c.CATEGORY_ID          AS categoryId,
        c.TYPESTUDY_ID         AS typestudyId,
        ts.TYPESTUDY_NAME      AS typestudyName,
        f.FAC_NAME             AS facultyName,
        oc.LMS_ID              AS moodleId,
        oc.OPENCLASS_NUMOPEN   AS maxSeats,
        oc.OPENCLASS_AMOUNT    AS amount,
        oc.OPENCLASS_REGSTARTDATE AS regStartDate,
        oc.OPENCLASS_REGENDDATE   AS regEndDate,
        COUNT(e.ENROLL_ID) AS enrolledCount,
        (SELECT COUNT(*) FROM LLTOPENCLASSCLICK ck WHERE ck.OPENCLASS_ID = oc.OPENCLASS_ID) AS clickCount,
        oc.OPENCLASS_ID AS openclassId,
        COALESCE(c.UPDATEDATE, c.CREATEDATE) AS updatedAt
      FROM LLTCOURSE c
      INNER JOIN LLTOPENCLASS oc
        ON oc.OPENCLASS_ID = (
          SELECT MIN(oc2.OPENCLASS_ID)
          FROM LLTOPENCLASS oc2
          WHERE oc2.COSE_ID = c.COSE_ID AND oc2.OPENCLASS_PUBLIC = 'Y'
        )
      LEFT JOIN LLTENROLL e ON e.OPENCLASS_ID = oc.OPENCLASS_ID
      LEFT JOIN LLTTYPESTUDY ts ON ts.TYPESTUDY_ID = c.TYPESTUDY_ID
      LEFT JOIN LLTFACULTY f ON f.FAC_ID = c.FAC_ID
      WHERE c.COSE_STATUS = 'Y'
      GROUP BY
        c.COSE_ID,
        c.COSE_CODE,
        c.COSE_NAMETH,
        c.COSE_NAMEEN,
        c.COSE_OBJECTIVE,
        c.COSE_IMAGE_URL,
        c.COSE_IMAGE_CROP,
        c.COSE_STATUS,
        c.COSE_HOUR,
        c.CATEGORY_ID,
        c.TYPESTUDY_ID,
        ts.TYPESTUDY_NAME,
        f.FAC_NAME,
        oc.LMS_ID,
        oc.OPENCLASS_NUMOPEN,
        oc.OPENCLASS_AMOUNT,
        oc.OPENCLASS_REGSTARTDATE,
        oc.OPENCLASS_REGENDDATE,
        oc.OPENCLASS_ID,
        c.UPDATEDATE,
        c.CREATEDATE
      ORDER BY enrolledCount DESC, c.COSE_ID DESC
      LIMIT ?
    `,
      [safeLimit],
    );

    return rows.map((row, index) => ({
      id: row.id,
      code: row.code,
      titleTh: row.titleTh,
      titleEn: row.titleEn,
      objective: row.objective,
      imageUrl: row.imageUrl || getCourseImageUrl(),
      imageCrop: row.imageCrop ?? null,
      status: row.status,
      hours: row.hours,
      moodleId: row.moodleId ?? null,
      maxSeats: row.maxSeats ?? null,
      amount: row.amount ?? null,
      regStartDate: row.regStartDate
        ? new Date(row.regStartDate).toISOString().substring(0, 10)
        : null,
      regEndDate: row.regEndDate ? new Date(row.regEndDate).toISOString().substring(0, 10) : null,
      enrolledCount: Number(row.enrolledCount ?? 0),
      clickCount: Number(row.clickCount ?? 0),
      topEnrollmentRank: index + 1,
      openclassId: row.openclassId ?? null,
      facultyName: row.facultyName ?? null,
      categoryId: row.categoryId,
      typestudyDetail: row.typestudyId ? { id: row.typestudyId, name: row.typestudyName } : null,
      updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
    }));
  }

  async findOne(id: number): Promise<
    | (Lltcourse & {
        moodleId: number | null;
        evaluationText?: string | null;
        typestudyDetail?: Llttypestudy | null;
        targets?: CourseTargetDetail[];
        typeClasses?: CourseTypeClassDetail[];
        instructorInfo?: {
          nameTh: string | null;
          nameEn: string | null;
          email: string | null;
          titleTh: string | null;
          titleEn: string | null;
        } | null;
        syllabus?: { seq: number; subject: string | null; hour: number | null }[];
        vdo?: string | null;
        teachTime?: string | null;
      })
    | null
  > {
    const course = await this.lltcourseRepository.findOneBy({ id });
    if (!course) return null;

    const evaluationText: string | null = course.evaluation?.trim() || null;

    let typestudyDetail: Llttypestudy | null = null;
    if (course.typestudyId) {
      typestudyDetail = await this.dataSource
        .getRepository(Llttypestudy)
        .findOneBy({ id: course.typestudyId });
    }

    // Fetch targets for this course from LLTCOURSETARGET
    const courseTargets = await this.coursetargetRepository.find({
      where: { courseId: course.id },
    });

    const targetsWithNames = [];
    if (courseTargets.length > 0) {
      const targetIds = courseTargets
        .map((ct) => ct.targetId)
        .filter((tid): tid is number => tid !== null);
      const subtargetIds = courseTargets
        .map((ct) => ct.subtargetId)
        .filter((sid): sid is number => sid !== null);

      const targets =
        targetIds.length > 0
          ? await this.dataSource.getRepository(Llttarget).findBy({ id: In(targetIds) })
          : [];

      const subtargets =
        subtargetIds.length > 0
          ? await this.dataSource.getRepository(Lltsubtarget).findBy({ id: In(subtargetIds) })
          : [];

      const targetMap = new Map(targets.map((t) => [t.id, t]));
      const subtargetMap = new Map(subtargets.map((st) => [st.id, st]));

      for (const ct of courseTargets) {
        const targetObj = ct.targetId ? targetMap.get(ct.targetId) : null;
        const subtargetObj = ct.subtargetId ? subtargetMap.get(ct.subtargetId) : null;
        if (targetObj) {
          targetsWithNames.push({
            id: ct.id,
            targetId: ct.targetId,
            subtargetId: ct.subtargetId,
            targetName: targetObj.name,
            subtargetName: subtargetObj?.name ?? null,
            other: ct.other,
            sequence: ct.sequence,
          });
        }
      }
    }

    // Fetch typeclass for this course
    const typeClassRows = await this.dataSource.query<
      {
        TYPECLASS_ID: number;
        TYPECLASS_NAME: string | null;
        COSETYPECLASS_AMOUNT: number | null;
        COSETYPECLASS_REMARK: string | null;
      }[]
    >(
      `SELECT tc.TYPECLASS_ID, tc.TYPECLASS_NAME, ctc.COSETYPECLASS_AMOUNT, ctc.COSETYPECLASS_REMARK
       FROM LLTCOURSETYPECLASS ctc
       JOIN LLTTYPECLASS tc ON ctc.TYPECLASS_ID = tc.TYPECLASS_ID
       WHERE ctc.COSE_ID = ?
       ORDER BY tc.TYPECLASS_ID ASC`,
      [id],
    );

    const typeClasses: CourseTypeClassDetail[] = typeClassRows.map((row) => ({
      typeclassId: row.TYPECLASS_ID,
      typeclassName: row.TYPECLASS_NAME,
      amount: row.COSETYPECLASS_AMOUNT,
      remark: row.COSETYPECLASS_REMARK,
    }));

    // Fetch real instructor info from LLTCOURSEINS joined with LLTUMUSER
    const instructorRows = await this.dataSource.query<
      {
        email: string | null;
        firstNameTh: string | null;
        lastNameTh: string | null;
        firstNameEn: string | null;
        lastNameEn: string | null;
        titleTh: string | null;
        titleEn: string | null;
      }[]
    >(
      `SELECT ci.COSEINS_EMAIL AS email,
              COALESCE(p.PSN_FNAMETH, u.USER_FNAMETH) AS firstNameTh,
              COALESCE(p.PSN_LNAMETH, u.USER_LNAMETH) AS lastNameTh,
              u.USER_FNAMEEN                           AS firstNameEn,
              u.USER_LNAMEEN                           AS lastNameEn,
              COALESCE(p.PRF_NAMETH, u.THAID_TITLETH) AS titleTh,
              u.THAID_TITLEEN                          AS titleEn
       FROM LLTCOURSEINS ci
       LEFT JOIN LLTUMUSER u ON LOWER(TRIM(u.USER_EMAIL)) = LOWER(TRIM(ci.COSEINS_EMAIL))
       LEFT JOIN PSNTPERSON p ON p.PSN_ID = ci.PSN_ID
       WHERE ci.COSE_ID = ?
       ORDER BY CASE WHEN ci.COSEINS_ADMIN = 'Y' THEN 0 ELSE 1 END,
                CASE WHEN ci.COSEINS_TEACHER = 'Y' THEN 0 ELSE 1 END
       LIMIT 1`,
      [id],
    );

    let instructorInfo: {
      nameTh: string | null;
      nameEn: string | null;
      email: string | null;
      titleTh: string | null;
      titleEn: string | null;
    } | null = null;

    if (instructorRows.length > 0) {
      const row = instructorRows[0];
      const nameTh =
        [row.titleTh, row.firstNameTh, row.lastNameTh].filter(Boolean).join(' ').trim() || null;
      const nameEn =
        [row.titleEn, row.firstNameEn, row.lastNameEn].filter(Boolean).join(' ').trim() || null;
      instructorInfo = {
        nameTh,
        nameEn,
        email: row.email,
        titleTh: row.titleTh,
        titleEn: row.titleEn,
      };
    }

    const chapterRows = await this.dataSource.query<
      { seq: number; subject: string | null; hour: number | null }[]
    >(
      `SELECT COSECHAP_SEQ AS seq, COSECHAP_SUBJECT AS subject, COSECHAP_HOUR AS hour
       FROM LLTCOURSECHAPTER WHERE COSE_ID = ? ORDER BY COSECHAP_SEQ ASC`,
      [id],
    );

    const openclass = await this.openclassRepository.findOne({
      where: { courseId: id, isPublic: 'Y' },
      order: { id: 'ASC' },
    });

    return {
      ...this.withCourseImage(course, await this.getMappedMoodleId(course.id)),
      evaluationText,
      typestudyDetail,
      targets: targetsWithNames,
      typeClasses,
      instructorInfo,
      syllabus: chapterRows,
      vdo: openclass?.vdo ?? null,
      teachTime: openclass?.teachTime ?? null,
    };
  }

  async syncAllMoodleCourseImages(): Promise<{ checked: number; synced: number }> {
    const courses = await this.lltcourseRepository.find();
    const moodleIdByCourseId = await this.getMappedMoodleIds(courses.map((course) => course.id));
    let synced = 0;

    for (const course of courses) {
      const moodleId = moodleIdByCourseId.get(course.id);
      if (!moodleId) continue;

      await this.syncMoodleCourseImage(course, moodleId);
      synced += 1;
    }

    return { checked: courses.length, synced };
  }

  async update(
    id: number,
    updateLltcourseDto: UpdateLltcourseDto,
    actor: string,
  ): Promise<(Lltcourse & { moodleId: number | null }) | null> {
    const existing = await this.lltcourseRepository.findOne({ where: { id } });
    if (
      existing &&
      existing.imageUrl &&
      updateLltcourseDto.imageUrl !== undefined &&
      existing.imageUrl !== updateLltcourseDto.imageUrl
    ) {
      const gatewayPath = toGatewayFilePath(existing.imageUrl);
      if (gatewayPath) {
        await this.platformGatewayService.deleteFile(gatewayPath).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.warn(`Failed to delete old course image from gateway: ${message}`);
        });
      }
    }

    await this.lltcourseRepository.update(id, {
      ...(updateLltcourseDto as unknown as Partial<Lltcourse>),
      updateUser: actor,
    });

    if (
      updateLltcourseDto.registrationStart !== undefined ||
      updateLltcourseDto.registrationEnd !== undefined
    ) {
      const openclass = await this.openclassRepository.findOne({
        where: { courseId: id },
        order: { id: 'DESC' },
      });
      if (openclass) {
        const ocUpdates: Partial<LltOpenclass> = {};
        if (updateLltcourseDto.registrationStart !== undefined) {
          ocUpdates.regStartDate = updateLltcourseDto.registrationStart
            ? new Date(updateLltcourseDto.registrationStart)
            : null;
        }
        if (updateLltcourseDto.registrationEnd !== undefined) {
          ocUpdates.regEndDate = updateLltcourseDto.registrationEnd
            ? new Date(updateLltcourseDto.registrationEnd)
            : null;
        }
        await this.openclassRepository.update(openclass.id, ocUpdates);
      }
    }

    return this.findOne(id);
  }

  private withCourseImage(
    course: Lltcourse,
    moodleId: number | null,
  ): Lltcourse & { moodleId: number | null } {
    return {
      ...course,
      imageUrl: course.imageUrl || getCourseImageUrl(),
      moodleId,
    };
  }

  private async getMappedMoodleId(courseId: number): Promise<number | null> {
    const openclass = await this.openclassRepository.findOne({ where: { courseId } });
    return openclass?.lmsId ?? null;
  }

  private async getMappedMoodleIds(courseIds: number[]): Promise<Map<number, number>> {
    if (courseIds.length === 0) return new Map();

    const openclasses = await this.openclassRepository.find({
      where: { courseId: In(courseIds) },
      order: { id: 'ASC' },
    });

    const moodleIdByCourseId = new Map<number, number>();
    for (const openclass of openclasses) {
      if (openclass.courseId && openclass.lmsId && !moodleIdByCourseId.has(openclass.courseId)) {
        moodleIdByCourseId.set(openclass.courseId, openclass.lmsId);
      }
    }

    return moodleIdByCourseId;
  }

  private async saveMoodleCourseMapping(courseId: number, moodleCourseId: number): Promise<void> {
    const existing = await this.openclassRepository.findOne({ where: { courseId } });
    if (existing) {
      await this.openclassRepository.update(existing.id, { lmsId: moodleCourseId });
      return;
    }

    await this.openclassRepository.save(
      this.openclassRepository.create({
        courseId,
        lmsId: moodleCourseId,
        isPublic: 'Y',
        amount: 0,
      }),
    );
  }

  async createMoodleModule(
    courseId: number,
    type: 'quiz' | 'assign',
    name: string,
    sectionIndex: number = 1,
  ): Promise<unknown> {
    const params = new URLSearchParams();
    params.append('courseid', courseId.toString());
    params.append('modname', type);
    params.append('sectionindex', sectionIndex.toString());
    params.append('options[0][name]', 'name');
    params.append('options[0][value]', name);

    if (type === 'assign') {
      params.append('options[1][name]', 'intro');
      params.append('options[1][value]', `กิจกรรมส่งงาน: ${name}`);
      params.append('options[2][name]', 'introformat');
      params.append('options[2][value]', '1');
    }

    return await this.moodleService.callMoodleApi('local_wstools_create_module', params);
  }

  async getMoodleContentsByMoodleId(moodleCourseId: number): Promise<MoodleSection[]> {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    try {
      const sections = (await this.moodleService.callMoodleApi(
        'core_course_get_contents',
        params,
      )) as MoodleSection[];
      return annotateMoodleSections(sections, moodleCourseId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('invalidrecord')) {
        throw new NotFoundException(`Moodle course ${moodleCourseId} not found`);
      }
      throw err;
    }
  }

  /**
   * Task 3a — เนื้อหาของ Moodle module เดียว เพื่อ render แบบ native ในแอป.
   * ใช้ core_course_get_contents (idempotent, read-only) แล้ว filter หา module ตาม id
   * map เฉพาะ field ที่ปลอดภัยลง DTO — ไม่ส่ง payload ดิบ/ไม่ leak MOODLE_TOKEN.
   * fileurl ของ pluginfile (ทั้งใน contents[] และที่ฝังใน description HTML) ถูก rewrite
   * เป็น signed proxy URL ของ backend (Task 3 file proxy) — token อยู่ฝั่ง server เท่านั้น.
   */
  async getMoodleModuleContent(
    moodleCourseId: number,
    moduleId: number,
  ): Promise<MoodleModuleContent> {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    const sections = (await this.moodleService.callMoodleApi(
      'core_course_get_contents',
      params,
    )) as RawMoodleSection[];

    const module = (Array.isArray(sections) ? sections : [])
      .flatMap((s) => s.modules ?? [])
      .find((m) => m.id === moduleId);

    if (!module) {
      throw new NotFoundException(`ไม่พบ module id ${moduleId} ในวิชา Moodle id ${moodleCourseId}`);
    }

    const modname = module.modname ?? '';
    const base = { id: module.id, name: module.name ?? '', modname, url: module.url ?? null };

    // page: เนื้อหาจริงอยู่ใน mod_page (core_course_get_contents คืนแค่ไฟล์ index.html)
    if (modname === 'page') {
      const html = await this.getPageContentHtml(moodleCourseId, moduleId);
      if (html !== null) {
        return { ...base, description: this.rewriteEmbeddedFileUrls(html), contents: [] };
      }
    }

    // forum/Announcements: render รายการประกาศในแอป แทนการเด้งออก Moodle
    if (modname === 'forum') {
      const forum = await this.getForumMetadata(moodleCourseId, moduleId, module.name ?? '');
      const descriptionSource = module.description || forum?.intro || '';
      const description = descriptionSource ? this.rewriteEmbeddedFileUrls(descriptionSource) : '';
      const announcementsHtml =
        forum?.type === 'news' ? await this.buildAnnouncementsHtml(moodleCourseId) : null;
      const html = [description, announcementsHtml].filter((part) => part && part.trim()).join('');
      return {
        ...base,
        description: html || null,
        contents: [],
      };
    }

    const contents = Array.isArray(module.contents)
      ? module.contents
          .filter((c) => typeof c.fileurl === 'string' && c.fileurl.length > 0)
          .map((c) => ({
            type: c.type ?? 'file',
            filename: c.filename ?? '',
            fileurl: this.toMoodleFileProxyUrl(c.fileurl as string),
            mimetype: c.mimetype ?? null,
          }))
      : [];

    return {
      ...base,
      description: module.description ? this.rewriteEmbeddedFileUrls(module.description) : null,
      contents,
    };
  }

  /** ดึง HTML เนื้อหาของ page module จาก mod_page (คืน null ถ้าไม่พบ/ดึงไม่ได้ → fallback). */
  private async getPageContentHtml(
    moodleCourseId: number,
    moduleId: number,
  ): Promise<string | null> {
    try {
      const params = new URLSearchParams();
      params.append('courseids[0]', moodleCourseId.toString());
      const result = (await this.moodleService.callMoodleApi(
        'mod_page_get_pages_by_courses',
        params,
      )) as {
        pages?: Array<{
          coursemodule?: number;
          content?: string;
          contentfiles?: Array<{ filename?: string; filepath?: string; fileurl?: string }>;
        }>;
      };

      const page = (result?.pages ?? []).find((p) => p.coursemodule === moduleId);
      if (!page || typeof page.content !== 'string') return null;
      return this.resolvePluginfilePlaceholders(page.content, page.contentfiles ?? []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`getPageContentHtml error: ${msg}`);
      return null;
    }
  }

  /** แทนที่ @@PLUGINFILE@@ ใน content HTML ด้วย fileurl จริงของแต่ละไฟล์. */
  private resolvePluginfilePlaceholders(
    html: string,
    files: Array<{ filename?: string; filepath?: string; fileurl?: string }>,
  ): string {
    let out = html;
    for (const f of files) {
      if (!f.fileurl || !f.filename) continue;
      const placeholder = `@@PLUGINFILE@@${f.filepath ?? '/'}${f.filename}`;
      out = out.split(placeholder).join(f.fileurl);
    }
    return out;
  }

  /** ประกอบ HTML รายการประกาศ (news forum) เพื่อ render ในแอป — คืน null ถ้าไม่มีประกาศ. */
  private async buildAnnouncementsHtml(moodleCourseId: number): Promise<string | null> {
    const announcements = await this.getCourseAnnouncements(moodleCourseId);
    if (!announcements.length) return null;

    const items = announcements
      .map((a) => {
        const when = this.formatThaiDate(a.created);
        const meta = [a.author ? this.escapeHtml(a.author) : '', when].filter(Boolean).join(' · ');
        return (
          `<article style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #eee;">` +
          `<h3 style="margin:0 0 4px;">${this.escapeHtml(a.subject)}</h3>` +
          (meta
            ? `<div style="color:#888;font-size:0.85em;margin-bottom:8px;">${meta}</div>`
            : '') +
          `<div>${a.message ?? ''}</div>` +
          `</article>`
        );
      })
      .join('');

    return `<div>${items}</div>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private formatThaiDate(unixSeconds: number): string {
    if (!unixSeconds) return '';
    try {
      return new Date(unixSeconds * 1000).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  }

  /** ดึง forum intro จาก Moodle API เพราะ core_course_get_contents อาจไม่ส่ง description ของ forum. */
  private async getForumMetadata(
    moodleCourseId: number,
    moduleId: number,
    moduleName: string,
  ): Promise<RawMoodleForum | null> {
    const moduleParams = new URLSearchParams();
    moduleParams.append('coursemoduleid', moduleId.toString());
    try {
      const forum = (await this.moodleService.callMoodleApi(
        'local_wstools_get_forum_module',
        moduleParams,
      )) as RawMoodleForum;
      if (forum && typeof forum === 'object') return forum;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`getForumMetadata local_wstools error: ${msg}`);
    }

    try {
      const params = new URLSearchParams();
      params.append('courseids[0]', moodleCourseId.toString());
      const forums = (await this.moodleService.callMoodleApi(
        'mod_forum_get_forums_by_courses',
        params,
      )) as RawMoodleForum[];

      if (!Array.isArray(forums)) return null;

      return (
        forums.find((forum) => forum.coursemodule === moduleId || forum.cmid === moduleId) ??
        forums.find((forum) => forum.name === moduleName) ??
        null
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`getForumMetadata error: ${msg}`);
      return null;
    }
  }

  // ── Moodle file proxy (Task 3) ────────────────────────────────────────────
  // pluginfile ของ Moodle ต้องใช้ token ถึงจะเข้าถึงได้ และ token ห้ามหลุดไป client.
  // วิธี: backend mint signed URL (HMAC + วันหมดอายุ) ชี้มาที่ endpoint proxy ของตัวเอง
  // → proxy ตรวจ signature แล้ว fetch ไฟล์ฝั่ง server พร้อมแนบ token แล้ว stream กลับ.
  // signed URL เป็น public ได้อย่างปลอดภัยเพราะปลอม signature ไม่ได้และหมดอายุ —
  // จึงใช้ได้กับ <img> ที่ฝังใน description (native img request แนบ JWT header ไม่ได้).

  // Delegates to the shared MoodleFileProxyService (moodle module).
  private toMoodleFileProxyUrl(fileurl: string): string {
    return this.fileProxy.toProxyUrl(fileurl);
  }

  private rewriteEmbeddedFileUrls(html: string): string {
    return this.fileProxy.rewriteEmbeddedFileUrls(html);
  }

  getMoodleFileStream(
    fileurl: string,
    exp: string,
    sig: string,
  ): Promise<{
    stream: Readable;
    contentType: string | null;
    contentDisposition: string | null;
    contentLength: string | null;
  }> {
    return this.fileProxy.getFileStream(fileurl, exp, sig);
  }

  async getCourseAnnouncements(moodleCourseId: number): Promise<MoodleAnnouncement[]> {
    try {
      const forumParams = new URLSearchParams();
      forumParams.append('courseids[0]', moodleCourseId.toString());
      const forums = (await this.moodleService.callMoodleApi(
        'mod_forum_get_forums_by_courses',
        forumParams,
      )) as Array<{ id: number; name: string; type: string }>;

      const announcementForum = Array.isArray(forums)
        ? forums.find((f) => f.type === 'news')
        : null;
      if (!announcementForum) return [];

      const discussParams = new URLSearchParams();
      discussParams.append('forumid', announcementForum.id.toString());
      discussParams.append('page', '0');
      discussParams.append('perpage', '20');
      const result = (await this.moodleService.callMoodleApi(
        'mod_forum_get_forum_discussions',
        discussParams,
      )) as {
        discussions?: Array<{
          id: number;
          name: string;
          message: string;
          created: number;
          userfullname: string;
          pinned: boolean;
        }>;
      };

      const discussions = result?.discussions ?? [];
      return discussions.map((d) => ({
        id: d.id,
        subject: d.name,
        message: d.message,
        created: d.created,
        author: d.userfullname ?? '',
        pinned: d.pinned ?? false,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`getCourseAnnouncements error: ${msg}`);
      return [];
    }
  }

  async getMoodleActivitiesByShortname(shortname: string): Promise<MoodleModule[]> {
    if (!shortname) return [];

    try {
      const searchParams = new URLSearchParams();
      searchParams.append('field', 'shortname');
      searchParams.append('value', shortname);

      const result = await this.moodleService.callMoodleApi(
        'core_course_get_courses_by_field',
        searchParams,
      );
      this.logger.log(`Moodle search result: ${JSON.stringify(result)}`);

      const { courses } = result as MoodleCourseSearchResult;
      if (!Array.isArray(courses) || courses.length === 0) return [];

      const moodleCourseId = courses[0].id;
      const contentParams = new URLSearchParams();
      contentParams.append('courseid', moodleCourseId.toString());

      const sections = (await this.moodleService.callMoodleApi(
        'core_course_get_contents',
        contentParams,
      )) as MoodleSection[];

      const modules = sections.flatMap((s) => s.modules ?? []);
      return modules.filter((m) => m.modname !== 'forum');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`getMoodleActivitiesByShortname error: ${msg}`);
      throw new BadRequestException(`Moodle error: ${msg}`);
    }
  }

  async getMoodleSsoUrl(
    passedMoodleCourseId: number,
    username: string,
    courseCode?: string,
    wantsurl?: string,
  ): Promise<{ url: string }> {
    let moodleCourseId: number | null = passedMoodleCourseId > 0 ? passedMoodleCourseId : null;

    if (!moodleCourseId && courseCode) {
      try {
        const foundId = await this.moodleService.getCourseMoodleIdByShortname(courseCode);
        if (foundId) {
          moodleCourseId = foundId;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Moodle course lookup failed (continuing to SSO): ${msg}`);
      }
    }

    // Verify the Moodle course still exists before building a direct course URL.
    // LMS_ID in LLTOPENCLASS can become stale if the course is deleted in Moodle directly.
    if (moodleCourseId) {
      try {
        const exists = await this.moodleService.getCourseByField('id', moodleCourseId);
        if (!exists) {
          this.logger.warn(
            `Moodle course id=${moodleCourseId} not found — falling back to Moodle home (stale LMS_ID?)`,
          );
          moodleCourseId = null;
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Moodle course existence check failed (continuing): ${msg}`);
      }
    }

    if (moodleCourseId && username && !this.hasRecentMoodleEnrollment(username, moodleCourseId)) {
      try {
        const moodleUserId = await this.moodleService.getUserIdByUsername(username);
        if (moodleUserId) {
          await this.moodleService.enrolUserInCourse(moodleCourseId, moodleUserId, 5); // 5 = Student
          this.markRecentMoodleEnrollment(username, moodleCourseId);
          this.logger.log(`Enrolled student ${username} in Moodle course ${moodleCourseId}`);
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Student Moodle enrollment failed (continuing to SSO): ${msg}`);
      }
    }

    const loginUrl = await this.moodleService.getMoodleLoginUrl(username);
    let publicLoginUrl = this.toPublicMoodleUrl(loginUrl);

    const resolvedWantsUrl = wantsurl
      ? wantsurl.startsWith('/')
        ? this.toPublicMoodleUrl(wantsurl)
        : wantsurl
      : moodleCourseId
        ? this.toPublicMoodleUrl(`/course/view.php?id=${moodleCourseId}`)
        : null;

    if (resolvedWantsUrl) {
      publicLoginUrl = this.appendWantsUrl(publicLoginUrl, resolvedWantsUrl);
    }

    return { url: publicLoginUrl };
  }

  async getInstructorCourseUrl(moodleCourseId: number, username: string): Promise<{ url: string }> {
    const loginUrl = await this.moodleService.getMoodleLoginUrl(username);
    const publicLoginUrl = this.toPublicMoodleUrl(loginUrl);
    const courseUrl = this.toPublicMoodleUrl(`/course/view.php?id=${moodleCourseId}`);
    return { url: this.appendWantsUrl(publicLoginUrl, courseUrl) };
  }

  private hasRecentMoodleEnrollment(username: string, moodleCourseId: number): boolean {
    const key = this.getMoodleEnrollmentCacheKey(username, moodleCourseId);
    const cachedAt = this.moodleEnrollmentCache.get(key);
    return Boolean(cachedAt && Date.now() - cachedAt < this.moodleEnrollmentCacheTtlMs);
  }

  private markRecentMoodleEnrollment(username: string, moodleCourseId: number): void {
    this.moodleEnrollmentCache.set(
      this.getMoodleEnrollmentCacheKey(username, moodleCourseId),
      Date.now(),
    );
  }

  private getMoodleEnrollmentCacheKey(username: string, moodleCourseId: number): string {
    return `${username}:${moodleCourseId}`;
  }

  private getMoodlePublicUrl(): string {
    return (
      this.configService.get<string>('MOODLE_PUBLIC_URL') ||
      this.configService.get<string>('MOODLE_BASE_URL') ||
      ''
    ).replace(/\/+$/, '');
  }

  private toPublicMoodleUrl(urlOrPath: string): string {
    const publicBaseUrl = this.getMoodlePublicUrl();
    if (!publicBaseUrl) return urlOrPath;

    if (urlOrPath.startsWith('/')) {
      return `${publicBaseUrl}${urlOrPath}`;
    }

    try {
      const publicBase = new URL(publicBaseUrl);
      const url = new URL(urlOrPath);
      url.protocol = publicBase.protocol;
      url.host = publicBase.host;
      return url.toString();
    } catch {
      return urlOrPath;
    }
  }

  private appendWantsUrl(loginUrl: string, wantsUrl: string): string {
    try {
      const url = new URL(loginUrl);
      url.searchParams.set('wantsurl', wantsUrl);
      return url.toString();
    } catch {
      const separator = loginUrl.includes('?') ? '&' : '?';
      return `${loginUrl}${separator}wantsurl=${encodeURIComponent(wantsUrl)}`;
    }
  }

  private async syncMoodleCourseImage(course: Lltcourse, moodleCourseId: number): Promise<void> {
    const imageUrl = course.imageUrl || getCourseImageUrl();
    if (!imageUrl) return;

    try {
      await this.moodleService.updateCourseImage(
        moodleCourseId,
        this.toMoodleFetchableImageUrl(imageUrl),
        this.getMoodleImageFilename(course, imageUrl),
      );
      this.logger.log(`Synced Moodle course image for ${course.code ?? course.id}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Moodle course image sync failed for ${course.code ?? course.id}: ${msg}`);
    }
  }

  private toMoodleFetchableImageUrl(imageUrl: string): string {
    const backendInternalUrl =
      this.configService.get<string>('BACKEND_INTERNAL_URL') || 'http://backend:3000';
    const internalBase = new URL(backendInternalUrl);

    if (imageUrl.startsWith('/api/uploads/') || imageUrl.startsWith('/uploads/')) {
      return `${internalBase.origin}${imageUrl}`;
    }

    const backendPublicUrl =
      this.configService.get<string>('BACKEND_URL') ||
      `http://localhost:${this.configService.get<number>('PORT') ?? 3000}`;

    try {
      const image = new URL(imageUrl);
      const publicBase = new URL(backendPublicUrl);
      if (
        image.origin === publicBase.origin &&
        (image.pathname.startsWith('/uploads/') || image.pathname.startsWith('/api/uploads/'))
      ) {
        image.protocol = internalBase.protocol;
        image.host = internalBase.host;
        return image.toString();
      }
    } catch {
      return imageUrl;
    }

    return imageUrl;
  }

  private getMoodleImageFilename(course: Lltcourse, imageUrl: string): string {
    const code = course.code?.trim() || `course-${course.id}`;
    let extension = 'jpg';

    try {
      const pathname = new URL(imageUrl, 'http://localhost').pathname;
      const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
      if (match?.[1]) {
        extension = match[1].toLowerCase();
      }
    } catch {
      // Keep the default extension.
    }

    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension)) {
      extension = 'jpg';
    }

    return `${code.replace(/[^a-zA-Z0-9_-]/g, '-')}.${extension}`;
  }

  async enrollCourse(
    dto: EnrollCourseDto,
  ): Promise<{ enrolled: boolean; message: string; moodleEnrolled: boolean }> {
    const course = await this.lltcourseRepository.findOne({ where: { code: dto.courseCode } });
    if (!course) {
      throw new BadRequestException(`Course not found: ${dto.courseCode}`);
    }
    if (course.status !== 'Y') {
      throw new BadRequestException(`Course is not active: ${dto.courseCode}`);
    }

    const openclass = await this.openclassRepository.findOne({
      where: { courseId: course.id, isPublic: 'Y' },
      order: { id: 'DESC' },
    });
    if (!openclass) {
      throw new BadRequestException(`No open class for course: ${dto.courseCode}`);
    }
    if (openclass.isPublic !== 'Y') {
      throw new BadRequestException(`Course is not published: ${dto.courseCode}`);
    }

    // Registration window check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (openclass.regStartDate) {
      const regStart = new Date(openclass.regStartDate);
      regStart.setHours(0, 0, 0, 0);
      if (today < regStart) {
        throw new BadRequestException(
          `Registration has not started yet for course: ${dto.courseCode}`,
        );
      }
    }
    if (openclass.regEndDate) {
      const regEnd = new Date(openclass.regEndDate);
      regEnd.setHours(23, 59, 59, 999);
      if (today > regEnd) {
        throw new BadRequestException(`Registration has closed for course: ${dto.courseCode}`);
      }
    }

    const lltumUser = await this.lltumUserRepository.findOne({ where: { username: dto.username } });
    if (!lltumUser) {
      throw new BadRequestException(`User not found: ${dto.username}`);
    }

    // Seat check (only when numOpen is set)
    if (openclass.numOpen && openclass.numOpen > 0) {
      const countRows = await this.dataSource.query<{ cnt: string }[]>(
        `SELECT COUNT(*) AS cnt FROM LLTENROLL WHERE OPENCLASS_ID = ?`,
        [openclass.id],
      );
      const enrolled = Number(countRows[0]?.cnt ?? 0);
      if (enrolled >= openclass.numOpen) {
        throw new BadRequestException(`No seats available for course: ${dto.courseCode}`);
      }
    }

    // Check if already enrolled (idempotent)
    const existing = await this.enrollRepository.findOne({
      where: { openclassId: openclass.id, userId: lltumUser.id },
    });
    const requestedPaymentStatus = dto.paymentStatus ?? 'paid';

    if (!existing) {
      const enrollDate = new Date();
      const courseAmount = Number(openclass.amount ?? 0);
      const isFree = courseAmount === 0;

      // Generate ENROLL_ID manually (Buddhist Year 2 digits + 5-digit running number)
      const year = enrollDate.getFullYear();
      const beYear = year >= 2500 ? year : year + 543;
      const beYear2 = String(beYear % 100).padStart(2, '0');
      const prefix = `${beYear2}`;

      const [{ maxId }] = await this.dataSource.query<[{ maxId: number | null }]>(
        `SELECT MAX(ENROLL_ID) as maxId FROM LLTENROLL WHERE CAST(ENROLL_ID AS CHAR) LIKE ?`,
        [`${prefix}%`],
      );
      let runningNo = 1;
      if (maxId) {
        const num = parseInt(String(maxId).substring(2), 10);
        if (!isNaN(num)) runningNo = num + 1;
      }
      const generatedEnrollId = parseInt(`${prefix}${String(runningNo).padStart(5, '0')}`, 10);

      const enrollment = this.enrollRepository.create({
        id: generatedEnrollId,
        openclassId: openclass.id,
        courseId: course.id,
        userId: lltumUser.id,
        enrollDate,
        amount: courseAmount,
        balance: courseAmount,
        payStatus: isFree || requestedPaymentStatus === 'paid' ? 'Y' : undefined,
        status: 'A',
        createUser: dto.username,
      });
      // Use .insert() instead of .save() to force TypeORM to use our manual id for AUTO_INCREMENT column
      await this.enrollRepository.insert(enrollment);
      const savedEnrollment = enrollment;
      await this.lltenrollService.updateEnrollReceiptInfo(savedEnrollment.id, dto);
      this.logger.log(`Created LLTENROLL for user ${dto.username} in course ${dto.courseCode}`);

      const learnerName =
        [lltumUser.firstNameTh, lltumUser.lastNameTh].filter(Boolean).join(' ') ||
        lltumUser.username ||
        dto.username;
      this.chatGateway.notifyNewEnrollment({
        learnerName,
        courseCode: course.code ?? null,
        courseId: course.id,
        createdAt: enrollDate,
      });
    } else {
      if (requestedPaymentStatus === 'paid') {
        await this.enrollRepository.update(existing.id, { payStatus: 'Y' });
      }
      await this.lltenrollService.updateEnrollReceiptInfo(existing.id, dto);
    }

    // Moodle enrolment (idempotent)
    let moodleEnrolled = false;
    if (requestedPaymentStatus === 'pending') {
      return { enrolled: true, message: 'Enrollment pending payment', moodleEnrolled };
    }

    if (openclass.lmsId && lltumUser.lmsId) {
      try {
        await this.moodleService.enrolUserInCourse(openclass.lmsId, lltumUser.lmsId, 5);
        moodleEnrolled = true;
        this.logger.log(`Moodle enrollment: user ${lltumUser.lmsId} in course ${openclass.lmsId}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // enrol_manual commits the enrolment BEFORE sending the optional welcome
        // message; a mailer failure (no MTA in dev) throws even though the user IS
        // enrolled. Treat that specific case as success so the flag isn't a false negative.
        if (/message was not sent|mailer|could not.*mail|sender|email/i.test(msg)) {
          moodleEnrolled = true;
          this.logger.warn(`Moodle enrol committed but welcome message failed: ${msg}`);
        } else {
          this.logger.warn(`Moodle enrollment failed (LLL enrollment saved): ${msg}`);
        }
      }
    } else {
      this.logger.warn(
        `Skipping Moodle enrollment: lmsId missing for course (${openclass.lmsId ?? 'null'}) or user (${lltumUser.lmsId ?? 'null'})`,
      );
    }

    return { enrolled: true, message: 'Enrollment successful', moodleEnrolled };
  }

  async checkEnrollmentStatus(
    courseCode: string,
    username: string,
  ): Promise<{ enrolled: boolean; enrollId: number | null; moodleId: number | null }> {
    const course = await this.lltcourseRepository.findOne({ where: { code: courseCode } });
    if (!course) return { enrolled: false, enrollId: null, moodleId: null };

    const openclass = await this.openclassRepository.findOne({
      where: { courseId: course.id, isPublic: 'Y' },
      order: { id: 'DESC' },
    });
    if (!openclass) return { enrolled: false, enrollId: null, moodleId: null };

    const user = await this.lltumUserRepository.findOne({ where: { username } });
    if (!user) return { enrolled: false, enrollId: null, moodleId: openclass.lmsId ?? null };

    const enroll = await this.enrollRepository.findOne({
      where: { openclassId: openclass.id, userId: user.id },
    });

    return {
      enrolled: !!enroll,
      enrollId: enroll?.id ?? null,
      moodleId: openclass.lmsId ?? null,
    };
  }

  async getUserBenefits(email: string): Promise<{
    hasPrivilege: boolean;
    stutypeId: number | null;
    stutypeName: string | null;
    userCitizen: string | null;
    checkedAt: Date;
  }> {
    const userRows = await this.dataSource.query<{ userId: number }[]>(
      `SELECT USER_ID AS userId FROM LLTUMUSER WHERE USER_EMAIL = ? OR USER_USERNAME = ? LIMIT 1`,
      [email, email],
    );
    const userId = userRows[0]?.userId ?? null;
    if (!userId) {
      return {
        hasPrivilege: false,
        stutypeId: null,
        stutypeName: null,
        userCitizen: null,
        checkedAt: new Date(),
      };
    }

    const rows = await this.dataSource.query<
      {
        stutypeId: number;
        stutypeName: string | null;
        userCitizen: string | null;
      }[]
    >(
      `SELECT p.STUTYPE_ID AS stutypeId, s.STUTYPE_NAME AS stutypeName, p.USER_CITIZEN AS userCitizen
       FROM LLTPRIVILEGE p
       LEFT JOIN LLTTYPESTUDENT s ON s.STUTYPE_ID = p.STUTYPE_ID
       WHERE p.USER_ID = ?
       LIMIT 1`,
      [userId],
    );

    const row = rows[0] ?? null;
    if (!row) {
      return {
        hasPrivilege: false,
        stutypeId: null,
        stutypeName: null,
        userCitizen: null,
        checkedAt: new Date(),
      };
    }
    return {
      hasPrivilege: true,
      stutypeId: row.stutypeId,
      stutypeName: row.stutypeName ?? null,
      userCitizen: row.userCitizen ?? null,
      checkedAt: new Date(),
    };
  }

  async getPrivilegePrice(
    username: string,
    courseCode: string,
  ): Promise<{ effectivePrice: number; stutypeName: string | null; isPrivileged: boolean }> {
    // Resolve USER_ID
    const userRows = await this.dataSource.query<{ userId: number }[]>(
      `SELECT USER_ID AS userId FROM LLTUMUSER WHERE USER_USERNAME = ? OR USER_EMAIL = ? LIMIT 1`,
      [username, username],
    );
    const userId = userRows[0]?.userId ?? null;

    // Fallback generic price
    const genericRows = await this.dataSource.query<
      { amount: number | null; openclassId: number | null }[]
    >(
      `SELECT oc.OPENCLASS_AMOUNT AS amount, oc.OPENCLASS_ID AS openclassId
       FROM LLTOPENCLASS oc
       JOIN LLTCOURSE c ON c.COSE_ID = oc.COSE_ID
       WHERE c.COSE_CODE = ?
       LIMIT 1`,
      [courseCode],
    );
    const genericPrice = Number(genericRows[0]?.amount ?? 0);
    const openclassId = genericRows[0]?.openclassId ?? null;

    if (!userId || !openclassId) {
      return { effectivePrice: genericPrice, stutypeName: null, isPrivileged: false };
    }

    // Get student type from LLTPRIVILEGE
    const privilegeRows = await this.dataSource.query<{ stutypeId: number }[]>(
      `SELECT STUTYPE_ID AS stutypeId FROM LLTPRIVILEGE WHERE USER_ID = ? LIMIT 1`,
      [userId],
    );
    const stutypeId = privilegeRows[0]?.stutypeId ?? null;
    if (!stutypeId) {
      return { effectivePrice: genericPrice, stutypeName: null, isPrivileged: false };
    }

    // Get privilege price from LLTOPENCLASSSTUTYPEFEE
    const feeRows = await this.dataSource.query<{ amount: number | null; stutypeName: string }[]>(
      `SELECT f.STUTYPE_AMOUNT AS amount, st.STUTYPE_NAME AS stutypeName
       FROM LLTOPENCLASSSTUTYPEFEE f
       JOIN LLTTYPESTUDENT st ON st.STUTYPE_ID = f.STUTYPE_ID
       WHERE f.OPENCLASS_ID = ? AND f.STUTYPE_ID = ?
       LIMIT 1`,
      [openclassId, stutypeId],
    );
    if (!feeRows.length || feeRows[0].amount === null) {
      // Has privilege but no specific fee set → use generic price
      const stutypeNameRows = await this.dataSource.query<{ stutypeName: string }[]>(
        `SELECT STUTYPE_NAME AS stutypeName FROM LLTTYPESTUDENT WHERE STUTYPE_ID = ? LIMIT 1`,
        [stutypeId],
      );
      return {
        effectivePrice: genericPrice,
        stutypeName: stutypeNameRows[0]?.stutypeName ?? null,
        isPrivileged: false,
      };
    }

    return {
      effectivePrice: Number(feeRows[0].amount),
      stutypeName: feeRows[0].stutypeName,
      isPrivileged: true,
    };
  }

  async getMyEnrolledCourses(username: string): Promise<
    {
      enrollId: number;
      courseId: string;
      courseCode: string;
      courseTitle: string;
      courseTitleEn: string | null;
      imageUrl: string | null;
      moodleCourseId: number | null;
      enrolledAt: string | null;
      paymentStatus: 'free' | 'paid' | 'pending';
      isCompleted: boolean;
    }[]
  > {
    const rows = await this.dataSource.query<
      {
        enrollId: number;
        courseId: number;
        courseCode: string;
        courseTitle: string;
        courseTitleEn: string | null;
        imageUrl: string | null;
        moodleCourseId: number | null;
        enrolledAt: Date | null;
        payStatus: string | null;
        amount: number | null;
        isCompleted: number;
      }[]
    >(
      `SELECT
        e.ENROLL_ID        AS enrollId,
        c.COSE_ID          AS courseId,
        c.COSE_CODE        AS courseCode,
        c.COSE_NAMETH      AS courseTitle,
        c.COSE_NAMEEN      AS courseTitleEn,
        c.COSE_IMAGE_URL   AS imageUrl,
        oc.LMS_ID          AS moodleCourseId,
        e.ENROLL_DATE      AS enrolledAt,
        e.ENROLL_PAYSTATUS AS payStatus,
        e.ENROLL_AMOUNT    AS amount,
        CASE WHEN EXISTS (SELECT 1 FROM LLTCERTIFICATE cert WHERE cert.ENROLL_ID = e.ENROLL_ID)
             THEN 1 ELSE 0 END AS isCompleted
       FROM LLTENROLL e
       JOIN LLTUMUSER u  ON u.USER_ID  = e.USER_ID
       JOIN LLTCOURSE c  ON c.COSE_ID  = e.COSE_ID
       LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = e.OPENCLASS_ID
       WHERE (u.USER_USERNAME = ? OR u.USER_EMAIL = ?)
       ORDER BY e.ENROLL_DATE DESC`,
      [username, username],
    );

    return rows.map((row) => {
      let paymentStatus: 'free' | 'paid' | 'pending' = 'pending';
      if ((row.amount ?? 0) === 0) paymentStatus = 'free';
      else if (row.payStatus === 'Y') paymentStatus = 'paid';

      return {
        enrollId: row.enrollId,
        courseId: `db-${row.courseId}`,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        courseTitleEn: row.courseTitleEn,
        imageUrl: row.imageUrl,
        moodleCourseId: row.moodleCourseId ?? null,
        enrolledAt: row.enrolledAt ? new Date(row.enrolledAt).toISOString().substring(0, 10) : null,
        paymentStatus,
        isCompleted: row.isCompleted === 1,
      };
    });
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.lltcourseRepository.delete(id);
  }

  async unenrollCourse(
    enrollId: number,
    username: string,
  ): Promise<{ success: boolean; message: string }> {
    // Find enrollment record with user info
    const enrollment = await this.enrollRepository.findOne({
      where: { id: enrollId },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${enrollId} not found`);
    }

    // Get user and openclass details
    const user = await this.lltumUserRepository.findOne({
      where: { id: enrollment.userId ?? undefined },
    });

    const openclass = await this.openclassRepository.findOne({
      where: { id: enrollment.openclassId ?? undefined },
    });

    // Verify the enrollment belongs to the requesting user
    if (user?.username !== username) {
      throw new BadRequestException('You can only unenroll from your own courses');
    }

    if (enrollment.status === 'C') {
      throw new BadRequestException(
        'ไม่สามารถยกเลิกการลงทะเบียนได้ เนื่องจากคุณเรียนจบรายวิชานี้แล้ว',
      );
    }

    // Get Moodle course ID and user LMS ID for unenrollment
    const moodleCourseId = openclass?.lmsId ?? null;
    const userLmsId = user?.lmsId ?? null;

    // Delete from database first
    await this.enrollRepository.delete(enrollId);
    this.logger.log(`Deleted LLTENROLL record ${enrollId} for user ${username}`);

    // Attempt to unenroll from Moodle if IDs exist
    if (moodleCourseId && userLmsId) {
      try {
        await this.moodleService.unenrolUserFromCourse(moodleCourseId, userLmsId);
        this.logger.log(`Unenrolled user ${userLmsId} from Moodle course ${moodleCourseId}`);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.logger.warn(`Failed to unenroll from Moodle (DB record already deleted): ${msg}`);
        // Don't throw - database record is already deleted, which is the primary source of truth
      }
    } else {
      this.logger.warn(
        `Skipping Moodle unenrollment: lmsId missing for course (${moodleCourseId ?? 'null'}) or user (${userLmsId ?? 'null'})`,
      );
    }

    return {
      success: true,
      message: 'Successfully unenrolled from course',
    };
  }

  async recordClick(courseId: number, userId?: string): Promise<{ clickCount: number }> {
    const openclass = await this.openclassRepository.findOne({
      where: { courseId, isPublic: 'Y' },
      order: { id: 'ASC' },
    });
    if (!openclass) {
      throw new NotFoundException(`No public openclass found for course ${courseId}`);
    }
    const click = this.clickRepository.create({
      openclassId: openclass.id,
      createUser: userId ?? null,
      createDate: new Date(),
    });
    await this.clickRepository.save(click);
    const [{ count }] = await this.dataSource.query<[{ count: string }]>(
      'SELECT COUNT(*) AS count FROM LLTOPENCLASSCLICK WHERE OPENCLASS_ID = ?',
      [openclass.id],
    );
    return { clickCount: Number(count) };
  }
}

function toGatewayFilePath(filePath: string): string | null {
  const withoutQuery = filePath.split('?')[0] ?? filePath;
  const match = withoutQuery.match(/\/uploads\/.+$/);
  if (match) return match[0].replace(/^\/+/, '');
  return withoutQuery.split('/').pop() || null;
}
