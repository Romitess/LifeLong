import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MoodleService } from '../moodle.service';
import { MoodleUserTokenService } from '../moodle-user-token.service';

export interface QuizInfo {
  id: number;
  coursemodule: number;
  name: string;
  intro: string | null;
  grade: number | null;
  gradepass: number | null;
  sumgrades: number | null;
  attempts: number; // allowed attempts (0 = unlimited)
  grademethod: number;
  timelimit: number;
}

export interface QuizAttempt {
  id: number;
  attempt: number;
  state: string;
  sumgrades: number | null;
  timestart: number;
  timefinish: number;
  currentpage: number;
}

export interface QuizQuestionView {
  slot: number;
  number: number | string;
  type: string;
  page: number;
  html: string;
  state?: string;
}

export interface QuizAttemptData {
  attempt: QuizAttempt;
  questions: QuizQuestionView[];
  nextpage: number;
}

/** One row in the quiz navigation grid — lightweight (no question HTML). */
export interface QuizSummaryQuestion {
  slot: number;
  number: number | string;
  page: number;
  state: string; // raw Moodle state: 'todo' | 'complete' | 'invalid' | ...
  status: string; // human label: 'Not yet answered' | 'Answer saved' | ...
  flagged: boolean;
}

export interface QuizAttemptSummary {
  questions: QuizSummaryQuestion[];
  totalUnanswered: number;
}

interface RawQuiz {
  id: number;
  coursemodule: number;
  name?: string;
  intro?: string;
  grade?: number;
  gradepass?: number;
  sumgrades?: number;
  attempts?: number;
  grademethod?: number;
  timelimit?: number;
}

interface RawAttempt {
  id: number;
  attempt?: number;
  state?: string;
  sumgrades?: number | null;
  timestart?: number;
  timefinish?: number;
  currentpage?: number;
}

/**
 * Native Moodle quiz flow, executed with the student's own per-user WS token so
 * attempts are correctly attributed. Question markup is Moodle's own rendered HTML;
 * the frontend renders it inside a form and posts the serialized fields back here.
 */
@Injectable()
export class MoodleQuizService {
  private readonly logger = new Logger(MoodleQuizService.name);

