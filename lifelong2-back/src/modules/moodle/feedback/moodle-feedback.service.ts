import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MoodleService } from '../moodle.service';
import { MoodleUserTokenService } from '../moodle-user-token.service';
import { MoodleFileProxyService } from '../moodle-file-proxy.service';

export interface FeedbackInfo {
  id: number;
  coursemodule: number;
  name: string;
  intro: string | null;
  anonymous: number;
  multipleSubmit: boolean;
  completed: boolean;
  canSubmit: boolean;
}

export interface FeedbackItemOption {
  value: string;
  label: string;
}

export interface FeedbackItem {
  id: number;
  typ: string;
  name: string;
  label: string | null;
  required: boolean;
  presentation: string;
  value: string | null;
  options: FeedbackItemOption[];
}

export interface FeedbackPage {
  page: number;
  hasNextPage: boolean;
  items: FeedbackItem[];
}

interface RawFeedback {
  id: number;
  coursemodule: number;
  name?: string;
  intro?: string;
  anonymous?: number;
  multiple_submit?: number;
}

interface RawFeedbackItem {
  id: number;
  typ?: string;
  name?: string;
  label?: string;
  required?: number | boolean;
  presentation?: string;
  value?: string | number | null;
}

@Injectable()
export class MoodleFeedbackService {
  constructor(
    private readonly moodleService: MoodleService,
    private readonly tokenService: MoodleUserTokenService,
    private readonly fileProxy: MoodleFileProxyService,
  ) {}

  // ดึง per-user token ของนักเรียนจาก username
  private tokenFor(username: string): Promise<string> {
    return this.tokenService.getTokenForUsername(username);
  }

