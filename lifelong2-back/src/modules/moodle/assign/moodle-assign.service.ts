import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MoodleService } from '../moodle.service';
import { MoodleUserTokenService } from '../moodle-user-token.service';
import { MoodleFileProxyService } from '../moodle-file-proxy.service';

export interface AssignFile {
  filename: string;
  fileurl: string;
  mimetype: string | null;
}

export interface AssignInfo {
  id: number;
  cmid: number;
  name: string;
  intro: string | null;
  introAttachments: AssignFile[];
  duedate: number;
  cutoffdate: number;
  grade: number | null;
  submissionDrafts: boolean;
  noSubmissions: boolean;
  textSubmission: boolean;
  fileSubmission: boolean;
}

export interface AssignSubmission {
  status: string; // new | draft | submitted | reopened
  gradingStatus: string;
  canEdit: boolean;
  canSubmit: boolean;
  onlineText: string | null;
  files: AssignFile[];
  grade: number | null;
  feedback: string | null;
}

interface RawAssignFile {
  filename?: string;
  fileurl?: string;
  mimetype?: string;
}
interface RawPlugin {
  type?: string;
  editorfields?: { text?: string }[];
  fileareas?: { files?: RawAssignFile[] }[];
}
interface RawAssignment {
  id: number;
  cmid: number;
  name?: string;
  intro?: string;
  introattachments?: RawAssignFile[];
  duedate?: number;
  cutoffdate?: number;
  grade?: number;
  submissiondrafts?: number;
  nosubmissions?: number;
  configs?: { plugin?: string; subtype?: string; name?: string; value?: string }[];
}

/**
 * Native Moodle assignment flow, run with the student's own per-user WS token so
 * submissions are correctly attributed. File uploads are forwarded server-side to
 * Moodle's webservice/upload.php (token never reaches the client).
 */
