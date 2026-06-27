import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MoodleService } from '../moodle/moodle.service';
import { MoodleUserTokenService } from '../moodle/moodle-user-token.service';
import { LltcourseskillService } from '../courses/lltcourseskill/lltcourseskill.service';

export interface ProgressRow {
  progressId: number | string;
  enrollId: number | string;
  subChapterId: number | string;
  status: string;
  progressDate: Date | string | null;
}

interface EnrollmentCompletionContext {
  enrollId: number | string;
  moodleCourseId: number | string | null;
  moodleUserId: number | string | null;
  enrollStatus: string | null;
  userId: number | string | null;
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
  private readonly completionWarningAt = new Map<number, number>();
  private readonly moodleCompletionConcurrency = 4;

  constructor(
    private readonly dataSource: DataSource,
    private readonly moodleService: MoodleService,
    private readonly moodleUserTokenService: MoodleUserTokenService,
    private readonly lltcourseskillService: LltcourseskillService,
  ) {}

  async verifyEnrollmentOwnership(
    enrollId: number,
    userId: number | null,
    username?: string,
  ): Promise<void> {
    await this.verifyEnrollmentsOwnership([enrollId], userId, username);
  }

  async verifyEnrollmentsOwnership(
    enrollIds: number[],
    userId: number | null,
    username?: string,
  ): Promise<void> {
    const uniqueIds = this.normalizeEnrollIds(enrollIds);
    const ownerConditions: string[] = [];
    const ownerParams: Array<number | string> = [];

    if (userId != null) {
      ownerConditions.push('e.USER_ID = ?');
      ownerParams.push(userId);
    }
    if (username) {
      ownerConditions.push('u.USER_USERNAME = ?');
      ownerParams.push(username);
    }
    if (uniqueIds.length === 0 || ownerConditions.length === 0) {
      throw new ForbiddenException();
    }

    const placeholders = uniqueIds.map(() => '?').join(', ');
    const rows = await this.dataSource.query<Array<{ enrollId: number | string }>>(
      `SELECT e.ENROLL_ID AS enrollId
         FROM LLTENROLL e
         JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        WHERE e.ENROLL_ID IN (${placeholders})
          AND (${ownerConditions.join(' OR ')})`,
      [...uniqueIds, ...ownerParams],
    );
    const ownedIds = new Set(rows.map((row) => Number(row.enrollId)));
    if (ownedIds.size !== uniqueIds.length) {
      throw new ForbiddenException();
    }
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
    const rows = await this.loadCompletionContexts([enrollId]);
    return rows[0] ? this.toLocalCompletion(rows[0]) : this.emptyCompletion();
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
    const items = await this.getMoodleCompletions([enrollId]);
    return items[String(enrollId)] ?? this.emptyCompletion();
  }

