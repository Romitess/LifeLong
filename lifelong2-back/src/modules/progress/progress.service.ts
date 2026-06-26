import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MoodleService } from '../moodle/moodle.service';
import { LltcourseskillService } from '../../lltcourseskill/lltcourseskill.service';

export interface ProgressRow {
  progressId: number | string;
  enrollId: number | string;
  subChapterId: number | string;
  status: string;
  progressDate: Date | string | null;
}

interface CompletionRow {
  total: number | string;
  done: number | string;
}

export interface CompletionResult {
  completed: boolean;
  total: number;
  done: number;
  percent: number;
}

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly moodleService: MoodleService,
    private readonly lltcourseskillService: LltcourseskillService,
  ) {}

  async verifyEnrollmentOwnership(
    enrollId: number,
    userId: number | null,
    username?: string,
  ): Promise<void> {
    // Primary check: by LLTUMUSER.USER_ID
    if (userId != null) {
      const rows = await this.dataSource.query<Array<{ cnt: number | string }>>(
        'SELECT COUNT(*) AS cnt FROM LLTENROLL WHERE ENROLL_ID = ? AND USER_ID = ?',
        [enrollId, userId],
      );
      if (Number(rows[0]?.cnt ?? 0) > 0) return;
    }
    // Fallback: by username join (handles users whose lltumSub is null)
    if (username) {
      const rows = await this.dataSource.query<Array<{ cnt: number | string }>>(
        `SELECT COUNT(*) AS cnt FROM LLTENROLL e
         JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
         WHERE e.ENROLL_ID = ? AND u.USER_USERNAME = ?`,
        [enrollId, username],
      );
      if (Number(rows[0]?.cnt ?? 0) > 0) return;
    }
    throw new ForbiddenException();
  }

  async markCompleted(enrollId: number, subChapterId: number): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO LLTPROGRESS (ENROLL_ID, COSESUBCHAP_ID, PROGRESS_STATUS, PROGRESS_DATE, CREATEDATE, UPDATEDATE)
       VALUES (?, ?, 'completed', NOW(), NOW(), NOW())
       ON DUPLICATE KEY UPDATE PROGRESS_STATUS = 'completed', PROGRESS_DATE = NOW(), UPDATEDATE = NOW()`,
      [enrollId, subChapterId],
    );
  }

  async getByEnrollId(enrollId: number): Promise<ProgressRow[]> {
    return this.dataSource.query<ProgressRow[]>(
      `SELECT
         PROGRESS_ID      AS progressId,
         ENROLL_ID        AS enrollId,
         COSESUBCHAP_ID   AS subChapterId,
         PROGRESS_STATUS  AS status,
         PROGRESS_DATE    AS progressDate
       FROM LLTPROGRESS
       WHERE ENROLL_ID = ?
       ORDER BY COSESUBCHAP_ID ASC`,
      [enrollId],
    );
  }

  async checkCompletion(enrollId: number): Promise<CompletionResult> {
    // If enrollment is already marked complete in the DB, treat it as 100% regardless of progress rows.
    const statusRows = await this.dataSource.query<Array<{ enrollStatus: string | null }>>(
      `SELECT ENROLL_STATUS AS enrollStatus FROM LLTENROLL WHERE ENROLL_ID = ?`,
      [enrollId],
    );
    if (statusRows[0]?.enrollStatus === 'C') {
      return { completed: true, total: 1, done: 1, percent: 100 };
    }

    const rows = await this.dataSource.query<CompletionRow[]>(
      `SELECT
         COUNT(DISTINCT s.COSESUBCHAP_ID) AS total,
         COUNT(DISTINCT p.COSESUBCHAP_ID) AS done
       FROM LLTENROLL e
       JOIN LLTCOURSECHAPTER ch   ON ch.COSE_ID = e.COSE_ID
       JOIN LLTCOURSESUBCHAPTER s ON s.COSECHAP_ID = ch.COSECHAP_ID
       LEFT JOIN LLTPROGRESS p    ON p.ENROLL_ID = e.ENROLL_ID
                                 AND p.COSESUBCHAP_ID = s.COSESUBCHAP_ID
                                 AND p.PROGRESS_STATUS = 'completed'
       WHERE e.ENROLL_ID = ?`,
      [enrollId],
    );

    const total = Number(rows[0]?.total ?? 0);
    const done = Number(rows[0]?.done ?? 0);
    const completed = total > 0 && done >= total;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;

    return { completed, total, done, percent };
  }

  async autoCompleteEnrollment(enrollId: number): Promise<void> {
    await this.dataSource.query(
      `UPDATE LLTENROLL SET ENROLL_STATUS = 'C', UPDATEDATE = NOW()
       WHERE ENROLL_ID = ? AND (ENROLL_STATUS IS NULL OR ENROLL_STATUS <> 'C')`,
      [enrollId],
    );

    const rows = await this.dataSource.query<
      Array<{ moodleCourseId: number | null; moodleUserId: number | null }>
    >(
      `SELECT oc.LMS_ID AS moodleCourseId, u.LMS_ID AS moodleUserId
       FROM LLTENROLL e
       JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
       LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = e.OPENCLASS_ID
       WHERE e.ENROLL_ID = ?`,
      [enrollId],
    );

    const moodleCourseId = rows[0]?.moodleCourseId ? Number(rows[0].moodleCourseId) : null;
    const moodleUserId = rows[0]?.moodleUserId ? Number(rows[0].moodleUserId) : null;

    if (moodleCourseId && moodleUserId) {
      try {
        await this.moodleService.unenrolUserFromCourse(moodleCourseId, moodleUserId);
        this.logger.log(
          `Auto-unenrolled user ${moodleUserId} from Moodle course ${moodleCourseId} after completion`,
        );
      } catch (e: unknown) {
        this.logger.warn(
          `Moodle unenroll after completion failed for enrollId=${enrollId}: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    }
  }

  async getMoodleCompletion(enrollId: number): Promise<CompletionResult> {
    const rows = await this.dataSource.query<
      Array<{
        moodleCourseId: number | null;
        moodleUserId: number | null;
        enrollStatus: string | null;
        userId: number | null;
      }>
    >(
      `SELECT oc.LMS_ID AS moodleCourseId, u.LMS_ID AS moodleUserId, e.ENROLL_STATUS AS enrollStatus, e.USER_ID AS userId
       FROM LLTENROLL e
       JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
       LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = e.OPENCLASS_ID
       WHERE e.ENROLL_ID = ?`,
      [enrollId],
    );

    const moodleCourseId = rows[0]?.moodleCourseId ? Number(rows[0].moodleCourseId) : null;
    const moodleUserId = rows[0]?.moodleUserId ? Number(rows[0].moodleUserId) : null;
    const enrollStatus = rows[0]?.enrollStatus;
    const userId = rows[0]?.userId ? Number(rows[0].userId) : null;

    if (!moodleCourseId || !moodleUserId) {
      return this.checkCompletion(enrollId);
    }

    try {
      const { total, done } = await this.moodleService.getActivityCompletionStatus(
        moodleCourseId,
        moodleUserId,
      );
      const completed = total > 0 && done >= total;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;

      if (completed) {
        if (enrollStatus !== 'C' && userId) {
          await this.dataSource.query(
            `UPDATE LLTENROLL SET ENROLL_STATUS = 'C', UPDATEDATE = NOW() WHERE ENROLL_ID = ?`,
            [enrollId],
          );
          try {
            await this.lltcourseskillService.recalculateUserSkills(
              userId,
              'SYSTEM_AUTO_COMPLETION',
            );
          } catch (e) {
            this.logger.error(`Failed to recalculate skills for user ${userId}`, e);
          }
        }
      }

      return { completed, total, done, percent };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // invalidrecord = Moodle course deleted or user already unenrolled (expected after auto-unenroll)
      const level = msg.includes('invalidrecord') ? 'warn' : 'error';
      this.logger[level](`getMoodleCompletion enrollId=${enrollId}: ${msg}`);
      return this.checkCompletion(enrollId);
    }
  }
}