@Injectable()
export class MoodleAssignService {
  private readonly logger = new Logger(MoodleAssignService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly moodleService: MoodleService,
    private readonly tokenService: MoodleUserTokenService,
    private readonly fileProxy: MoodleFileProxyService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  // ดึง per-user token ของนักเรียนจาก username
  private tokenFor(username: string): Promise<string> {
    return this.tokenService.getTokenForUsername(username);
  }

  // แปลงไฟล์ดิบจาก Moodle ให้เป็น AssignFile และเปลี่ยน URL เป็น signed proxy URL
  private mapFile = (f: RawAssignFile): AssignFile => ({
    filename: f.filename ?? '',
    fileurl: this.fileProxy.toProxyUrl(f.fileurl ?? ''),
    mimetype: f.mimetype ?? null,
  });

  /** Assignment metadata (matched by cmid) + the user's current submission status. */
  async getAssignment(
    username: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<{ assign: AssignInfo; submission: AssignSubmission }> {
    // Native assign needs the student enrolled in Moodle (per-user token only sees
    // enrolled courses); enrol on access, mirroring the SSO flow.
    await this.moodleService.ensureStudentEnrolled(username, moodleCourseId);
    const token = await this.tokenFor(username);

    const listParams = new URLSearchParams();
    listParams.append('courseids[0]', moodleCourseId.toString());
    const list = (await this.moodleService.callMoodleApi(
      'mod_assign_get_assignments',
      listParams,
      token,
    )) as { courses?: { assignments?: RawAssignment[] }[] };

    const raw = (list?.courses ?? [])
      .flatMap((c) => c.assignments ?? [])
      .find((a) => a.cmid === moduleId);
    if (!raw) {
      throw new NotFoundException(`ไม่พบงาน (module ${moduleId}) ในวิชา ${moodleCourseId}`);
    }

    const cfg = (subtype: string, plugin: string): boolean =>
      (raw.configs ?? []).some(
        (c) =>
          c.subtype === subtype && c.plugin === plugin && c.name === 'enabled' && c.value === '1',
      );

    const assign: AssignInfo = {
      id: raw.id,
      cmid: raw.cmid,
      name: raw.name ?? '',
      intro: raw.intro ? this.fileProxy.rewriteEmbeddedFileUrls(raw.intro) : null,
      introAttachments: (raw.introattachments ?? []).map(this.mapFile),
      duedate: raw.duedate ?? 0,
      cutoffdate: raw.cutoffdate ?? 0,
      grade: raw.grade ?? null,
      submissionDrafts: raw.submissiondrafts === 1,
      noSubmissions: raw.nosubmissions === 1,
      textSubmission: cfg('assignsubmission', 'onlinetext'),
      fileSubmission: cfg('assignsubmission', 'file'),
    };

    return { assign, submission: await this.getStatus(token, raw.id) };
  }

  // ดึงสถานะการส่งงานและเกรดปัจจุบันของนักเรียนจาก Moodle
  private async getStatus(token: string, assignId: number): Promise<AssignSubmission> {
    const params = new URLSearchParams();
    params.append('assignid', assignId.toString());
    const res = (await this.moodleService.callMoodleApi(
      'mod_assign_get_submission_status',
      params,
      token,
    )) as {
      lastattempt?: {
        submission?: { status?: string; plugins?: RawPlugin[] };
        canedit?: boolean;
        cansubmit?: boolean;
        gradingstatus?: string;
      };
      feedback?: { grade?: { grade?: string | number }; plugins?: RawPlugin[] };
      gradingstatus?: string;
    };

    const last = res?.lastattempt;
    const plugins = last?.submission?.plugins ?? [];
    const onlinePlugin = plugins.find((p) => p.type === 'onlinetext');
    const filePlugin = plugins.find((p) => p.type === 'file');

    const onlineText = onlinePlugin?.editorfields?.[0]?.text ?? null;
    const files = (filePlugin?.fileareas?.[0]?.files ?? []).map(this.mapFile);

    const rawGrade = res?.feedback?.grade?.grade;
    const gradeNum = rawGrade == null ? null : Number(rawGrade);
    const feedbackHtml = (res?.feedback?.plugins ?? []).find((p) => p.type === 'comments')
      ?.editorfields?.[0]?.text;

    return {
      status: last?.submission?.status ?? 'new',
      gradingStatus: last?.gradingstatus ?? res?.gradingstatus ?? 'notgraded',
      canEdit: last?.canedit ?? false,
      canSubmit: last?.cansubmit ?? false,
      onlineText: onlineText ? this.fileProxy.rewriteEmbeddedFileUrls(onlineText) : null,
      files,
      grade: gradeNum != null && !Number.isNaN(gradeNum) ? gradeNum : null,
      feedback: feedbackHtml ? this.fileProxy.rewriteEmbeddedFileUrls(feedbackHtml) : null,
    };
  }

  /** Forward a file to the user's Moodle draft area; returns the draft itemid. */
  async uploadDraftFile(
    username: string,
    file: { buffer: Buffer; originalname: string; mimetype: string },
  ): Promise<{ itemid: number }> {
    const token = await this.tokenFor(username);
    const base = this.configService.get<string>('MOODLE_BASE_URL');
    if (!base) throw new BadRequestException('Moodle configuration is missing.');

    const form = new FormData();
    form.append(
      'file_1',
      new Blob([new Uint8Array(file.buffer)], {
        type: file.mimetype || 'application/octet-stream',
      }),
      file.originalname,
    );

    const res = await fetch(`${base.replace(/\/+$/, '')}/webservice/upload.php?token=${token}`, {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as Array<{ itemid?: number }> | { error?: string };

    if (Array.isArray(data) && data[0]?.itemid != null) {
      return { itemid: data[0].itemid };
    }
    const message = !Array.isArray(data) && data.error ? data.error : 'อัปโหลดไฟล์ไม่สำเร็จ';
    throw new BadRequestException(message);
  }

  /**
   * Save the submission (online text and/or an uploaded file draft) and, when the
   * assignment uses drafts, submit it for grading. Returns the refreshed status.
   * When submit=true and moodleCourseId/cmid/enrollId/subChapterId are provided,
   * checks Moodle activity completion state and auto-marks the subchapter complete.
   */
  async saveSubmission(
    username: string,
    assignId: number,
    payload: {
      onlineText?: string;
      fileItemId?: number;
      submit?: boolean;
      moodleCourseId?: number;
      cmid?: number;
      enrollId?: number;
      subChapterId?: number;
    },
  ): Promise<{ submission: AssignSubmission; autoMarked: boolean; passed: boolean }> {
    const token = await this.tokenFor(username);

    const params = new URLSearchParams();
    params.append('assignmentid', assignId.toString());
    if (payload.onlineText !== undefined) {
      params.append('plugindata[onlinetext_editor][text]', payload.onlineText);
      params.append('plugindata[onlinetext_editor][format]', '1');
      params.append('plugindata[onlinetext_editor][itemid]', '0');
    }
    if (payload.fileItemId != null) {
      params.append('plugindata[files_filemanager]', payload.fileItemId.toString());
    }
    const saveResult = (await this.moodleService.callMoodleApi(
      'mod_assign_save_submission',
      params,
      token,
    )) as Array<{ item?: string; message?: string }>;
    // save_submission returns [] on success, or an array of validation errors.
    if (Array.isArray(saveResult) && saveResult.length > 0) {
      throw new BadRequestException(saveResult[0]?.message ?? 'บันทึกงานไม่สำเร็จ');
    }

    // When drafts are enabled, a separate submit step finalises the submission.
    // (Harmless no-op warning when drafts are off — Moodle returns warnings, not an exception.)
    if (payload.submit) {
      const submitParams = new URLSearchParams();
      submitParams.append('assignmentid', assignId.toString());
      submitParams.append('acceptsubmissionstatement', '1');
      await this.moodleService.callMoodleApi('mod_assign_submit_for_grading', submitParams, token);
    }

    let autoMarked = false;
    let passed = false;
    if (payload.submit && payload.moodleCourseId != null && payload.cmid != null) {
      try {
        const state = await this.moodleService.getActivityCompletionState(
          payload.moodleCourseId,
          payload.cmid,
          token,
        );
        passed = state >= 1 && state !== 3;
        if (passed && payload.enrollId != null) {
          const ids: number[] =
            payload.subChapterId != null
              ? [payload.subChapterId]
              : await this.resolveSubChapterIds(
                  payload.moodleCourseId,
                  payload.cmid,
                  payload.enrollId,
                );
          for (const id of ids) {
            await this.dataSource.query(
              `INSERT INTO LLTPROGRESS (ENROLL_ID, COSESUBCHAP_ID, PROGRESS_STATUS, PROGRESS_DATE, CREATEDATE, UPDATEDATE)
               VALUES (?, ?, 'completed', NOW(), NOW(), NOW())
               ON DUPLICATE KEY UPDATE PROGRESS_STATUS = 'completed', PROGRESS_DATE = NOW(), UPDATEDATE = NOW()`,
              [payload.enrollId, id],
            );
          }
          if (ids.length > 0) autoMarked = true;
        }
      } catch (err: unknown) {
        this.logger.warn(
          `saveSubmission auto-mark failed (enrollId=${payload.enrollId}, subChapterId=${payload.subChapterId}): ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    return { submission: await this.getStatus(token, assignId), autoMarked, passed };
  }

  // แปลง Moodle cmid → COSESUBCHAP_ID ในฐานข้อมูล LLL เพื่อ mark completion อัตโนมัติ
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
}