  async getMoodleCompletions(enrollIds: number[]): Promise<Record<string, CompletionResult>> {
    const uniqueIds = this.normalizeEnrollIds(enrollIds);
    const contexts = await this.loadCompletionContexts(uniqueIds);
    const contextById = new Map(contexts.map((context) => [Number(context.enrollId), context]));
    const results: Record<string, CompletionResult> = Object.fromEntries(
      uniqueIds.map((enrollId) => [String(enrollId), this.emptyCompletion()]),
    );
    let cursor = 0;

    const worker = async (): Promise<void> => {
      while (cursor < uniqueIds.length) {
        const enrollId = uniqueIds[cursor++];
        const context = contextById.get(enrollId);
        if (!context) continue;
        results[String(enrollId)] = await this.resolveMoodleCompletion(context);
      }
    };

    const workerCount = Math.min(this.moodleCompletionConcurrency, uniqueIds.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return results;
  }

  private async resolveMoodleCompletion(
    context: EnrollmentCompletionContext,
  ): Promise<CompletionResult> {
    const localCompletion = this.toLocalCompletion(context);
    const enrollId = Number(context.enrollId);
    const moodleCourseId = Number(context.moodleCourseId) || null;
    const moodleUserId = Number(context.moodleUserId) || null;
    const userId = Number(context.userId) || null;

    if (!moodleCourseId || !moodleUserId) return localCompletion;

    try {
      const userToken = await this.moodleUserTokenService.getTokenForMoodleUserId(moodleUserId);
      const { total, done } = await this.moodleService.getActivityCompletionStatus(
        moodleCourseId,
        moodleUserId,
        userToken,
      );
      const completed = total > 0 && done >= total;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;

      if (completed && context.enrollStatus !== 'C' && userId) {
        await this.dataSource.query(
          `UPDATE LLTENROLL SET ENROLL_STATUS = 'C', UPDATEDATE = NOW() WHERE ENROLL_ID = ?`,
          [enrollId],
        );
        try {
          await this.lltcourseskillService.recalculateUserSkills(userId, 'SYSTEM_AUTO_COMPLETION');
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(`Failed to recalculate skills for user ${userId}: ${message}`);
        }
      }

      return { completed, total, done, percent };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logCompletionWarning(moodleCourseId, enrollId, message);
      return localCompletion;
    }
  }

  private async loadCompletionContexts(
    enrollIds: number[],
  ): Promise<EnrollmentCompletionContext[]> {
    if (enrollIds.length === 0) return [];
    const placeholders = enrollIds.map(() => '?').join(', ');
    return this.dataSource.query<EnrollmentCompletionContext[]>(
      `SELECT e.ENROLL_ID AS enrollId,
              oc.LMS_ID AS moodleCourseId,
              u.LMS_ID AS moodleUserId,
              e.ENROLL_STATUS AS enrollStatus,
              e.USER_ID AS userId,
              COUNT(DISTINCT s.COSESUBCHAP_ID) AS total,
              COUNT(DISTINCT p.COSESUBCHAP_ID) AS done
         FROM LLTENROLL e
         JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
         LEFT JOIN LLTOPENCLASS oc ON oc.OPENCLASS_ID = e.OPENCLASS_ID
         LEFT JOIN LLTCOURSECHAPTER ch ON ch.COSE_ID = e.COSE_ID
         LEFT JOIN LLTCOURSESUBCHAPTER s ON s.COSECHAP_ID = ch.COSECHAP_ID
         LEFT JOIN LLTPROGRESS p ON p.ENROLL_ID = e.ENROLL_ID
                                AND p.COSESUBCHAP_ID = s.COSESUBCHAP_ID
                                AND p.PROGRESS_STATUS = 'completed'
        WHERE e.ENROLL_ID IN (${placeholders})
        GROUP BY e.ENROLL_ID, oc.LMS_ID, u.LMS_ID, e.ENROLL_STATUS, e.USER_ID`,
      enrollIds,
    );
  }

  private toLocalCompletion(context: EnrollmentCompletionContext): CompletionResult {
    const total = Number(context.total ?? 0);
    const progressDone = Number(context.done ?? 0);
    const done = total > 0 && context.enrollStatus === 'C' ? total : progressDone;
    const completed = total > 0 && done >= total;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { completed, total, done, percent };
  }

  private emptyCompletion(): CompletionResult {
    return { completed: false, total: 0, done: 0, percent: 0 };
  }

  private normalizeEnrollIds(enrollIds: number[]): number[] {
    return [...new Set(enrollIds.filter((id) => Number.isInteger(id) && id > 0))];
  }

  private logCompletionWarning(courseId: number, enrollId: number, message: string): void {
    const now = Date.now();
    const lastWarningAt = this.completionWarningAt.get(courseId) ?? 0;
    if (now - lastWarningAt < 60_000) return;
    this.completionWarningAt.set(courseId, now);
    this.logger.warn(
      `Moodle completion unavailable for courseId=${courseId}, enrollId=${enrollId}; using LLL progress: ${message}`,
    );
  }
}
