import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LltcourseskillService } from '../courses/lltcourseskill/lltcourseskill.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { createPool, Pool, RowDataPacket } from 'mysql2/promise';
import { LltEnroll } from '../enrollment/lltenroll/entities/llt-enroll.entity';
import { LltOpenclass } from '../lltcourse/entities/llt-openclass.entity';
import { Lltcourse } from '../lltcourse/entities/lltcourse.entity';
import { LltumUser } from '../auth/entities/lltum-user.entity';
import { Lltcoursein } from '../courses/lltcourseins/entities/lltcoursein.entity';
import { Lltchat } from '../chat/lltchat/entities/lltchat.entity';
import { LltGradeItem } from './entities/llt-grade-item.entity';
import { LltImportGrade } from './entities/llt-import-grade.entity';
import { LltLogUpdateGrade } from './entities/llt-log-update-grade.entity';
import { MoodleService } from '../moodle/moodle.service';
import { ChatGateway } from '../chat/lltchat/chat-gateway';
import { ImportGradesDto, ImportGradesResult } from './dto/import-grades.dto';
import { ApproveGradesDto, ApproveGradesResult } from './dto/approve-grades.dto';
import { ActiveCertTemplateDto, CertLayoutDto } from './dto/active-cert-template.dto';

export interface InstructorCourseSummary {
  id: number;
  code: string | null;
  titleTh: string | null;
  titleEn: string | null;
  imageUrl: string | null;
  status: string | null;
  startDate: Date | null;
  endDate: Date | null;
  moodleId: number | null;
  openclassId: number | null;
  maxSeats: number | null;
  amount: number;
  enrolledCount: number;
  reviewAverage: number;
  reviewCount: number;
  regStartDate: string | null;
  regEndDate: string | null;
  updatedAt: Date | null;
}

export interface InstructorLearner {
  enrollmentId: number;
  courseId: number;
  openclassId: number | null;
  userId: number;
  username: string | null;
  studentId: string;
  firstNameTh: string | null;
  lastNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  moodleUserId: number | null;
  enrolledAt: Date | null;
  paymentStatus: string | null;
  enrollmentStatus: string | null;
}

export interface InstructorGrade {
  learnerUserId: number;
  moodleUserId: number | null;
  studentId: string;
  learnerName: string;
  courseId: number;
  moodleCourseId: number | null;
  score: number | null;
  maxScore: number | null;
  grade: string | null;
  status: 'passed' | 'failed' | 'pending';
  updatedAt: Date | null;
  lmsFinalscore: number | null;
  lmsSyncedAt: Date | null;
  gradeItems: GradeItemBreakdown[];
  importedGradeId: number | null;
  importedGradeName: string | null;
}

export interface GradeItemDto {
  id: number;
  name: string;
  isPass: boolean;
  gradeModeId: number | null;
}

export interface SyncScoresResult {
  synced: number;
  skipped: number;
  errors: number;
}

export interface InstructorConversation {
  id: string;
  courseId: number;
  moodleCourseId: number | null;
  learnerUserId: number;
  learnerMoodleUserId: number | null;
  learnerName: string;
  learnerEmail: string | null;
  latestMessagePreview: string;
  messageCount: number;
  enrollId: number;
  messages: InstructorConversationMessage[];
}

export interface InstructorConversationMessage {
  id: string;
  sender: 'learner' | 'instructor';
  body: string;
  sentAt: Date;
  status: 'sent' | 'read';
}

export interface InstructorPriorityTask {
  id: string;
  title: string;
  detail: string;
  count: number;
  severity: 'info' | 'warning' | 'danger';
  actionTab: 'learners' | 'grading' | 'announcements';
  icon: string;
  color: string;
}

interface CourseRow {
  course_id: number;
  code: string | null;
  title_th: string | null;
  title_en: string | null;
  image_url: string | null;
  status: string | null;
  start_date: Date | null;
  end_date: Date | null;
  moodle_id: number | null;
  openclass_id: number | null;
  max_seats: number | null;
  amount: number | null;
  enrolled_count: string | number | null;
  review_average: string | number | null;
  review_count: string | number | null;
  reg_start_date: Date | string | null;
  reg_end_date: Date | string | null;
  updated_at: Date | string | null;
}

interface LearnerRow {
  enrollment_id: number;
  course_id: number;
  openclass_id: number | null;
  user_id: number;
  username: string | null;
  first_name_th: string | null;
  last_name_th: string | null;
  first_name_en: string | null;
  last_name_en: string | null;
  email: string | null;
  phone: string | null;
  moodle_user_id: number | null;
  enrolled_at: Date | null;
  payment_status: string | null;
  enrollment_status: string | null;
}

interface MoodleGradeEntry {
  itemtype?: string | null;
  itemmodule?: string | null;
  itemname?: string | null;
  iteminstance?: number | null;
  graderaw?: number | string | null;
  grademax?: number | string | null;
  gradeformatted?: string | null;
  feedback?: string | null;
  gradedategraded?: number | null;
  dategraded?: number | null;
}

export interface GradeItemBreakdown {
  itemtype: string;
  itemmodule: string | null;
  itemname: string | null;
  score: number | null;
  maxScore: number | null;
  cmid: number | null;
}

export interface InstructorProfile {
  email: string;
  prefix: string | null;
  firstNameTh: string | null;
  lastNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
}

interface MoodleGradeItem {
  gradeitems?: MoodleGradeEntry[];
  usergrades?: Array<{ gradeitems?: MoodleGradeEntry[] }>;
}

interface MoodleConversationMessage {
  id?: number;
  useridfrom?: number;
  text?: string;
  fullmessage?: string;
  timecreated?: number;
}

interface MoodleLearnerRow {
  enrollment_id: number;
  course_id: number;
  moodle_user_id: number;
  username: string;
  student_id: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  enrolled_at: Date | null;
}

@Injectable()
export class InstructorService {
  private readonly logger = new Logger(InstructorService.name);
  private moodlePool: Pool | null = null;

  constructor(
    @InjectRepository(Lltcourse)
    private readonly courseRepository: Repository<Lltcourse>,
    @InjectRepository(LltOpenclass)
    private readonly openclassRepository: Repository<LltOpenclass>,
    @InjectRepository(LltEnroll)
    private readonly enrollRepository: Repository<LltEnroll>,
    @InjectRepository(LltumUser)
    private readonly userRepository: Repository<LltumUser>,
    @InjectRepository(Lltcoursein)
    private readonly instructorRepository: Repository<Lltcoursein>,
    @InjectRepository(Lltchat)
    private readonly lltchatRepository: Repository<Lltchat>,
    @InjectRepository(LltGradeItem)
    private readonly gradeItemRepository: Repository<LltGradeItem>,
    @InjectRepository(LltImportGrade)
    private readonly importGradeRepository: Repository<LltImportGrade>,
    @InjectRepository(LltLogUpdateGrade)
    private readonly logUpdateGradeRepository: Repository<LltLogUpdateGrade>,
    private readonly configService: ConfigService,
    private readonly moodleService: MoodleService,
    private readonly chatGateway: ChatGateway,
    private readonly dataSource: DataSource,
    private readonly lltcourseskillService: LltcourseskillService,
  ) {}