  constructor(
    private readonly moodleService: MoodleService,
    private readonly tokenService: MoodleUserTokenService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ดึง per-user token ของนักเรียนจาก username
  private async tokenFor(username: string): Promise<string> {
    return this.tokenService.getTokenForUsername(username);
  }

  /** Quiz metadata (matched by course-module id) + the user's attempts. */
  async getQuiz(
    username: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<{ quiz: QuizInfo; attempts: QuizAttempt[] }> {
    // Native quiz needs the student enrolled in Moodle (per-user token only sees
    // enrolled courses); enrol on access, mirroring the SSO flow.
    await this.moodleService.ensureStudentEnrolled(username, moodleCourseId);
    const token = await this.tokenFor(username);

    const listParams = new URLSearchParams();
    listParams.append('courseids[0]', moodleCourseId.toString());
    const list = (await this.moodleService.callMoodleApi(
      'mod_quiz_get_quizzes_by_courses',
      listParams,
      token,
    )) as { quizzes?: RawQuiz[] };

    const raw = (list?.quizzes ?? []).find((q) => q.coursemodule === moduleId);
    if (!raw) {
      throw new NotFoundException(`ไม่พบแบบทดสอบ (module ${moduleId}) ในวิชา ${moodleCourseId}`);
    }

    // gradepass is not exposed by mod_quiz_get_quizzes_by_courses — read from mdl_grade_items
    const gradepass = await this.tokenService.getQuizGradepass(raw.id);

    const quiz: QuizInfo = {
      id: raw.id,
      coursemodule: raw.coursemodule,
      name: raw.name ?? '',
      intro: raw.intro ?? null,
      grade: raw.grade ?? null,
      gradepass,
      sumgrades: raw.sumgrades ?? null,
      attempts: raw.attempts ?? 0,
      grademethod: raw.grademethod ?? 1,
      timelimit: raw.timelimit ?? 0,
    };

    return { quiz, attempts: await this.getAttempts(token, raw.id) };
  }

  // ดึง attempts ทุกสถานะของ quiz นี้; คืน [] ถ้า Moodle ปฏิเสธ access (quiz มี restriction)
  private async getAttempts(token: string, quizId: number): Promise<QuizAttempt[]> {
    const params = new URLSearchParams();
    params.append('quizid', quizId.toString());
    params.append('status', 'all');
    try {
      const res = (await this.moodleService.callMoodleApi(
        'mod_quiz_get_user_attempts',
        params,
        token,
      )) as { attempts?: RawAttempt[] };
      return (res?.attempts ?? []).map((a) => this.mapAttempt(a));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('accessexception')) {
        this.logger.warn(
          `mod_quiz_get_user_attempts access denied for quiz ${quizId} — quiz may have restrictions`,
        );
        return [];
      }
      throw err;
    }
  }

  /** Resume the in-progress attempt if one exists, otherwise start a new one. */
  async startAttempt(username: string, quizId: number): Promise<QuizAttempt> {
    const token = await this.tokenFor(username);

    const existing = (await this.getAttempts(token, quizId)).find(
      (a) => a.state === 'inprogress' || a.state === 'overdue',
    );
    if (existing) return existing;

    const params = new URLSearchParams();
    params.append('quizid', quizId.toString());
    const res = (await this.moodleService.callMoodleApi(
      'mod_quiz_start_attempt',
      params,
      token,
    )) as { attempt?: RawAttempt };
    if (!res?.attempt) {
      throw new NotFoundException('ไม่สามารถเริ่มทำแบบทดสอบได้');
    }
    return this.mapAttempt(res.attempt);
  }

  /** Questions for a page of an attempt (Moodle-rendered HTML). */
  async getAttemptData(
    username: string,
    attemptId: number,
    page: number,
  ): Promise<QuizAttemptData> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('attemptid', attemptId.toString());
    params.append('page', page.toString());
    let res: {
      attempt: RawAttempt;
      nextpage?: number;
      questions?: Array<{
        slot: number;
        number?: number | string;
        questionnumber?: number | string;
        type?: string;
        page?: number;
        html?: string;
        state?: string;
      }>;
    };
    try {
      res = (await this.moodleService.callMoodleApi(
        'mod_quiz_get_attempt_data',
        params,
        token,
      )) as typeof res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.toLowerCase().includes('invalid page number') ||
        msg.includes('invalidpagenumber') ||
        msg.includes('attemptalreadyclosed')
      ) {
        throw new BadRequestException(
          'Quiz attempt is not accessible — it may already be finished',
        );
      }
      throw err;
    }
    return {
      attempt: this.mapAttempt(res.attempt),
      nextpage: res.nextpage ?? -1,
      questions: (res.questions ?? []).map((q) => ({
        slot: q.slot,
        number: q.number ?? q.questionnumber ?? q.slot,
        type: q.type ?? '',
        page: q.page ?? page,
        html: q.html ?? '',
        ...(q.state ? { state: q.state } : {}),
      })),
    };
  }

  /**
   * Lightweight summary of every question in the attempt (slot/number/page/state/flag)
   * for the navigation grid and the finish-attempt screen — no question HTML.
   */
  async getAttemptSummary(username: string, attemptId: number): Promise<QuizAttemptSummary> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('attemptid', attemptId.toString());
    // Note: this WS returns { questions, totalunanswered, warnings } — NO `attempt` object.
    // Per-question state is in `stateclass` (machine value) + `status` (human label).
    const res = (await this.moodleService.callMoodleApi(
      'mod_quiz_get_attempt_summary',
      params,
      token,
    )) as {
      totalunanswered?: number;
      questions?: Array<{
        slot: number;
        number?: number | string;
        questionnumber?: number | string;
        page?: number;
        stateclass?: string;
        status?: string;
        flagged?: boolean;
      }>;
    };

    return {
      totalUnanswered: res.totalunanswered ?? 0,
      questions: (res.questions ?? []).map((q) => ({
        slot: q.slot,
        number: q.number ?? q.questionnumber ?? q.slot,
        page: q.page ?? 0,
        state: q.stateclass ?? '',
        status: q.status ?? '',
        flagged: !!q.flagged,
      })),
    };
  }

  /**
   * Save answers (finish=false) or submit the attempt for grading (finish=true).
   * Note: mod_quiz_process_attempt does NOT accept a `page` param — it persists
   * whatever form fields are sent; pages are only meaningful when fetching data.
   * When finish=true and moodleCourseId/cmid/enrollId/subChapterId are provided,
   * checks Moodle activity completion state and auto-marks the subchapter complete.
   */
  async processAttempt(
    username: string,
    attemptId: number,
    finish: boolean,
    data: Array<{ name: string; value: string }>,
    timeUp = false,
    completion?: { moodleCourseId: number; cmid: number; enrollId?: number; subChapterId?: number },
  ): Promise<{ state: string; autoMarked: boolean; passed: boolean }> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('attemptid', attemptId.toString());
    params.append('finishattempt', finish ? '1' : '0');
    params.append('timeup', timeUp ? '1' : '0');
    data.forEach((d, i) => {
      params.append(`data[${i}][name]`, d.name);
      params.append(`data[${i}][value]`, d.value);
    });
    const res = (await this.moodleService.callMoodleApi(
      'mod_quiz_process_attempt',
      params,
      token,
    )) as { state?: string };

    let autoMarked = false;
    let passed = false;
    if (finish && completion) {
      const { moodleCourseId, cmid, enrollId, subChapterId } = completion;
      try {
        const state = await this.moodleService.getActivityCompletionState(
          moodleCourseId,
          cmid,
          token,
        );
        passed = state >= 1 && state !== 3;
        if (passed && enrollId != null) {
          const ids: number[] =
            subChapterId != null
              ? [subChapterId]
              : await this.resolveSubChapterIds(moodleCourseId, cmid, enrollId);
          for (const id of ids) {
            await this.dataSource.query(
              `INSERT INTO LLTPROGRESS (ENROLL_ID, COSESUBCHAP_ID, PROGRESS_STATUS, PROGRESS_DATE, CREATEDATE, UPDATEDATE)
               VALUES (?, ?, 'completed', NOW(), NOW(), NOW())
               ON DUPLICATE KEY UPDATE PROGRESS_STATUS = 'completed', PROGRESS_DATE = NOW(), UPDATEDATE = NOW()`,
              [enrollId, id],
            );
          }
          if (ids.length > 0) autoMarked = true;
        }
      } catch (err: unknown) {
        this.logger.warn(
          `processAttempt auto-mark failed (enrollId=${enrollId}, subChapterId=${subChapterId}): ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { state: res?.state ?? 'unknown', autoMarked, passed };
  }

  /**
   * Resolve COSESUBCHAP_ID for a Moodle module (cmid) given the enrollment.
   * Looks up the Moodle section that contains the module, then matches the
   * section name against LLTCOURSESUBCHAPTER.COSESUBCHAP_SUBJECT for the course.
   */
  /**
   * Returns the COSESUBCHAP_IDs to mark when a quiz/assign is passed.
   * First tries to match the Moodle section name to a subchapter subject.
   * Falls back to matching against a chapter name and returning ALL subchapters of that chapter
   * (for chapter-level quizzes placed directly in the chapter section).
   */
  private async resolveSubChapterIds(
    moodleCourseId: number,
    cmid: number,
    enrollId: number,
  ): Promise<number[]> {
    try {
      const params = new URLSearchParams();
      params.append('courseid', moodleCourseId.toString());
      const sections = (await this.moodleService.callMoodleApi(
        'core_course_get_contents',
        params,
      )) as Array<{ name: string; modules?: Array<{ id: number }> }>;

      const sectionName = sections.find((s) => (s.modules ?? []).some((m) => m.id === cmid))?.name;
      if (!sectionName) return [];

      const courseRows = await this.dataSource.query<Array<{ courseId: number }>>(
        `SELECT e.COSE_ID AS courseId FROM LLTENROLL e WHERE e.ENROLL_ID = ?`,
        [enrollId],
      );
      const courseId = courseRows[0]?.courseId;
      if (!courseId) return [];

      // Try exact subchapter match first
      const subchapRows = await this.dataSource.query<Array<{ subChapterId: number }>>(
        `SELECT sc.COSESUBCHAP_ID AS subChapterId
         FROM LLTCOURSESUBCHAPTER sc
         JOIN LLTCOURSECHAPTER ch ON ch.COSECHAP_ID = sc.COSECHAP_ID
         WHERE ch.COSE_ID = ? AND sc.COSESUBCHAP_SUBJECT = ?
         LIMIT 1`,
        [courseId, sectionName],
      );
      if (subchapRows.length > 0 && subchapRows[0]?.subChapterId != null) {
        return [subchapRows[0].subChapterId];
      }

      // Fallback: section name may be a chapter name — mark all subchapters of that chapter
      const allRows = await this.dataSource.query<Array<{ subChapterId: number }>>(
        `SELECT sc.COSESUBCHAP_ID AS subChapterId
         FROM LLTCOURSESUBCHAPTER sc
         JOIN LLTCOURSECHAPTER ch ON ch.COSECHAP_ID = sc.COSECHAP_ID
         WHERE ch.COSE_ID = ? AND ch.COSECHAP_SUBJECT = ?`,
        [courseId, sectionName],
      );
      return allRows.map((r) => r.subChapterId).filter((id) => id != null);
    } catch (err: unknown) {
      this.logger.warn(
        `resolveSubChapterIds failed (cmid=${cmid}, enrollId=${enrollId}): ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  /** Reviewed attempt (grade + per-question feedback HTML) after submission. */
  async getAttemptReview(
    username: string,
    attemptId: number,
  ): Promise<{ grade: number | null; attempt: QuizAttempt; questions: QuizQuestionView[] }> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('attemptid', attemptId.toString());
    const res = (await this.moodleService.callMoodleApi(
      'mod_quiz_get_attempt_review',
      params,
      token,
    )) as {
      grade?: string | number;
      attempt: RawAttempt;
      questions?: Array<{
        slot: number;
        number?: number | string;
        type?: string;
        page?: number;
        html?: string;
        state?: string;
      }>;
    };

    const gradeNum = typeof res.grade === 'string' ? Number(res.grade) : (res.grade ?? null);
    return {
      grade: gradeNum != null && !Number.isNaN(gradeNum) ? gradeNum : null,
      attempt: this.mapAttempt(res.attempt),
      questions: (res.questions ?? []).map((q) => ({
        slot: q.slot,
        number: q.number ?? q.slot,
        type: q.type ?? '',
        page: q.page ?? 0,
        html: q.html ?? '',
        ...(q.state ? { state: q.state } : {}),
      })),
    };
  }

  // แปลง raw attempt object จาก Moodle ให้เป็น QuizAttempt ที่ type ครบ
  private mapAttempt(a: RawAttempt): QuizAttempt {
    return {
      id: a.id,
      attempt: a.attempt ?? 0,
      state: a.state ?? 'unknown',
      sumgrades: a.sumgrades ?? null,
      timestart: a.timestart ?? 0,
      timefinish: a.timefinish ?? 0,
      currentpage: a.currentpage ?? 0,
    };
  }
}