  // โหลดข้อมูล feedback activity พร้อมหน้าแรกของคำถาม
  async getFeedback(
    username: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<{ feedback: FeedbackInfo; page: FeedbackPage }> {
    await this.moodleService.ensureStudentEnrolled(username, moodleCourseId);
    const token = await this.tokenFor(username);

    const feedback = await this.findFeedback(token, moodleCourseId, moduleId);
    const access = await this.getAccessInformation(token, feedback.id);
    const completed = await this.hasCompleted(token, feedback.id);
    const canSubmit = !completed && this.canSubmit(access);

    if (canSubmit) {
      await this.launchFeedback(token, feedback.id);
    }

    return {
      feedback: {
        id: feedback.id,
        coursemodule: feedback.coursemodule,
        name: feedback.name ?? '',
        intro: feedback.intro ? this.fileProxy.rewriteEmbeddedFileUrls(feedback.intro) : null,
        anonymous: feedback.anonymous ?? 0,
        multipleSubmit: feedback.multiple_submit === 1,
        completed,
        canSubmit,
      },
      page: canSubmit ? await this.getPage(token, feedback.id, 0) : this.emptyPage(0),
    };
  }

  // ส่งคำตอบของหน้านี้; คืนหน้าถัดไปหรือบอกว่าทำเสร็จแล้ว
  async processPage(
    username: string,
    feedbackId: number,
    page: number,
    responses: Array<{ name: string; value: string }>,
  ): Promise<{ completed: boolean; page: FeedbackPage | null }> {
    const token = await this.tokenFor(username);
    const params = new URLSearchParams();
    params.append('feedbackid', feedbackId.toString());
    params.append('page', page.toString());
    responses.forEach((response, index) => {
      params.append(`responses[${index}][name]`, response.name);
      params.append(`responses[${index}][value]`, response.value);
    });

    const result = (await this.moodleService.callMoodleApi(
      'mod_feedback_process_page',
      params,
      token,
    )) as {
      completed?: boolean;
      jumpto?: number;
      page?: number;
      warnings?: Array<{ message?: string }>;
    };

    const warning = result?.warnings?.[0]?.message;
    if (warning) throw new BadRequestException(warning);

    const completed = result?.completed === true || result?.jumpto === 0;
    if (completed) return { completed: true, page: null };

    const nextPage = Number(result?.page ?? result?.jumpto ?? page + 1);
    return { completed: false, page: await this.getPage(token, feedbackId, nextPage) };
  }

  // ค้นหา feedback activity ในวิชาจาก cmid
  private async findFeedback(
    token: string,
    moodleCourseId: number,
    moduleId: number,
  ): Promise<RawFeedback> {
    const params = new URLSearchParams();
    params.append('courseids[0]', moodleCourseId.toString());
    const result = (await this.moodleService.callMoodleApi(
      'mod_feedback_get_feedbacks_by_courses',
      params,
      token,
    )) as { feedbacks?: RawFeedback[] };

    const feedback = (result.feedbacks ?? []).find((item) => item.coursemodule === moduleId);
    if (!feedback) {
      throw new NotFoundException(`ไม่พบแบบสอบถาม (module ${moduleId}) ในวิชา ${moodleCourseId}`);
    }
    return feedback;
  }

  // ดึง access flags (cansubmit, cancomplete ฯลฯ) จาก Moodle
  private async getAccessInformation(
    token: string,
    feedbackId: number,
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams();
    params.append('feedbackid', feedbackId.toString());
    return (await this.moodleService.callMoodleApi(
      'mod_feedback_get_feedback_access_information',
      params,
      token,
    )) as Record<string, unknown>;
  }

  // แปล access flags ว่า นักเรียนยังส่งได้อยู่หรือไม่
  private canSubmit(access: Record<string, unknown>): boolean {
    if (access.cancomplete !== undefined) return access.cancomplete === true;
    if (access.canviewanalysis !== undefined && access.cansubmit === undefined) return true;
    return access.cansubmit !== false;
  }

  // ตรวจว่านักเรียนทำ feedback นี้เสร็จแล้วหรือยัง
  private async hasCompleted(token: string, feedbackId: number): Promise<boolean> {
    const params = new URLSearchParams();
    params.append('feedbackid', feedbackId.toString());
    const result = (await this.moodleService.callMoodleApi(
      'mod_feedback_get_last_completed',
      params,
      token,
    )) as { completed?: { id?: number } | false | null };
    return !!(result?.completed && typeof result.completed === 'object' && result.completed.id);
  }

  // เริ่ม feedback session ใน Moodle (จำเป็นก่อนดึงหน้าคำถาม)
  private async launchFeedback(token: string, feedbackId: number): Promise<void> {
    const params = new URLSearchParams();
    params.append('feedbackid', feedbackId.toString());
    await this.moodleService.callMoodleApi('mod_feedback_launch_feedback', params, token);
  }

  // ดึง items ของหน้าที่กำหนดจาก Moodle
  private async getPage(token: string, feedbackId: number, page: number): Promise<FeedbackPage> {
    const params = new URLSearchParams();
    params.append('feedbackid', feedbackId.toString());
    params.append('page', page.toString());
    const result = (await this.moodleService.callMoodleApi(
      'mod_feedback_get_page_items',
      params,
      token,
    )) as { items?: RawFeedbackItem[]; hasnextpage?: boolean };

    return {
      page,
      hasNextPage: result?.hasnextpage === true,
      items: (result?.items ?? []).map((item) => this.mapItem(item)),
    };
  }

  // คืน empty page placeholder เมื่อนักเรียนทำ feedback เสร็จแล้ว
  private emptyPage(page: number): FeedbackPage {
    return { page, hasNextPage: false, items: [] };
  }

  // แปลง raw feedback item จาก Moodle ให้เป็น FeedbackItem shape ของ app
  private mapItem(item: RawFeedbackItem): FeedbackItem {
    const presentation = item.presentation ?? '';
    return {
      id: item.id,
      typ: item.typ ?? '',
      name: item.name ?? '',
      label: item.label ?? null,
      required: item.required === true || item.required === 1,
      presentation,
      value: item.value == null ? null : String(item.value),
      options: this.parseOptions(presentation),
    };
  }

  // แปลง presentation string (pipe/newline คั่น) ของ Moodle เป็น array ของ {value, label}
  private parseOptions(presentation: string): FeedbackItemOption[] {
    return presentation
      .split(/\r?\n|\|/)
      .map((part) => part.trim())
      .filter((part) => part && !/^[dhvrc]>>>>>$/i.test(part))
      .map((part, index) => ({
        value: String(index + 1),
        label: part.replace(/^[^>]*>>>>>\s*/, ''),
      }));
  }
}