  async getProfile(email: string): Promise<InstructorProfile> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      return {
        email,
        prefix: null,
        firstNameTh: null,
        lastNameTh: null,
        firstNameEn: null,
        lastNameEn: null,
      };
    }

    const rows = await this.userRepository.manager.query<
      Array<{
        prefix: string | null;
        firstNameTh: string | null;
        lastNameTh: string | null;
        firstNameEn: string | null;
        lastNameEn: string | null;
      }>
    >(
      `SELECT
        p.PRF_NAMETH AS prefix,
        COALESCE(p.PSN_FNAMETH, u.USER_FNAMETH) AS firstNameTh,
        COALESCE(p.PSN_LNAMETH, u.USER_LNAMETH) AS lastNameTh,
        u.USER_FNAMEEN AS firstNameEn,
        u.USER_LNAMEEN AS lastNameEn
      FROM LLTUMUSER u
      LEFT JOIN LLTCOURSEINS ci ON LOWER(ci.COSEINS_EMAIL) = LOWER(u.USER_EMAIL)
      LEFT JOIN PSNTPERSON p ON p.PSN_ID = ci.PSN_ID
      WHERE LOWER(u.USER_EMAIL) = ?
      LIMIT 1`,
      [normalizedEmail],
    );

    const row = rows[0] ?? null;
    return {
      email,
      prefix: row?.prefix ?? null,
      firstNameTh: row?.firstNameTh ?? null,
      lastNameTh: row?.lastNameTh ?? null,
      firstNameEn: row?.firstNameEn ?? null,
      lastNameEn: row?.lastNameEn ?? null,
    };
  }

  async getCourses(email: string): Promise<InstructorCourseSummary[]> {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) return [];

    const rows = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(Lltcoursein, 'coursein', 'coursein.courseId = course.id')
      .leftJoin(
        LltOpenclass,
        'openclass',
        'openclass.id = (SELECT MAX(oc2.OPENCLASS_ID) FROM LLTOPENCLASS oc2 WHERE oc2.COSE_ID = course.id)',
      )
      .leftJoin(LltEnroll, 'enroll', 'enroll.courseId = course.id')
      .where('LOWER(coursein.email) = :email', { email: normalizedEmail })
      .orWhere('LOWER(course.createUser) = :email', { email: normalizedEmail })
      .select([
        'course.id AS course_id',
        'course.code AS code',
        'course.titleTh AS title_th',
        'course.titleEn AS title_en',
        'course.imageUrl AS image_url',
        'course.status AS status',
        'course.startDate AS start_date',
        'course.endDate AS end_date',
        'openclass.lmsId AS moodle_id',
        'openclass.id AS openclass_id',
        'openclass.numOpen AS max_seats',
        'openclass.amount AS amount',
        'openclass.regStartDate AS reg_start_date',
        'openclass.regEndDate AS reg_end_date',
        'COALESCE(course.updateDate, course.createDate) AS updated_at',
        'COUNT(DISTINCT enroll.id) AS enrolled_count',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COALESCE(ROUND(AVG(review.REVIEW_RATING), 2), 0)')
            .from('LLTCOURSEREVIEW', 'review')
            .where('review.COSE_ID = course.id')
            .andWhere("review.REVIEW_STATUS = 'A'"),
        'review_average',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)')
            .from('LLTCOURSEREVIEW', 'review')
            .where('review.COSE_ID = course.id')
            .andWhere("review.REVIEW_STATUS = 'A'"),
        'review_count',
      )
      .groupBy('course.id')
      .orderBy('course.updateDate', 'DESC')
      .addOrderBy('course.createDate', 'DESC')
      .getRawMany<CourseRow>();

    return rows.map((row) => ({
      id: row.course_id,
      code: row.code,
      titleTh: row.title_th,
      titleEn: row.title_en,
      imageUrl: row.image_url,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      moodleId: row.moodle_id,
      openclassId: row.openclass_id,
      maxSeats: row.max_seats != null ? Number(row.max_seats) : null,
      amount: Number(row.amount ?? 0),
      enrolledCount: Number(row.enrolled_count ?? 0),
      reviewAverage: Number(row.review_average ?? 0),
      reviewCount: Number(row.review_count ?? 0),
      regStartDate: row.reg_start_date
        ? new Date(row.reg_start_date).toISOString().substring(0, 10)
        : null,
      regEndDate: row.reg_end_date
        ? new Date(row.reg_end_date).toISOString().substring(0, 10)
        : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    }));
  }

  async updateOpenclass(
    email: string,
    courseId: number,
    data: { registrationStartDate?: string; registrationEndDate?: string; imageUrl?: string },
  ): Promise<{ updated: boolean }> {
    await this.assertCourseAccess(email, courseId);
    const openclass = await this.openclassRepository.findOne({
      where: { courseId },
      order: { id: 'DESC' },
    });
    if (!openclass && data.imageUrl === undefined) return { updated: false };

    const updates: Partial<LltOpenclass> = {};
    if (data.registrationStartDate) {
      updates.regStartDate = new Date(data.registrationStartDate);
    }
    if (data.registrationEndDate) {
      updates.regEndDate = new Date(data.registrationEndDate);
    }

    if (openclass && Object.keys(updates).length > 0) {
      await this.openclassRepository.update(openclass.id, updates);
    }

    if (data.imageUrl !== undefined) {
      await this.courseRepository.update(courseId, {
        imageUrl: data.imageUrl.trim() || null,
      });
    }

    return { updated: true };
  }

  async verifyCourseAccess(email: string, courseId: number): Promise<void> {
    await this.assertCourseAccess(email, courseId);
  }

  async getCourseFees(
    email: string,
    courseId: number,
  ): Promise<{ stutypeId: number; stutypeName: string | null; amount: number }[]> {
    await this.assertCourseAccess(email, courseId);
    const openclass = await this.openclassRepository.findOne({
      where: { courseId },
      order: { id: 'DESC' },
    });
    if (!openclass) return [];

    const rows = await this.dataSource.query<
      { stutypeId: number; stutypeName: string | null; amount: number }[]
    >(
      `SELECT f.STUTYPE_ID AS stutypeId, st.STUTYPE_NAME AS stutypeName, f.STUTYPE_AMOUNT AS amount
       FROM LLTOPENCLASSSTUTYPEFEE f
       JOIN LLTTYPESTUDENT st ON st.STUTYPE_ID = f.STUTYPE_ID
       WHERE f.OPENCLASS_ID = ? ORDER BY f.STUTYPE_ID`,
      [openclass.id],
    );
    return rows.map((r) => ({
      stutypeId: Number(r.stutypeId),
      stutypeName: r.stutypeName ?? null,
      amount: Number(r.amount),
    }));
  }

  async saveCourseFees(
    email: string,
    courseId: number,
    fees: { stutypeId: number; amount: number }[],
  ): Promise<{ updated: boolean }> {
    await this.assertCourseAccess(email, courseId);
    const openclass = await this.openclassRepository.findOne({
      where: { courseId },
      order: { id: 'DESC' },
    });
    if (!openclass) return { updated: false };

    await this.dataSource.query('DELETE FROM LLTOPENCLASSSTUTYPEFEE WHERE OPENCLASS_ID = ?', [
      openclass.id,
    ]);

    if (fees.length > 0) {
      const BATCH_SIZE = 500;
      for (let i = 0; i < fees.length; i += BATCH_SIZE) {
        const chunk = fees.slice(i, i + BATCH_SIZE);
        const insertValues: (number | string)[] = [];
        const placeholders: string[] = [];

        for (const fee of chunk) {
          placeholders.push('(?, ?, ?, ?, NOW())');
          insertValues.push(openclass.id, fee.stutypeId, fee.amount, email);
        }

        await this.dataSource.query(
          `INSERT INTO LLTOPENCLASSSTUTYPEFEE (OPENCLASS_ID, STUTYPE_ID, STUTYPE_AMOUNT, CREATEUSER, CREATEDATE) VALUES ${placeholders.join(', ')}`,
          insertValues,
        );
      }
    }

    return { updated: true };
  }

  async getSummary(email: string): Promise<{
    courses: InstructorCourseSummary[];
    totalStudents: number;
    activeCourses: number;
    averageScore: number | null;
    conversations: number;
    recentActivities: Array<{
      id: string;
      learnerName: string;
      action: string;
      createdAt: Date | null;
      courseCode: string | null;
    }>;
  }> {
    const courses = await this.getCourses(email);
    const totalStudents = courses.reduce((sum, course) => sum + course.enrolledCount, 0);
    const courseIds = courses.map((c) => c.id);

    let recentActivities: Array<{
      id: string;
      learnerName: string;
      action: string;
      createdAt: Date | null;
      courseCode: string | null;
    }> = [];
    let averageScore: number | null = null;
    let conversationsCount = 0;

    if (courseIds.length > 0) {
      // 1. Recent Activities: Query top 8 enrollments directly
      const recentRows = await this.enrollRepository
        .createQueryBuilder('enroll')
        .innerJoin('LLTUMUSER', 'user', 'user.id = enroll.userId')
        .innerJoin('LLTCOURSE', 'course', 'course.id = enroll.courseId')
        .where('enroll.courseId IN (:...courseIds)', { courseIds })
        .select([
          'enroll.id AS id',
          'user.username AS username',
          'user.firstNameTh AS fnameTh',
          'user.lastNameTh AS lnameTh',
          'user.firstNameEn AS fnameEn',
          'user.lastNameEn AS lnameEn',
          'course.titleTh AS courseTitle',
          'course.code AS courseCode',
          'enroll.enrollDate AS enrolledAt',
        ])
        .orderBy('enroll.enrollDate', 'DESC')
        .limit(8)
        .getRawMany<{
          id: string;
          fnameTh: string | null;
          lnameTh: string | null;
          fnameEn: string | null;
          lnameEn: string | null;
          username: string | null;
          courseTitle: string | null;
          courseCode: string | null;
          enrolledAt: Date | null;
        }>();

      recentActivities = recentRows.map((row) => ({
        id: `enroll-${row.id}`,
        learnerName:
          [row.fnameTh || row.fnameEn, row.lnameTh || row.lnameEn]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          row.username ||
          'Unknown',
        action: `ลงทะเบียนรายวิชา ${row.courseTitle || row.courseCode || 'Unknown'}`,
        createdAt: row.enrolledAt,
        courseCode: row.courseCode || null,
      }));

      // 2. Average Score: real student course reviews across this instructor's courses
      const reviewRows = await this.dataSource.query<Array<{ avgScore: string | null }>>(
        `SELECT ROUND(AVG(REVIEW_RATING), 2) AS avgScore
         FROM LLTCOURSEREVIEW
         WHERE COSE_ID IN (?) AND REVIEW_STATUS = 'A'`,
        [courseIds],
      );

      averageScore = reviewRows[0]?.avgScore != null ? Number(reviewRows[0].avgScore) : null;

      // 3. Conversations Count: Count learners with LMS_ID (Moodle ID)
      const convRows = await this.enrollRepository
        .createQueryBuilder('enroll')
        .innerJoin('LLTUMUSER', 'user', 'user.id = enroll.userId')
        .where('enroll.courseId IN (:...courseIds)', { courseIds })
        .andWhere('user.lmsId IS NOT NULL')
        .select('COUNT(DISTINCT user.id)', 'cnt')
        .getRawOne<{ cnt: string | null }>();

      conversationsCount = Number(convRows?.cnt || 0);
    }

    return {
      courses,
      totalStudents,
      activeCourses: courses.filter((course) => course.status === 'Y').length,
      averageScore,
      conversations: conversationsCount,
      recentActivities,
    };
  }

  async getLearners(email: string, courseId: number): Promise<InstructorLearner[]> {
    let moodleCourseId: number | null = null;

    try {
      await this.assertCourseAccess(email, courseId);
      moodleCourseId = await this.getMoodleCourseIdByCourseId(courseId);

      const rows = await this.enrollRepository
        .createQueryBuilder('enroll')
        .innerJoin(LltumUser, 'user', 'user.id = enroll.userId')
        .where('enroll.courseId = :courseId', { courseId })
        .select([
          'enroll.id AS enrollment_id',
          'enroll.courseId AS course_id',
          'enroll.openclassId AS openclass_id',
          'enroll.userId AS user_id',
          'user.username AS username',
          'user.firstNameTh AS first_name_th',
          'user.lastNameTh AS last_name_th',
          'user.firstNameEn AS first_name_en',
          'user.lastNameEn AS last_name_en',
          'user.email AS email',
          'user.tel AS phone',
          'user.lmsId AS moodle_user_id',
          'enroll.enrollDate AS enrolled_at',
          'enroll.payStatus AS payment_status',
          'enroll.status AS enrollment_status',
        ])
        .orderBy('enroll.enrollDate', 'DESC')
        .addOrderBy('user.id', 'ASC')
        .getRawMany<LearnerRow>();

      if (rows.length > 0) {
        return rows.map((row) => this.mapLearner(row));
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falling back to Moodle roster for course ${courseId}: ${message}`);
    }

    if (!moodleCourseId) {
      moodleCourseId = await this.getMoodleCourseIdByCourseId(courseId);
    }

    if (!moodleCourseId) {
      return [];
    }

    return this.getMoodleLearners(moodleCourseId, courseId);
  }

  async getMoodleLearners(
    moodleCourseId: number,
    courseIdOverride?: number,
  ): Promise<InstructorLearner[]> {
    try {
      const pool = this.getMoodlePool();
      const [rows] = await pool.query(
        `
          SELECT
            ue.id AS enrollment_id,
            e.courseid AS course_id,
            u.id AS moodle_user_id,
            u.username AS username,
            NULLIF(u.idnumber, '') AS student_id,
            NULLIF(u.firstname, '') AS first_name,
            NULLIF(u.lastname, '') AS last_name,
            NULLIF(u.email, '') AS email,
            NULLIF(u.phone1, '') AS phone,
            FROM_UNIXTIME(ue.timecreated) AS enrolled_at
          FROM mdl_user_enrolments ue
          INNER JOIN mdl_enrol e ON e.id = ue.enrolid
          INNER JOIN mdl_user u ON u.id = ue.userid
          WHERE e.courseid = ?
            AND e.status = 0
            AND ue.status = 0
            AND u.deleted = 0
          ORDER BY ue.timecreated DESC, u.lastname ASC, u.firstname ASC, u.id ASC
        `,
        [moodleCourseId],
      );

      const moodleRows = rows as MoodleLearnerRow[];
      const demoRows = moodleRows.filter(
        (row) =>
          row.username.toLowerCase().startsWith('mdl_') ||
          row.email?.toLowerCase().endsWith('@demo.local'),
      );
      const effectiveRows = demoRows.length > 0 ? demoRows : moodleRows;

      if (effectiveRows.length === 0) {
        return [];
      }

      const moodleIds = effectiveRows.map((row) => row.moodle_user_id);
      const localUsers = await this.userRepository.find({
        where: { lmsId: In(moodleIds) },
      });
      const localUsersByMoodleId = new Map(localUsers.map((user) => [user.lmsId ?? 0, user]));

      return effectiveRows.map((row) => {
        const localUser = localUsersByMoodleId.get(row.moodle_user_id);
        const fullName =
          [localUser?.firstNameTh, localUser?.lastNameTh].filter(Boolean).join(' ').trim() ||
          [row.first_name, row.last_name].filter(Boolean).join(' ').trim() ||
          localUser?.username ||
          row.username ||
          `Learner ${row.moodle_user_id}`;

        return {
          enrollmentId: row.enrollment_id,
          courseId: courseIdOverride ?? moodleCourseId,
          openclassId: null,
          userId: localUser?.id ?? row.moodle_user_id,
          username: localUser?.username ?? row.username,
          studentId:
            localUser?.username ?? row.student_id ?? row.username ?? String(row.moodle_user_id),
          firstNameTh: localUser?.firstNameTh ?? row.first_name,
          lastNameTh: localUser?.lastNameTh ?? row.last_name,
          firstNameEn: localUser?.firstNameEn ?? row.first_name,
          lastNameEn: localUser?.lastNameEn ?? row.last_name,
          fullName,
          email: localUser?.email ?? row.email,
          phone: localUser?.tel ?? row.phone,
          moodleUserId: row.moodle_user_id,
          enrolledAt: row.enrolled_at,
          paymentStatus: null,
          enrollmentStatus: 'A',
        };
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Unable to load Moodle roster for course ${moodleCourseId}: ${message}`);
      return [];
    }
  }

  async getGrades(email: string, courseId: number): Promise<InstructorGrade[]> {
    let course: Lltcourse | null = null;
    let moodleCourseId: number | null = null;

    try {
      course = await this.assertCourseAccess(email, courseId);
      moodleCourseId = await this.getMoodleCourseIdByCourseId(courseId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Falling back to Moodle grades for course ${courseId}: ${message}`);
      moodleCourseId = await this.getMoodleCourseIdByCourseId(courseId);
    }

    const learners = await this.getLearners(email, courseId);

    // Load DB enrollments to get lmsFinalscore + lmsSyncedAt + importedGrade
    const enrollments = await this.enrollRepository.find({ where: { courseId } });
    const enrollByUserId = new Map(enrollments.map((e) => [e.userId, e]));

    const gradeItems = await this.gradeItemRepository.find();
    const gradeItemById = new Map(gradeItems.map((g) => [g.id, g.name ?? '']));

    if (!moodleCourseId) {
      return learners.map((learner) => {
        const enroll = enrollByUserId.get(learner.userId);
        return this.createPendingGrade(learner, courseId, null, enroll, gradeItemById);
      });
    }

    const cmidMap = moodleCourseId
      ? await this.getCmidMap(moodleCourseId)
      : new Map<string, number>();

    const moodleUserIds = learners
      .map((l) => l.moodleUserId)
      .filter((id): id is number => id !== null);
    const moodleGradesByUserId = new Map<number, MoodleGradeItem>();

    if (moodleCourseId && moodleUserIds.length > 0) {
      try {
        const pool = this.getMoodlePool();
        const [rows] = await pool.query(
          `SELECT 
            gg.userid,
            gi.itemtype,
            gi.itemmodule,
            gi.itemname,
            gi.iteminstance,
            gg.finalgrade AS graderaw,
            gi.grademax,
            gg.timemodified AS dategraded
          FROM mdl_grade_items gi
          INNER JOIN mdl_grade_grades gg ON gg.itemid = gi.id
          WHERE gi.courseid = ? AND gg.userid IN (?)`,
          [moodleCourseId, moodleUserIds],
        );

        const dbRows = rows as Array<{
          userid: number;
          itemtype: string;
          itemmodule: string | null;
          itemname: string | null;
          iteminstance: number | null;
          graderaw: number | null;
          grademax: number | null;
          dategraded: number | null;
        }>;

        for (const row of dbRows) {
          let userResult = moodleGradesByUserId.get(row.userid);
          if (!userResult) {
            userResult = { usergrades: [{ gradeitems: [] }] };
            moodleGradesByUserId.set(row.userid, userResult);
          }
          userResult.usergrades![0].gradeitems!.push({
            itemtype: row.itemtype,
            itemmodule: row.itemmodule,
            itemname: row.itemname,
            iteminstance: row.iteminstance,
            graderaw: row.graderaw,
            grademax: row.grademax,
            dategraded: row.dategraded,
            gradeformatted:
              row.graderaw !== null ? String(Math.round(row.graderaw * 100) / 100) : null,
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to bulk fetch Moodle DB grades for course ${moodleCourseId}: ${message}`,
        );
      }
    }

    const finalGrades: InstructorGrade[] = learners.map((learner): InstructorGrade => {
      const resolvedCourseId = course?.id ?? courseId;
      const enroll = enrollByUserId.get(learner.userId);

      if (!learner.moodleUserId) {
        return this.createPendingGrade(
          learner,
          resolvedCourseId,
          moodleCourseId,
          enroll,
          gradeItemById,
        );
      }

      const dbScore = enroll?.lmsFinalscore ?? null;
      const result = moodleGradesByUserId.get(learner.moodleUserId);

      if (!result) {
        return {
          learnerUserId: learner.userId,
          moodleUserId: learner.moodleUserId,
          studentId: learner.studentId,
          learnerName: learner.fullName,
          courseId: resolvedCourseId,
          moodleCourseId,
          score: dbScore,
          maxScore: null,
          grade: null,
          status: dbScore === null ? 'pending' : 'passed',
          updatedAt: enroll?.lmsUpdateDate ?? null,
          lmsFinalscore: dbScore,
          lmsSyncedAt: enroll?.lmsUpdateDate ?? null,
          gradeItems: [],
          importedGradeId: enroll?.gradeItemId ?? null,
          importedGradeName: enroll?.gradeItemId
            ? (gradeItemById.get(enroll.gradeItemId) ?? null)
            : null,
        };
      }

      const gradeItem = this.extractGradeEntry(result);
      const score = this.toNullableNumber(gradeItem?.graderaw);
      const maxScore = this.toNullableNumber(gradeItem?.grademax);
      const dateGraded = gradeItem?.gradedategraded ?? gradeItem?.dategraded ?? null;

      return {
        learnerUserId: learner.userId,
        moodleUserId: learner.moodleUserId,
        studentId: learner.studentId,
        learnerName: learner.fullName,
        courseId: resolvedCourseId,
        moodleCourseId,
        score,
        maxScore,
        grade: gradeItem?.gradeformatted ?? null,
        status: score === null ? 'pending' : score >= (maxScore ?? 100) * 0.6 ? 'passed' : 'failed',
        updatedAt: dateGraded ? new Date(dateGraded * 1000) : null,
        lmsFinalscore: enroll?.lmsFinalscore ?? null,
        lmsSyncedAt: enroll?.lmsUpdateDate ?? null,
        gradeItems: this.extractAllGradeItems(result, cmidMap),
        importedGradeId: enroll?.gradeItemId ?? null,
        importedGradeName: enroll?.gradeItemId
          ? (gradeItemById.get(enroll.gradeItemId) ?? null)
          : null,
      };
    });

    return finalGrades;
  }

  async getPriorityTasks(email: string, courseId: number): Promise<InstructorPriorityTask[]> {
    const [learners, grades, conversations] = await Promise.all([
      this.getLearners(email, courseId),
      this.getGrades(email, courseId),
      this.getConversations(email),
    ]);

    const courseConversations = conversations.filter(
      (conversation) => conversation.courseId === courseId,
    );
    const pendingGradeCount = grades.filter((grade) => grade.status === 'pending').length;

    const gradesByUserId = new Map(grades.map((g) => [g.learnerUserId, g]));
    const gradesByStudentId = new Map(grades.map((g) => [g.studentId, g]));

    const inactiveLearnerCount = learners.filter((learner) => {
      const grade =
        gradesByUserId.get(learner.userId) ||
        gradesByStudentId.get(learner.studentId || learner.username || '');

      if (!grade?.updatedAt) return true;

      const staleAfterMs = 7 * 24 * 60 * 60 * 1000;
      return Date.now() - grade.updatedAt.getTime() > staleAfterMs;
    }).length;
    const unreadMessageCount = courseConversations.reduce(
      (total, conversation) =>
        total +
        conversation.messages.filter(
          (message) => message.sender === 'learner' && message.status !== 'read',
        ).length,
      0,
    );

    const tasks: InstructorPriorityTask[] = [];

    if (pendingGradeCount > 0) {
      tasks.push({
        id: 'pending-grades',
        title: 'ตรวจงานที่ค้าง',
        detail: `${pendingGradeCount.toLocaleString()} รายการยังไม่มีคะแนน`,
        count: pendingGradeCount,
        severity: pendingGradeCount >= 10 ? 'danger' : 'warning',
        actionTab: 'grading',
        icon: 'assignment_late',
        color: pendingGradeCount >= 10 ? 'negative' : 'warning',
      });
    }

    if (inactiveLearnerCount > 0) {
      tasks.push({
        id: 'inactive-learners',
        title: 'ติดตามผู้เรียนที่ยังไม่มีความคืบหน้า',
        detail: `${inactiveLearnerCount.toLocaleString()} คนยังไม่มีคะแนนหรือไม่ได้อัปเดตเกิน 7 วัน`,
        count: inactiveLearnerCount,
        severity: inactiveLearnerCount >= 5 ? 'warning' : 'info',
        actionTab: 'learners',
        icon: 'person_alert',
        color: inactiveLearnerCount >= 5 ? 'warning' : 'primary',
      });
    }

    if (unreadMessageCount > 0) {
      tasks.push({
        id: 'unread-messages',
        title: 'ตอบข้อความผู้เรียน',
        detail: `${unreadMessageCount.toLocaleString()} ข้อความยังไม่ได้อ่าน`,
        count: unreadMessageCount,
        severity: 'warning',
        actionTab: 'learners',
        icon: 'mark_chat_unread',
        color: 'primary',
      });
    }

    return tasks.sort((a, b) => b.count - a.count);
  }

  async getConversations(email: string): Promise<InstructorConversation[]> {
    const courses = await this.getCourses(email);
    const courseIds = courses.map((c) => c.id);
    if (courseIds.length === 0) return [];

    // 1. Fetch all enrollments directly from DB (Skip heavy Moodle getLearners logic)
    const enrollments = await this.enrollRepository
      .createQueryBuilder('enroll')
      .innerJoin('LLTUMUSER', 'user', 'user.id = enroll.userId')
      .where('enroll.courseId IN (:...courseIds)', { courseIds })
      .select([
        'enroll.id AS enrollmentId',
        'enroll.courseId AS courseId',
        'user.id AS userId',
        'user.lmsId AS moodleUserId',
        'user.firstNameTh AS fnameTh',
        'user.lastNameTh AS lnameTh',
        'user.firstNameEn AS fnameEn',
        'user.lastNameEn AS lnameEn',
        'user.username AS username',
        'user.email AS email',
      ])
      .getRawMany<{
        enrollmentId: number;
        courseId: number;
        userId: number;
        moodleUserId: number | null;
        fnameTh: string | null;
        lnameTh: string | null;
        fnameEn: string | null;
        lnameEn: string | null;
        username: string | null;
        email: string | null;
      }>();

    if (enrollments.length === 0) return [];

    // 2. Fetch all chats for these courses in ONE query (Avoid N+1 issue)
    const allChats = await this.lltchatRepository
      .createQueryBuilder('chat')
      .innerJoin('LLTENROLL', 'enroll', 'enroll.id = chat.enrollId')
      .where('enroll.courseId IN (:...courseIds)', { courseIds })
      .orderBy('chat.chatTime', 'ASC')
      .getMany();

    const chatsByEnrollId = new Map<number, typeof allChats>();
    for (const chat of allChats) {
      if (chat.enrollId == null) continue;
      if (!chatsByEnrollId.has(chat.enrollId)) {
        chatsByEnrollId.set(chat.enrollId, []);
      }
      chatsByEnrollId.get(chat.enrollId)!.push(chat);
    }

    return enrollments.map((enroll) => {
      const course = courses.find((c) => c.id === enroll.courseId);
      const localChats = chatsByEnrollId.get(enroll.enrollmentId) || [];

      const messages: InstructorConversationMessage[] = localChats.map((chat) => ({
        id: String(chat.id),
        sender: chat.typeSender === 'T' ? 'instructor' : 'learner',
        body: chat.message ?? '',
        sentAt: chat.chatTime ?? new Date(),
        status: chat.status === 'R' ? 'read' : 'sent',
      }));

      return {
        id: `${enroll.courseId}-${enroll.userId}`,
        courseId: enroll.courseId,
        moodleCourseId: course?.moodleId ?? null,
        learnerUserId: enroll.userId,
        learnerMoodleUserId: enroll.moodleUserId,
        learnerName:
          [enroll.fnameTh || enroll.fnameEn, enroll.lnameTh || enroll.lnameEn]
            .filter(Boolean)
            .join(' ')
            .trim() ||
          enroll.username ||
          'Unknown',
        learnerEmail: enroll.email,
        latestMessagePreview: messages[messages.length - 1]?.body ?? '',
        messageCount: messages.length,
        enrollId: enroll.enrollmentId,
        messages,
      };
    });
  }

  async sendMessage(
    email: string,
    courseId: number,
    learnerUserId: number,
    body: string,
  ): Promise<{ sent: boolean; message?: Lltchat }> {
    const instructor = await this.userRepository.findOne({ where: { email } });
    const learner = await this.userRepository.findOne({ where: { id: learnerUserId } });
    if (!instructor || !learner) {
      return { sent: false };
    }

    const enroll = await this.enrollRepository.findOne({
      where: {
        userId: learnerUserId,
        courseId: courseId,
      },
    });

    if (!enroll) {
      return { sent: false };
    }

    // Save chat message in LLTCHAT table
    const chat = this.lltchatRepository.create({
      enrollId: enroll.id,
      sender: instructor.id,
      psnId: instructor.username || email,
      userId: learner.username || String(learner.id),
      message: body,
      chatTime: new Date(),
      status: 'S', // Sent
      typeSender: 'T', // Teacher
      createUser: instructor.username || email,
      createDate: new Date(),
      updateUser: instructor.username || email,
      updateDate: new Date(),
      updateProgram: 'instructor_chat',
    });

    const saved = await this.lltchatRepository.save(chat);

    // Notify clients via WebSocket
    this.chatGateway.notifyNewMessage(enroll.id, {
      id: saved.id,
      sender: 'instructor',
      body: saved.message ?? '',
      sentAt: saved.chatTime ?? new Date(),
      status: saved.status as 'sent' | 'read',
      courseId,
      learnerUserId,
    });

    return { sent: true, message: saved };
  }

  async markAsRead(
    email: string,
    courseId: number,
    learnerUserId: number,
  ): Promise<{ success: boolean }> {
    const instructor = await this.userRepository.findOne({ where: { email } });
    if (!instructor) {
      return { success: false };
    }

    const enroll = await this.enrollRepository.findOne({
      where: {
        userId: learnerUserId,
        courseId: courseId,
      },
    });

    if (!enroll) {
      return { success: false };
    }

    await this.lltchatRepository.update(
      { enrollId: enroll.id, typeSender: 'U' },
      { status: 'R', updateDate: new Date(), updateProgram: 'instructor_chat' },
    );

    // Notify clients of read status
    this.chatGateway.notifyMessagesRead(enroll.id, 'learner');

    return { success: true };
  }

  async getActiveCertTemplates(): Promise<ActiveCertTemplateDto[]> {
    const rows = await this.dataSource.query<
      { id: number | string; name: string | null; url: string | null; layout: string | null }[]
    >(
      `SELECT TEMP_ID AS id, TEMP_NAME AS name, TEMP_URL AS url, TEMP_LAYOUT AS layout
       FROM LLTTEMPLATECERTIFICATE
       WHERE TEMP_STATUS = 'Y'
       ORDER BY TEMP_ID ASC`,
    );
    return rows.map((r) => ({
      id: Number(r.id),
      name: r.name ?? '',
      url: r.url ?? null,
      layout: r.layout ? (JSON.parse(r.layout) as CertLayoutDto) : null,
    }));
  }

  async getGradeItems(): Promise<GradeItemDto[]> {
    const items = await this.gradeItemRepository.find({ order: { id: 'ASC' } });
    return items.map((item) => ({
      id: item.id,
      name: item.name ?? '',
      isPass: item.isPass === 'Y',
      gradeModeId: item.gradeModeId,
    }));
  }

  async syncScores(email: string, courseId: number): Promise<SyncScoresResult> {
    await this.assertCourseAccess(email, courseId);
    const moodleCourseId = await this.getMoodleCourseIdByCourseId(courseId);

    if (!moodleCourseId) {
      return { synced: 0, skipped: 0, errors: 0 };
    }

    const learners = await this.getLearners(email, courseId);
    let synced = 0;
    let skipped = 0;
    let errors = 0;

    // Pre-fetch all enrollments for this course to avoid N+1 DB lookups
    const enrollments = await this.enrollRepository.find({ where: { courseId } });
    const enrollMap = new Map(enrollments.map((e) => [e.userId, e]));

    const moodleUserIds = learners
      .map((l) => l.moodleUserId)
      .filter((id): id is number => id !== null);
    const moodleGradesByUserId = new Map<number, MoodleGradeItem>();

    if (moodleCourseId && moodleUserIds.length > 0) {
      try {
        const pool = this.getMoodlePool();
        const [rows] = await pool.query(
          `SELECT 
            gg.userid,
            gi.itemtype,
            gi.itemmodule,
            gi.itemname,
            gi.iteminstance,
            gg.finalgrade AS graderaw,
            gi.grademax,
            gg.timemodified AS dategraded
          FROM mdl_grade_items gi
          INNER JOIN mdl_grade_grades gg ON gg.itemid = gi.id
          WHERE gi.courseid = ? AND gg.userid IN (?)`,
          [moodleCourseId, moodleUserIds],
        );

        const dbRows = rows as Array<{
          userid: number;
          itemtype: string;
          itemmodule: string | null;
          itemname: string | null;
          iteminstance: number | null;
          graderaw: number | null;
          grademax: number | null;
          dategraded: number | null;
        }>;

        for (const row of dbRows) {
          let userResult = moodleGradesByUserId.get(row.userid);
          if (!userResult) {
            userResult = { usergrades: [{ gradeitems: [] }] };
            moodleGradesByUserId.set(row.userid, userResult);
          }
          userResult.usergrades![0].gradeitems!.push({
            itemtype: row.itemtype,
            itemmodule: row.itemmodule,
            itemname: row.itemname,
            iteminstance: row.iteminstance,
            graderaw: row.graderaw,
            grademax: row.grademax,
            dategraded: row.dategraded,
            gradeformatted:
              row.graderaw !== null ? String(Math.round(row.graderaw * 100) / 100) : null,
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Failed to bulk fetch Moodle DB grades for course ${moodleCourseId}: ${message}`,
        );
        return { synced: 0, skipped: 0, errors: learners.length };
      }
    }

    // Batch process updates to local database
    const BATCH_SIZE = 50;
    for (let i = 0; i < learners.length; i += BATCH_SIZE) {
      const chunk = learners.slice(i, i + BATCH_SIZE);
      const promises = chunk.map(async (learner) => {
        if (!learner.moodleUserId) return 'skipped';

        const enrollment = enrollMap.get(learner.userId);
        if (!enrollment) return 'skipped';

        try {
          const result = moodleGradesByUserId.get(learner.moodleUserId);
          if (!result) return 'skipped';

          const gradeItem = this.extractGradeEntry(result);
          const score = this.toNullableNumber(gradeItem?.graderaw);

          if (score !== null) {
            await this.enrollRepository.update(enrollment.id, {
              lmsFinalscore: score,
              lmsUpdateUser: email,
              lmsUpdateDate: new Date(),
            });
            return 'synced';
          }
          return 'skipped';
        } catch {
          return 'error';
        }
      });

      const chunkResults = await Promise.all(promises);
      synced += chunkResults.filter((r) => r === 'synced').length;
      skipped += chunkResults.filter((r) => r === 'skipped').length;
      errors += chunkResults.filter((r) => r === 'error').length;
    }

    this.logger.log(
      `syncScores course=${courseId}: synced=${synced} skipped=${skipped} errors=${errors}`,
    );
    return { synced, skipped, errors };
  }

  async importGrades(
    email: string,
    courseId: number,
    dto: ImportGradesDto,
  ): Promise<ImportGradesResult> {
    await this.assertCourseAccess(email, courseId);

    const openclass = await this.openclassRepository.findOne({ where: { courseId } });
    const now = new Date();
    const progName = 'instructor_import_grades';
    let saved = 0;
    let failed = 0;
    const errors: Array<{ userCode: string; reason: string }> = [];

    const codes = dto.items.map((item) => item.userCode.trim()).filter(Boolean);
    if (codes.length === 0) return { saved, failed, errors };

    // 1. Bulk fetch users
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where(
        'user.studentCode IN (:...codes) OR user.userCode IN (:...codes) OR user.username IN (:...codes)',
        { codes },
      )
      .getMany();

    const userMapByCode = new Map<string, (typeof users)[0]>();
    for (const u of users) {
      if (u.studentCode) userMapByCode.set(u.studentCode, u);
      if (u.userCode) userMapByCode.set(u.userCode, u);
      if (u.username) userMapByCode.set(u.username, u);
    }

    const userIds = users.map((u) => u.id);

    // 2. Bulk fetch enrollments
    const enrollments =
      userIds.length > 0
        ? await this.enrollRepository
            .createQueryBuilder('enroll')
            .where('enroll.courseId = :courseId', { courseId })
            .andWhere('enroll.userId IN (:...userIds)', { userIds })
            .getMany()
        : [];
    const enrollMapByUserId = new Map(enrollments.map((e) => [e.userId, e]));

    // 3. Bulk fetch existing import records
    const existingImports =
      openclass?.id && userIds.length > 0
        ? await this.importGradeRepository
            .createQueryBuilder('ig')
            .where('ig.openclassId = :openclassId', { openclassId: openclass.id })
            .andWhere('ig.userId IN (:...userIds)', { userIds })
            .getMany()
        : [];
    const importMapByUserId = new Map(existingImports.map((e) => [e.userId, e]));

    // 4. Batch process updates to prevent connection pool exhaustion
    const BATCH_SIZE = 50;
    for (let i = 0; i < dto.items.length; i += BATCH_SIZE) {
      const chunk = dto.items.slice(i, i + BATCH_SIZE);

      const importsToSave: typeof existingImports = [];
      const logsToInsert: LltLogUpdateGrade[] = [];
      const enrollUpdatePromises: Promise<unknown>[] = [];

      for (const item of chunk) {
        const code = item.userCode.trim();
        const user = userMapByCode.get(code);

        if (!user) {
          failed++;
          errors.push({ userCode: code, reason: 'ไม่พบผู้เรียนในระบบ' });
          continue;
        }

        const enroll = enrollMapByUserId.get(user.id);
        if (!enroll) {
          failed++;
          errors.push({ userCode: code, reason: 'ผู้เรียนไม่ได้ลงทะเบียนในรายวิชานี้' });
          continue;
        }

        const gradeText = item.gradeText.trim().substring(0, 3);
        const storedCode = code.substring(0, 8);
        const existing = importMapByUserId.get(user.id);

        // Update or insert import record
        if (existing) {
          existing.grade = gradeText;
          existing.gradeItemId = item.gradeItemId;
          existing.userCode = storedCode;
          importsToSave.push(existing);
        } else {
          importsToSave.push(
            this.importGradeRepository.create({
              openclassId: openclass?.id ?? null,
              userId: user.id,
              userCode: storedCode,
              grade: gradeText,
              gradeItemId: item.gradeItemId,
            }),
          );
        }

        // Log grade change
        logsToInsert.push(
          this.logUpdateGradeRepository.create({
            enrollId: enroll.id,
            gradeItemIdOld: enroll.gradeItemId ?? null,
            updateUserOld: enroll.updateUser ?? null,
            updateDateOld: enroll.updateDate ?? null,
            updateProgOld: enroll.updateProg ?? null,
            gradeItemIdNew: item.gradeItemId,
            updateUserNew: email,
            updateDateNew: now,
            updateProgNew: progName,
          }),
        );

        // Update LLTENROLL
        enrollUpdatePromises.push(
          this.enrollRepository.update(enroll.id, {
            gradeItemId: item.gradeItemId,
            updateUser: email,
            updateDate: now,
            updateProg: progName,
          }),
        );

        // Update local object so subsequent chunks don't use old data
        enroll.gradeItemId = item.gradeItemId;
        enroll.updateUser = email;
        enroll.updateDate = now;
        enroll.updateProg = progName;

        saved++;
      }

      if (importsToSave.length > 0) {
        await this.importGradeRepository.save(importsToSave);
      }

      if (logsToInsert.length > 0) {
        await this.logUpdateGradeRepository.save(logsToInsert);
      }

      if (enrollUpdatePromises.length > 0) {
        await Promise.all(enrollUpdatePromises);
      }
    }

    this.logger.log(`importGrades course=${courseId}: saved=${saved} failed=${failed}`);
    return { saved, failed, errors };
  }

  async approveGrades(
    email: string,
    courseId: number,
    dto: ApproveGradesDto,
  ): Promise<ApproveGradesResult> {
    await this.assertCourseAccess(email, courseId);

    const approvedAt = new Date();
    const enrollments = await this.enrollRepository.find({ where: { courseId } });

    const enrollsToApprove = enrollments.filter((e) => e.gradeItemId);
    const skipped = enrollments.length - enrollsToApprove.length;
    const approved = enrollsToApprove.length;

    if (approved > 0) {
      // 1. Bulk Update all eligible enrollments in a single query
      await this.enrollRepository
        .createQueryBuilder()
        .update()
        .set({
          approveGrade: 'Y',
          approveGradeDetail: [
            dto.approveDetail,
            dto.approveDate ? `วันที่ประชุม: ${dto.approveDate}` : '',
          ]
            .filter(Boolean)
            .join(' | '),
          updateDateGrade: approvedAt,
          updateUser: email,
          updateDate: new Date(),
          updateProg: 'instructor_approve_grades',
        })
        .where('courseId = :courseId', { courseId })
        .andWhere('gradeItemId IS NOT NULL')
        .execute();

      // 2. Batch process skill recalculations concurrently
      const BATCH_SIZE = 50;
      const userIds = enrollsToApprove.map((e) => e.userId);

      for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
        const chunk = userIds.slice(i, i + BATCH_SIZE);
        await Promise.all(
          chunk.map(async (userId) => {
            try {
              await this.lltcourseskillService.recalculateUserSkills(userId, email);
            } catch (err: unknown) {
              this.logger.error(`Failed to recalculate skills for user ${userId}`, err);
            }
          }),
        );
      }
    }

    this.logger.log(`approveGrades course=${courseId}: approved=${approved} skipped=${skipped}`);
    return { approved, skipped, approvedBy: email, approvedAt };
  }

  async getApprovalStatus(
    email: string,
    courseId: number,
  ): Promise<{
    approved: boolean;
    approvedBy: string | null;
    approvedAt: Date | null;
    detail: string | null;
  }> {
    await this.assertCourseAccess(email, courseId);
    const enroll = await this.enrollRepository.findOne({
      where: { courseId, approveGrade: 'Y' },
    });
    if (!enroll) {
      return { approved: false, approvedBy: null, approvedAt: null, detail: null };
    }

    const approverEmail = enroll.updateUser ?? null;
    let approvedBy = approverEmail;
    if (approverEmail) {
      const profile = await this.getProfile(approverEmail);
      const parts = [profile.prefix, profile.firstNameTh, profile.lastNameTh].filter(Boolean);
      if (parts.length > 0) approvedBy = parts.join(' ');
    }

    return {
      approved: true,
      approvedBy,
      approvedAt: enroll.updateDateGrade ?? null,
      detail: enroll.approveGradeDetail ?? null,
    };
  }

  private async assertCourseAccess(email: string, courseId: number): Promise<Lltcourse> {
    const normalizedEmail = this.normalizeEmail(email);
    const course = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoin(Lltcoursein, 'coursein', 'coursein.courseId = course.id')
      .where('course.id = :courseId', { courseId })
      .andWhere('(LOWER(coursein.email) = :email OR LOWER(course.createUser) = :email)', {
        email: normalizedEmail,
      })
      .getOne();

    if (!course) {
      throw new NotFoundException('Instructor course not found');
    }

    return course;
  }

  private async getMoodleMessages(
    instructorMoodleUserId: number,
    learnerMoodleUserId: number | null,
  ): Promise<InstructorConversationMessage[]> {
    if (!learnerMoodleUserId) return [];

    try {
      const params = new URLSearchParams();
      params.append('useridto', String(instructorMoodleUserId));
      params.append('useridfrom', String(learnerMoodleUserId));
      params.append('limitnum', '50');
      const result = (await this.moodleService.callMoodleApi(
        'core_message_get_messages',
        params,
      )) as { messages?: MoodleConversationMessage[] };

      return (result.messages ?? [])
        .map((message) => ({
          id: String(message.id ?? `${message.useridfrom}-${message.timecreated}`),
          sender:
            message.useridfrom === instructorMoodleUserId
              ? ('instructor' as const)
              : ('learner' as const),
          body: message.text ?? message.fullmessage ?? '',
          sentAt: new Date((message.timecreated ?? 0) * 1000),
          status: 'sent' as const,
        }))
        .filter((message) => message.body.trim().length > 0)
        .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Unable to fetch Moodle messages for learner ${learnerMoodleUserId}: ${message}`,
      );
      return [];
    }
  }

  private mapLearner(row: LearnerRow): InstructorLearner {
    const nameTh = [row.first_name_th, row.last_name_th].filter(Boolean).join(' ').trim();
    const nameEn = [row.first_name_en, row.last_name_en].filter(Boolean).join(' ').trim();
    const fullName = nameTh || nameEn || row.username || `Learner ${row.user_id}`;

    return {
      enrollmentId: row.enrollment_id,
      courseId: row.course_id,
      openclassId: row.openclass_id,
      userId: row.user_id,
      username: row.username,
      studentId: row.username ?? String(row.user_id),
      firstNameTh: row.first_name_th,
      lastNameTh: row.last_name_th,
      firstNameEn: row.first_name_en,
      lastNameEn: row.last_name_en,
      fullName,
      email: row.email,
      phone: row.phone,
      moodleUserId: row.moodle_user_id,
      enrolledAt: row.enrolled_at,
      paymentStatus: row.payment_status,
      enrollmentStatus: row.enrollment_status,
    };
  }

  private createPendingGrade(
    learner: InstructorLearner,
    courseId: number,
    moodleCourseId: number | null,
    enroll?: LltEnroll,
    gradeItemById?: Map<number, string>,
  ): InstructorGrade {
    return {
      learnerUserId: learner.userId,
      moodleUserId: learner.moodleUserId,
      studentId: learner.studentId,
      learnerName: learner.fullName,
      courseId,
      moodleCourseId,
      score: null,
      maxScore: null,
      grade: null,
      status: 'pending',
      updatedAt: null,
      lmsFinalscore: enroll?.lmsFinalscore ?? null,
      lmsSyncedAt: enroll?.lmsUpdateDate ?? null,
      gradeItems: [],
      importedGradeId: enroll?.gradeItemId ?? null,
      importedGradeName:
        enroll?.gradeItemId && gradeItemById
          ? (gradeItemById.get(enroll.gradeItemId) ?? null)
          : null,
    };
  }

  private extractGradeEntry(result: MoodleGradeItem): MoodleGradeEntry | undefined {
    const items = result.usergrades?.[0]?.gradeitems ?? result.gradeitems ?? [];
    const graded = items.filter((item) => item.graderaw !== null && item.graderaw !== undefined);
    return graded.find((item) => item.itemtype === 'course') ?? graded[0];
  }

  private extractAllGradeItems(
    result: MoodleGradeItem,
    cmidMap: Map<string, number>,
  ): GradeItemBreakdown[] {
    const items = result.usergrades?.[0]?.gradeitems ?? result.gradeitems ?? [];
    return items
      .filter((item) => item.itemtype !== 'course')
      .map((item) => {
        const key = `${item.itemmodule ?? ''}:${item.iteminstance ?? ''}`;
        return {
          itemtype: item.itemtype ?? 'mod',
          itemmodule: item.itemmodule ?? null,
          itemname: item.itemname ?? null,
          score: this.toNullableNumber(item.graderaw),
          maxScore: this.toNullableNumber(item.grademax),
          cmid: cmidMap.get(key) ?? null,
        };
      });
  }

  private async getCmidMap(moodleCourseId: number): Promise<Map<string, number>> {
    try {
      const pool = this.getMoodlePool();
      interface CmidRow extends RowDataPacket {
        module_name: string;
        instance: number;
        cmid: number;
      }
      const [rows] = await pool.query<CmidRow[]>(
        `SELECT m.name AS module_name, cm.instance, cm.id AS cmid
         FROM mdl_course_modules cm
         JOIN mdl_modules m ON m.id = cm.module
         WHERE cm.course = ?`,
        [moodleCourseId],
      );
      const map = new Map<string, number>();
      for (const row of rows) {
        map.set(`${row.module_name}:${row.instance}`, row.cmid);
      }
      return map;
    } catch {
      return new Map();
    }
  }

  private toNullableNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === '') return null;
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private normalizeEmail(email: string | undefined): string {
    return (email ?? '').trim().toLowerCase();
  }

  private async getMoodleCourseIdByCourseId(courseId: number): Promise<number | null> {
    const openclass = await this.openclassRepository.findOne({ where: { courseId } });
    return openclass?.lmsId ?? null;
  }

  private getMoodlePool(): Pool {
    if (this.moodlePool) {
      return this.moodlePool;
    }

    const host = this.configService.get<string>('MOODLE_DB_HOST');
    const user = this.configService.get<string>('MOODLE_DB_USER');
    const database = this.configService.get<string>('MOODLE_DB_NAME');

    if (!host || !user || !database) {
      throw new Error(
        'Moodle DB connection is not configured (set MOODLE_DB_HOST, MOODLE_DB_USER, and MOODLE_DB_NAME).',
      );
    }

    this.moodlePool = createPool({
      host,
      port: Number(this.configService.get<number>('MOODLE_DB_PORT') ?? 3306),
      user,
      password: this.configService.get<string>('MOODLE_DB_PASSWORD') ?? '',
      database,
      waitForConnections: true,
      connectionLimit: 4,
      queueLimit: 0,
    });

    return this.moodlePool;
  }
}
