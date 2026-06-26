import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';
import { createPool, type Pool, type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import { MoodleService } from './moodle.service';

/**
 * Mints/reads a per-user Moodle Web Service token so native quiz/assign actions
 * are attributed to the actual student (not the shared service account).
 *
 * Why direct Moodle DB access: Moodle exposes no core WS to create a token for an
 * arbitrary user without their password. Token rows are non-runtime auth metadata,
 * the write is idempotent (one token per user+service) and verified the moment the
 * token is used against a WS call. Prerequisites configured on the Moodle side:
 *   - `webservice/rest:use` granted to the authenticated-user role
 *   - the external service has restrictedusers=0 and download/upload files enabled
 *   - the student is enrolled in the course (gives mod/quiz:attempt etc.)
 *
 * ⚠ Production note: prefer a Moodle local-plugin WS (e.g. local_wstools) to mint
 * tokens instead of a direct DB connection once such a function exists.
 */
@Injectable()
export class MoodleUserTokenService {
  private readonly logger = new Logger(MoodleUserTokenService.name);
  private pool: Pool | null = null;
  /** moodleUserId → token (avoids re-querying the Moodle DB on every WS call). */
  private readonly tokenCache = new Map<number, string>();

  constructor(
    private readonly configService: ConfigService,
    private readonly moodleService: MoodleService,
  ) {}

  // อ่าน MOODLE_WS_SERVICE_ID จาก config (default 4)
  private getServiceId(): number {
    return Number(this.configService.get<number>('MOODLE_WS_SERVICE_ID') ?? 4);
  }

  // อ่าน MOODLE_WS_CREATOR_ID จาก config (default 2 คือ admin user ของ Moodle)
  private getCreatorId(): number {
    return Number(this.configService.get<number>('MOODLE_WS_CREATOR_ID') ?? 2);
  }

  // สร้าง MySQL2 connection pool ไปยัง Moodle DB แบบ lazy (ถ้ายังไม่มี)
  private getPool(): Pool {
    if (this.pool) return this.pool;

    const host = this.configService.get<string>('MOODLE_DB_HOST');
    const user = this.configService.get<string>('MOODLE_DB_USER');
    const database = this.configService.get<string>('MOODLE_DB_NAME');
    if (!host || !user || !database) {
      throw new Error('Per-user Moodle token is not configured (set MOODLE_DB_HOST/USER/NAME).');
    }

    this.pool = createPool({
      host,
      port: Number(this.configService.get<number>('MOODLE_DB_PORT') ?? 3306),
      user,
      password: this.configService.get<string>('MOODLE_DB_PASSWORD') ?? '',
      database,
      connectionLimit: 4,
      waitForConnections: true,
    });
    return this.pool;
  }

  /** Resolve the student's Moodle user id, then return their personal WS token. */
  async getTokenForUsername(username: string): Promise<string> {
    const moodleUserId = await this.moodleService.getUserIdByUsername(username);
    if (!moodleUserId) {
      throw new Error(`ไม่พบผู้ใช้ "${username}" ใน Moodle`);
    }
    return this.getTokenForMoodleUserId(moodleUserId);
  }

  // คืน true เฉพาะเมื่อตั้งค่า env vars ของ Moodle DB ครบ (HOST/USER/NAME)
  private isDbConfigured(): boolean {
    return (
      !!this.configService.get<string>('MOODLE_DB_HOST') &&
      !!this.configService.get<string>('MOODLE_DB_USER') &&
      !!this.configService.get<string>('MOODLE_DB_NAME')
    );
  }

  /**
   * Idempotent: return the per-user token.
   * Preferred path = the `local_usertoken` Moodle plugin WS (token minted via the
   * Moodle core token API, capability-gated). Falls back to a direct DB mint only
   * if the plugin WS is unavailable AND a Moodle DB connection is configured —
   * the fallback exists for migration and should be removed for production.
   */
  async getTokenForMoodleUserId(moodleUserId: number): Promise<string> {
    const cached = this.tokenCache.get(moodleUserId);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      params.append('userid', moodleUserId.toString());
      const res = (await this.moodleService.callMoodleApi(
        'local_usertoken_get_user_token',
        params,
      )) as { token?: string };
      if (res?.token) {
        this.tokenCache.set(moodleUserId, res.token);
        return res.token;
      }
      throw new Error('local_usertoken returned no token');
    } catch (e) {
      if (!this.isDbConfigured()) throw e;
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`local_usertoken WS unavailable; falling back to direct DB mint: ${msg}`);
      return this.mintViaDb(moodleUserId);
    }
  }

  /**
   * Reads the "Grade to pass" threshold for a quiz from the Moodle grade items table.
   * Returns null if not configured or if the Moodle DB is unavailable.
   */
  async getQuizGradepass(quizInstanceId: number): Promise<number | null> {
    if (!this.isDbConfigured()) return null;
    try {
      const pool = this.getPool();
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT gradepass FROM mdl_grade_items
         WHERE itemmodule = 'quiz' AND iteminstance = ? AND gradepass > 0 LIMIT 1`,
        [quizInstanceId],
      );
      const val = rows[0]?.gradepass as number | undefined;
      return val != null && val > 0 ? val : null;
    } catch {
      return null;
    }
  }

  /** @deprecated Migration fallback — direct DB mint when the plugin WS is unavailable. */
  private async mintViaDb(moodleUserId: number): Promise<string> {
    const pool = this.getPool();
    const serviceId = this.getServiceId();

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT token FROM mdl_external_tokens WHERE userid = ? AND externalserviceid = ? AND tokentype = 0 ORDER BY id DESC LIMIT 1',
      [moodleUserId, serviceId],
    );
    const existing = rows[0]?.token as string | undefined;
    if (existing) {
      this.tokenCache.set(moodleUserId, existing);
      return existing;
    }

    const token = randomBytes(16).toString('hex'); // 32 hex chars, like Moodle tokens
    const now = Math.floor(Date.now() / 1000);
    await pool.query<ResultSetHeader>(
      `INSERT INTO mdl_external_tokens
         (token, tokentype, userid, externalserviceid, contextid, creatorid, validuntil, timecreated, name)
       VALUES (?, 0, ?, ?, 1, ?, 0, ?, 'LLL per-user WS token')`,
      [token, moodleUserId, serviceId, this.getCreatorId(), now],
    );
    this.logger.log(`Minted per-user Moodle WS token (DB fallback) for userid ${moodleUserId}`);
    this.tokenCache.set(moodleUserId, token);
    return token;
  }
}
