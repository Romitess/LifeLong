import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redactParams } from 'src/common/utils/redact.utils';
import { SectionOwnershipInfo } from './interfaces/moodle.interfaces';
import { getMoodleModuleTypeInfo } from './moodle-module-registry';

/** Minimal shape of a section from core_course_get_contents used by subsection sync. */
interface RawContentModule {
  id: number;
  modname: string;
  customdata?: string;
}

interface RawContentSection {
  id: number;
  section: number;
  name: string;
  component?: string | null;
  modules?: RawContentModule[];
}

@Injectable()
export class MoodleService {
  private readonly logger = new Logger(MoodleService.name);
  private readonly completionModuleCache = new Map<
    string,
    { expiresAt: number; ids: Promise<ReadonlySet<number>> }
  >();
  private readonly completionModuleCacheTtlMs = 60_000;

  constructor(private configService: ConfigService) {}

  /**
   * @param tokenOverride per-user WS token (native quiz/assign acting as the student).
   *   When omitted, the shared service `MOODLE_TOKEN` is used (sync/admin operations).
   */
  async callMoodleApi(
    wsfunction: string,
    params: URLSearchParams,
    tokenOverride?: string,
  ): Promise<unknown> {
    const moodleBaseUrl = this.configService.get<string>('MOODLE_BASE_URL');
    const moodleToken = tokenOverride || this.configService.get<string>('MOODLE_TOKEN');

    if (!moodleBaseUrl || !moodleToken) {
      throw new Error('Moodle configuration is missing.');
    }

    params.append('wstoken', moodleToken);
    params.append('wsfunction', wsfunction);
    params.append('moodlewsrestformat', 'json');

    this.logger.debug(
      `Calling Moodle API: ${wsfunction} with params: ${redactParams(params, ['wstoken', 'password'])}`,
    );
    const response = await fetch(`${moodleBaseUrl}/webservice/rest/server.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseText = await response.text();
    let logResponse = responseText;
    if (responseText.includes('"token"')) {
      try {
        const parsed = JSON.parse(responseText) as unknown;
        if (parsed && typeof parsed === 'object') {
          const cloned = { ...(parsed as Record<string, unknown>) };
          if ('token' in cloned) {
            cloned.token = '[REDACTED]';
          }
          logResponse = JSON.stringify(cloned);
        }
      } catch {
        logResponse = responseText.replace(/"token"\s*:\s*"[^"]*"/g, '"token":"[REDACTED]"');
      }
    }
    this.logger.debug(`Moodle Raw Response: ${logResponse}`);

    let data: unknown;
    try {
      let cleanedResponse = responseText.trim();
      // Start of the JSON payload. Include '"' so string-encoded responses
      // (e.g. core_courseformat_create_module returns "[...]") aren't corrupted
      // by stripping their leading quote.
      const indices = ['{', '[', '"']
        .map((ch) => cleanedResponse.indexOf(ch))
        .filter((i) => i !== -1);
      const jsonStart = indices.length > 0 ? Math.min(...indices) : -1;

      if (jsonStart > 0) {
        this.logger.warn(
          `Moodle response contained non-JSON prefix. Stripping characters before index ${jsonStart}.`,
        );
        cleanedResponse = cleanedResponse.substring(jsonStart);
      }

      data = JSON.parse(cleanedResponse) as unknown;
    } catch {
      throw new Error(`Moodle API returned invalid JSON: ${responseText}`);
    }

    if (data && typeof data === 'object' && 'exception' in data) {
      const moodleError = data as Record<string, unknown>;
      const errorMsg =
        (moodleError.message as string) ||
        (moodleError.exception as string) ||
        'Unknown Moodle Error';
      const errorCode = (moodleError.errorcode as string) || 'unknown';
      throw new Error(`Moodle API Exception [${errorCode}]: ${errorMsg}`);
    }

    return data;
  }

  /** Allowed Moodle origins for outbound file fetches (SSRF guard). */
  private getMoodleOrigins(): string[] {
    const origins: string[] = [];
    for (const key of ['MOODLE_BASE_URL', 'MOODLE_PUBLIC_URL']) {
      const value = this.configService.get<string>(key);
      if (!value) continue;
      try {
        origins.push(new URL(value).origin);
      } catch {
        // ignore malformed config
      }
    }
    return origins;
  }

  /** True only for a Moodle webservice pluginfile URL on a configured Moodle origin. */
  isMoodlePluginfileUrl(fileurl: string): boolean {
    if (!fileurl) return false;
    let target: URL;
    try {
      target = new URL(fileurl);
    } catch {
      return false;
    }
    if (!target.pathname.startsWith('/webservice/pluginfile.php/')) return false;
    return this.getMoodleOrigins().includes(target.origin);
  }

  /**
   * Fetch a Moodle pluginfile server-side with the webservice token attached.
   * The token never leaves the backend. Rejects any non-Moodle URL (SSRF guard)
   * and routes the request through the internal MOODLE_BASE_URL host.
   */
  async fetchPluginfile(fileurl: string): Promise<Response> {
    if (!this.isMoodlePluginfileUrl(fileurl)) {
      throw new Error('Refusing to fetch a non-Moodle file URL.');
    }
    const moodleToken = this.configService.get<string>('MOODLE_TOKEN');
    const moodleBaseUrl = this.configService.get<string>('MOODLE_BASE_URL');
    if (!moodleToken || !moodleBaseUrl) {
      throw new Error('Moodle configuration is missing.');
    }

    const target = new URL(fileurl);
    const internalBase = new URL(moodleBaseUrl);
    target.protocol = internalBase.protocol;
    target.host = internalBase.host;
    target.searchParams.set('token', moodleToken);

    return fetch(target.toString(), { method: 'GET' });
  }

  /**
   * Ensure the student is enrolled in the Moodle course (role 5) before per-user
   * WS calls — `mod_quiz_*` / `mod_assign_*` only return data for enrolled users.
   * Mirrors the SSO enrol path. Idempotent + cached; a welcome-mail failure
   * (no mailer in dev) surfaces as an exception but the enrolment still commits,
   * so it is swallowed.
   */
  private readonly enrolCache = new Set<string>();

  async ensureStudentEnrolled(username: string, moodleCourseId: number): Promise<void> {
    const key = `${username}:${moodleCourseId}`;
    if (this.enrolCache.has(key)) return;
    try {
      const userId = await this.getUserIdByUsername(username);
      if (!userId) return; // no Moodle account yet — nothing to enrol
      await this.enrolUserInCourse(moodleCourseId, userId, 5); // 5 = Student
      this.enrolCache.add(key);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`ensureStudentEnrolled(${username}, ${moodleCourseId}): ${msg}`);
      this.enrolCache.add(key); // enrolment commits despite welcome-mail failure
    }
  }

  // ลงทะเบียน user เข้าวิชา Moodle ด้วย role ที่กำหนด (3=ครู, 5=นักเรียน)
  async enrolUserInCourse(courseId: number, userId: number, roleId: number = 3): Promise<void> {
    const params = new URLSearchParams();
    params.append('enrolments[0][roleid]', roleId.toString());
    params.append('enrolments[0][userid]', userId.toString());
    params.append('enrolments[0][courseid]', courseId.toString());

    await this.callMoodleApi('enrol_manual_enrol_users', params);
  }

  // ถอน user ออกจากวิชา Moodle
  async unenrolUserFromCourse(courseId: number, userId: number): Promise<void> {
    const params = new URLSearchParams();
    params.append('enrolments[0][userid]', userId.toString());
    params.append('enrolments[0][courseid]', courseId.toString());

    await this.callMoodleApi('enrol_manual_unenrol_users', params);
  }

  // สร้าง one-time SSO login URL ให้ user (ผ่าน auth_userkey plugin) — ใช้ redirect ไปหน้า Moodle โดยไม่ต้องกรอก password
  async getMoodleLoginUrl(username: string): Promise<string> {
    const params = new URLSearchParams();
    params.append('user[username]', username);
    const result = await this.callMoodleApi('auth_userkey_request_login_url', params);
    return (result as { loginurl: string }).loginurl;
  }

  // ค้นหา Moodle user id จาก username; คืน null ถ้าไม่พบ
  async getUserIdByUsername(username: string): Promise<number | null> {
    const params = new URLSearchParams();
    params.append('criteria[0][key]', 'username');
    params.append('criteria[0][value]', username);

    const result = (await this.callMoodleApi('core_user_get_users', params)) as {
      users: { id: number }[];
    };
    if (result.users && result.users.length > 0) {
      return result.users[0].id;
    }
    return null;
  }

  // ค้นหา Moodle user id จาก email; คืน null ถ้าไม่พบ
  async getUserIdByEmail(email: string): Promise<number | null> {
    const params = new URLSearchParams();
    params.append('criteria[0][key]', 'email');
    params.append('criteria[0][value]', email);

    const result = (await this.callMoodleApi('core_user_get_users', params)) as {
      users: { id: number }[];
    };
    return result.users?.[0]?.id ?? null;
  }

  // ตรวจว่าวิชามี manual enrolment method หรือไม่ ถ้าไม่มีจะ warn ใน log (teacher assignment อาจล้มเหลว)
  async ensureManualEnrolInstance(moodleCourseId: number, courseCode: string): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('courseid', moodleCourseId.toString());
      const methods = (await this.callMoodleApi(
        'core_enrol_get_course_enrolment_methods',
        params,
      )) as { type: string }[];
      const hasManual = Array.isArray(methods) && methods.some((m) => m.type === 'manual');
      if (hasManual) {
        this.logger.log(
          `Manual enrol instance confirmed for Moodle course ${courseCode} (id=${moodleCourseId})`,
        );
      } else {
        this.logger.warn(
          `No manual enrol instance found for Moodle course ${courseCode} (id=${moodleCourseId}) — teacher assignment may fail`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`ensureManualEnrolInstance failed for course id=${moodleCourseId}: ${msg}`);
    }
  }

  // หา Moodle course id จาก shortname; คืน null ถ้าไม่พบ
  async getCourseMoodleIdByShortname(shortname: string): Promise<number | null> {
    const course = await this.getCourseByField('shortname', shortname);
    return course?.id ?? null;
  }

  // ดึงข้อมูล Moodle course โดยค้นหาจาก id หรือ shortname
  async getCourseByField(
    field: 'id' | 'shortname',
    value: string | number,
  ): Promise<{ id: number; shortname?: string; fullname?: string } | null> {
    const params = new URLSearchParams();
    params.append('field', field);
    params.append('value', String(value));

    const result = (await this.callMoodleApi('core_course_get_courses_by_field', params)) as {
      courses?: { id: number; shortname?: string; fullname?: string }[];
    };
    return result.courses?.[0] ?? null;
  }

  // อัปโหลดรูป thumbnail วิชาจาก URL ไปยัง Moodle (ผ่าน local_wstools plugin)
  async updateCourseImage(
    courseId: number,
    imageUrl: string,
    filename?: string,
  ): Promise<{ success: boolean; filename: string }> {
    const params = new URLSearchParams();
    params.append('courseid', courseId.toString());
    params.append('imageurl', imageUrl);
    if (filename) {
      params.append('filename', filename);
    }

    return (await this.callMoodleApi('local_wstools_update_course_image', params)) as {
      success: boolean;
      filename: string;
    };
  }

  // อัปเดต metadata วิชา (ชื่อ, shortname, คำอธิบาย, หมวดหมู่, วันเปิด-ปิด)
  async updateCourseMeta(
    moodleCourseId: number,
    fields: {
      fullname?: string;
      shortname?: string;
      summary?: string;
      categoryId?: string;
      startdate?: number;
      enddate?: number;
    },
  ): Promise<void> {
    const params = new URLSearchParams();
    params.append('courses[0][id]', moodleCourseId.toString());
    if (fields.fullname) params.append('courses[0][fullname]', fields.fullname);
    if (fields.shortname) params.append('courses[0][shortname]', fields.shortname);
    if (fields.summary !== undefined) {
      params.append('courses[0][summary]', fields.summary);
      params.append('courses[0][summaryformat]', '1');
    }
    if (fields.categoryId) params.append('courses[0][categoryid]', fields.categoryId);
    if (fields.startdate !== undefined)
      params.append('courses[0][startdate]', String(fields.startdate));
    if (fields.enddate !== undefined) params.append('courses[0][enddate]', String(fields.enddate));

    await this.callMoodleApi('core_course_update_courses', params);
    this.logger.log(`updateCourseMeta: updated Moodle course id=${moodleCourseId}`);
  }

  // เปิด/ปิดการมองเห็นวิชาใน Moodle (visible=true แสดงวิชา)
  async updateCourseVisibility(moodleCourseId: number, visible: boolean): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('courses[0][id]', moodleCourseId.toString());
      params.append('courses[0][visible]', visible ? '1' : '0');
      await this.callMoodleApi('core_course_update_courses', params);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `updateCourseVisibility failed for moodle course id=${moodleCourseId}: ${msg}`,
      );
    }
  }

  // อ่านทุก section พร้อมจำนวน module เพื่อตรวจว่า section ไหนครูเพิ่ม content แล้ว (ใช้ก่อน resync)
  async probeSectionOwnership(moodleCourseId: number): Promise<SectionOwnershipInfo[]> {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());

    const sections = (await this.callMoodleApi('core_course_get_contents', params)) as Array<{
      id: number;
      section: number;
      name: string;
      summary: string;
      component?: string | null;
      modules: Array<{ id: number; name: string; modname: string }>;
    }>;

    return sections.map((s) => ({
      sectionId: s.id,
      sectionNum: s.section,
      name: s.name,
      summary: s.summary ?? '',
      moduleCount: s.modules?.length ?? 0,
      hasTeacherContent: (s.modules?.length ?? 0) > 0,
      component: s.component ?? null,
    }));
  }

  // สร้าง URLSearchParams สำหรับ local_wstools_update_sections จากรายการบท
  private buildSectionParams(
    moodleCourseId: number,
    chapters: { name: string; hour?: number; typeName?: string; subchapters?: string[] }[],
  ): URLSearchParams {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    chapters.forEach((ch, i) => {
      params.append(`sections[${i}][num]`, String(i + 1));
      params.append(`sections[${i}][name]`, ch.name);

      const metaParts: string[] = [];
      if (ch.typeName) metaParts.push(`<strong>${ch.typeName}</strong>`);
      if (ch.hour != null) metaParts.push(`${ch.hour} ชม.`);
      const metaLine = metaParts.length > 0 ? `<p>${metaParts.join(' · ')}</p>` : '';
      // Subchapters are synced as Moodle subsections (see syncSubsections), no
      // longer embedded as a <ul> in the summary. Always set the summary so that
      // re-syncing a course migrated from the old bullet format clears the list.
      params.append(`sections[${i}][summary]`, metaLine);
    });
    return params;
  }

  /**
   * Sync each chapter's subchapters as Moodle subsections (mod_subsection) under
   * the chapter's section. Idempotent: matches existing subsections by position —
   * creating/deleting to match the count and renaming to match the subject. A
   * subsection that already holds teacher content is preserved (only renamed if
   * its position's subject changed). Replaces the old "summary <ul>" approach.
   */
  async syncSubsections(
    moodleCourseId: number,
    chapters: { subchapters?: string[] }[],
  ): Promise<void> {
    try {
      const format = await this.getCourseFormat(moodleCourseId);

      const existingByChapter = (
        sections: RawContentSection[],
      ): Map<number, Array<{ cmid: number; sectionId: number; name: string }>> => {
        const nameById = new Map<number, string>();
        sections
          .filter((s) => s.component === 'mod_subsection')
          .forEach((s) => nameById.set(s.id, s.name ?? ''));
        const map = new Map<number, Array<{ cmid: number; sectionId: number; name: string }>>();
        sections.forEach((s) => {
          const subs = (s.modules ?? [])
            .filter((m) => m.modname === 'subsection')
            .map((m) => {
              let sectionId = 0;
              try {
                const cd = JSON.parse(m.customdata ?? '{}') as { sectionid?: string | number };
                sectionId = Number(cd.sectionid) || 0;
              } catch {
                sectionId = 0;
              }
              return { cmid: m.id, sectionId, name: nameById.get(sectionId) ?? '' };
            })
            .filter((x) => x.sectionId > 0);
          map.set(s.section, subs);
        });
        return map;
      };

      const desiredFor = (i: number): string[] =>
        (chapters[i]?.subchapters ?? []).map((s) => (s ?? '').trim()).filter(Boolean);

      // Pass 1 — adjust counts (create missing / delete extras).
      let map = existingByChapter(await this.getCourseContents(moodleCourseId));
      for (let i = 0; i < chapters.length; i++) {
        const desired = desiredFor(i);
        const existing = map.get(i + 1) ?? [];
        for (let j = desired.length; j < existing.length; j++) {
          await this.deleteModule(existing[j].cmid);
        }
        for (let j = existing.length; j < desired.length; j++) {
          await this.createSubsection(moodleCourseId, i + 1);
        }
      }

      // Pass 2 — rename by position to match the subjects.
      map = existingByChapter(await this.getCourseContents(moodleCourseId));
      for (let i = 0; i < chapters.length; i++) {
        const desired = desiredFor(i);
        const existing = map.get(i + 1) ?? [];
        for (let j = 0; j < desired.length && j < existing.length; j++) {
          if (existing[j].name !== desired[j]) {
            await this.renameSection(format, existing[j].sectionId, desired[j]);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`syncSubsections failed for course id=${moodleCourseId}: ${msg}`);
      throw err;
    }
  }

  /**
   * One-shot migration of a course from the old summary-bullet format to subsections:
   * overwrite each section summary (drops the old <ul>) and create/rename subsections.
   * Errors propagate so the caller can report them.
   */
  async migrateCourseSubsections(
    moodleCourseId: number,
    chapters: { name: string; hour?: number; typeName?: string; subchapters?: string[] }[],
  ): Promise<void> {
    const params = this.buildSectionParams(moodleCourseId, chapters);
    await this.callMoodleApi('local_wstools_update_sections', params);
    await this.syncSubsections(moodleCourseId, chapters);
  }

  // ดึงทุก section และ module ในวิชาจาก core_course_get_contents
  private async getCourseContents(moodleCourseId: number): Promise<RawContentSection[]> {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    const res = await this.callMoodleApi('core_course_get_contents', params);
    return Array.isArray(res) ? (res as RawContentSection[]) : [];
  }

  // อ่าน format ของวิชา (เช่น 'topics') ที่ต้องใช้ตอนเรียก renameSection
  private async getCourseFormat(moodleCourseId: number): Promise<string> {
    const params = new URLSearchParams();
    params.append('field', 'id');
    params.append('value', moodleCourseId.toString());
    const res = (await this.callMoodleApi('core_course_get_courses_by_field', params)) as {
      courses?: Array<{ format?: string }>;
    };
    return res.courses?.[0]?.format ?? 'topics';
  }

  // สร้าง mod_subsection ใหม่ภายใน section ที่กำหนด
  private async createSubsection(moodleCourseId: number, targetSectionNum: number): Promise<void> {
    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    params.append('modname', 'subsection');
    params.append('targetsectionnum', targetSectionNum.toString());
    await this.callMoodleApi('core_courseformat_create_module', params);
  }

  // ลบ course module (cm) ด้วย id ที่กำหนด
  private async deleteModule(cmid: number): Promise<void> {
    const params = new URLSearchParams();
    params.append('cmids[0]', cmid.toString());
    await this.callMoodleApi('core_course_delete_modules', params);
  }

  // เปลี่ยนชื่อ section โดยใช้ core_update_inplace_editable (ต้องรู้ format ของวิชาก่อน)
  private async renameSection(format: string, sectionId: number, name: string): Promise<void> {
    const params = new URLSearchParams();
    params.append('component', `format_${format}`);
    params.append('itemtype', 'sectionname');
    params.append('itemid', sectionId.toString());
    params.append('value', name);
    await this.callMoodleApi('core_update_inplace_editable', params);
  }

  // sync บทเรียนครั้งแรก: สร้าง/ตั้งชื่อ section, ลบ section เกิน, สร้าง subsection
  async initialChapterSync(
    moodleCourseId: number,
    chapters: { name: string; hour?: number; typeName?: string; subchapters?: string[] }[],
  ): Promise<void> {
    if (chapters.length === 0) return;
    try {
      const params = this.buildSectionParams(moodleCourseId, chapters);
      await this.callMoodleApi('local_wstools_update_sections', params);
      await this.trimSections(moodleCourseId, chapters.length);
      await this.syncSubsections(moodleCourseId, chapters);
      this.logger.log(
        `initialChapterSync: synced ${chapters.length} chapter(s) to Moodle course id=${moodleCourseId}`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`initialChapterSync failed for course id=${moodleCourseId}: ${msg}`);
    }
  }

  // sync บทซ้ำโดยข้าม section ที่ครูมี content อยู่แล้ว และลบ section ว่างที่เกิน
  async resyncChapters(
    moodleCourseId: number,
    chapters: { name: string; hour?: number; typeName?: string; subchapters?: string[] }[],
  ): Promise<void> {
    if (chapters.length === 0) return;
    try {
      const ownership = await this.probeSectionOwnership(moodleCourseId);
      const ownershipBySectionNum = new Map(ownership.map((s) => [s.sectionNum, s]));

      const safeChapters = chapters.filter((_ch, i) => {
        const sectionNum = i + 1;
        const info = ownershipBySectionNum.get(sectionNum);
        if (info?.hasTeacherContent) {
          this.logger.warn(
            `resyncChapters: skipped section ${sectionNum} of course id=${moodleCourseId} — has teacher content (moduleCount=${info.moduleCount})`,
          );
          return false;
        }
        return true;
      });

      if (safeChapters.length > 0) {
        const params = this.buildSectionParams(moodleCourseId, safeChapters);
        await this.callMoodleApi('local_wstools_update_sections', params);
        // ไม่ trim sections ตอน re-sync เพื่อไม่ให้ลบ section ที่ครูเพิ่มเอง
        this.logger.log(
          `resyncChapters: synced ${safeChapters.length}/${chapters.length} chapter(s) to Moodle course id=${moodleCourseId}`,
        );
      } else {
        this.logger.warn(
          `resyncChapters: all sections skipped for course id=${moodleCourseId} — all have teacher content`,
        );
      }

      // Delete orphaned empty sections (sectionNum > chapters.length, no teacher content).
      // Never delete subsection delegate sections here — they are managed by syncSubsections.
      const orphanedNums = ownership
        .filter(
          (s) =>
            s.sectionNum > chapters.length &&
            !s.hasTeacherContent &&
            s.component !== 'mod_subsection',
        )
        .map((s) => s.sectionNum);
      if (orphanedNums.length > 0) {
        await this.deleteEmptySections(moodleCourseId, orphanedNums);
      }

      await this.syncSubsections(moodleCourseId, chapters);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`resyncChapters failed for course id=${moodleCourseId}: ${msg}`);
    }
  }

  // ลบ section ที่ระบุหาก section นั้นว่าง (ผ่าน local_wstools plugin)
  async deleteEmptySections(moodleCourseId: number, sectionNums: number[]): Promise<void> {
    if (sectionNums.length === 0) return;
    try {
      const params = new URLSearchParams();
      params.append('courseid', moodleCourseId.toString());
      sectionNums.forEach((n, i) => params.append(`section_nums[${i}]`, String(n)));

      const result = (await this.callMoodleApi('local_wstools_delete_empty_sections', params)) as {
        deleted: number;
        skipped: number;
      };
      this.logger.log(
        `deleteEmptySections: deleted=${result.deleted} skipped=${result.skipped} for course id=${moodleCourseId}`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`deleteEmptySections failed for course id=${moodleCourseId}: ${msg}`);
    }
  }

  // ลบทุก section ที่เกิน keepnum (ใช้หลัง initialChapterSync เพื่อลบ section default ของ Moodle)
  async trimSections(moodleCourseId: number, keepnum: number): Promise<void> {
    try {
      const params = new URLSearchParams();
      params.append('courseid', moodleCourseId.toString());
      params.append('keepnum', String(keepnum));
      const result = (await this.callMoodleApi('local_wstools_trim_sections', params)) as {
        deleted: number;
      };
      if (result.deleted > 0) {
        this.logger.log(
          `Trimmed ${result.deleted} extra section(s) from Moodle course id=${moodleCourseId}`,
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`trimSections failed for course id=${moodleCourseId}: ${msg}`);
    }
  }

  // นับจำนวน quiz/assign ที่ user ทำเสร็จแล้วในวิชา (ใช้แสดง progress bar ของวิชา)
  async getActivityCompletionStatus(
    moodleCourseId: number,
    moodleUserId: number,
    userToken: string,
  ): Promise<{ total: number; done: number }> {
    const COUNTED_MODULES = ['assign', 'quiz'];
    const countableModuleIds = await this.getCountableCompletionModuleIds(
      moodleCourseId,
      COUNTED_MODULES,
    );

    if (countableModuleIds.size === 0) {
      return { total: 0, done: 0 };
    }

    const params = new URLSearchParams();
    params.append('courseid', moodleCourseId.toString());
    params.append('userid', moodleUserId.toString());
    const result = (await this.callMoodleApi(
      'core_completion_get_activities_completion_status',
      params,
      userToken,
    )) as { statuses?: Array<{ cmid?: number; id?: number; state: number; modname: string }> };
    const statuses = (result.statuses ?? []).filter((status) => {
      const cmid = Number(status.cmid ?? status.id ?? 0);
      return COUNTED_MODULES.includes(status.modname) && countableModuleIds.has(cmid);
    });

    return {
      total: countableModuleIds.size,
      done: Math.min(
        statuses.filter((status) => status.state >= 1).length,
        countableModuleIds.size,
      ),
    };
  }

  private async getCountableCompletionModuleIds(
    moodleCourseId: number,
    countedModules: string[],
  ): Promise<ReadonlySet<number>> {
    const cacheKey = `${moodleCourseId}:${[...countedModules].sort().join(',')}`;
    const now = Date.now();
    const cached = this.completionModuleCache.get(cacheKey);
    if (cached && cached.expiresAt > now) return cached.ids;

    const ids = this.loadCountableCompletionModuleIds(moodleCourseId, countedModules);
    this.completionModuleCache.set(cacheKey, {
      expiresAt: now + this.completionModuleCacheTtlMs,
      ids,
    });
    try {
      return await ids;
    } catch (error) {
      if (this.completionModuleCache.get(cacheKey)?.ids === ids) {
        this.completionModuleCache.delete(cacheKey);
      }
      throw error;
    }
  }

  private async loadCountableCompletionModuleIds(
    moodleCourseId: number,
    countedModules: string[],
  ): Promise<ReadonlySet<number>> {
    const sections = await this.getCourseContents(moodleCourseId);
    const ids = new Set<number>();

    sections.forEach((section) => {
      (section.modules ?? []).forEach((module) => {
        if (!countedModules.includes(module.modname)) return;
        if (getMoodleModuleTypeInfo(module.modname).decision === 'skip') return;
        ids.add(Number(module.id));
      });
    });

    return ids;
  }

  /**
   * Returns the Moodle activity completion state for a specific cmid as seen by
   * the student (uses their per-user WS token). Returns 0 if unavailable / error.
   * State values: 0 = incomplete, 1 = complete, 2 = complete_pass, 3 = complete_fail.
   */
  async getActivityCompletionState(
    moodleCourseId: number,
    cmid: number,
    userToken: string,
  ): Promise<number> {
    try {
      // core_completion_get_activities_completion_status requires explicit userid
      const siteInfo = (await this.callMoodleApi(
        'core_webservice_get_site_info',
        new URLSearchParams(),
        userToken,
      )) as { userid?: number };
      if (!siteInfo.userid) return 0;

      const params = new URLSearchParams();
      params.append('courseid', moodleCourseId.toString());
      params.append('userid', siteInfo.userid.toString());
      const result = (await this.callMoodleApi(
        'core_completion_get_activities_completion_status',
        params,
        userToken,
      )) as { statuses?: Array<{ cmid: number; state: number }> };
      return (result.statuses ?? []).find((s) => s.cmid === cmid)?.state ?? 0;
    } catch (err: unknown) {
      this.logger.warn(
        `getActivityCompletionState failed (courseId=${moodleCourseId}, cmid=${cmid}): ${err instanceof Error ? err.message : String(err)}`,
      );
      return 0;
    }
  }

  // สร้างหรืออัปเดต category หลักใน Moodle; คืน Moodle category id
  async syncCategoryToMoodle(name: string, lmsId: number | null): Promise<number> {
    if (lmsId !== null) {
      const params = new URLSearchParams();
      params.append('categories[0][id]', lmsId.toString());
      params.append('categories[0][name]', name);
      await this.callMoodleApi('core_course_update_categories', params);
      return lmsId;
    }
    const params = new URLSearchParams();
    params.append('categories[0][name]', name);
    params.append('categories[0][parent]', '0');
    const result = (await this.callMoodleApi('core_course_create_categories', params)) as {
      id: number;
      name: string;
    }[];
    return result[0].id;
  }

  // สร้างหรืออัปเดต sub-category ภายใต้ parentLmsId; คืน Moodle category id
  async syncSubcategoryToMoodle(
    name: string,
    parentLmsId: number,
    lmsId: number | null,
  ): Promise<number> {
    if (lmsId !== null) {
      const params = new URLSearchParams();
      params.append('categories[0][id]', lmsId.toString());
      params.append('categories[0][name]', name);
      params.append('categories[0][parent]', parentLmsId.toString());
      await this.callMoodleApi('core_course_update_categories', params);
      return lmsId;
    }
    const params = new URLSearchParams();
    params.append('categories[0][name]', name);
    params.append('categories[0][parent]', parentLmsId.toString());
    const result = (await this.callMoodleApi('core_course_create_categories', params)) as {
      id: number;
      name: string;
    }[];
    return result[0].id;
  }
}
