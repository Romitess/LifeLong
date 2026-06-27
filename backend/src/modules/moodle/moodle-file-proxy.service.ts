import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { Readable } from 'node:stream';
import type { ReadableStream as WebReadableStream } from 'node:stream/web';
import { MoodleService } from './moodle.service';

/**
 * Moodle pluginfile proxy (shared by course content + assign).
 *
 * pluginfile needs the WS token, which must never reach the client. So the backend
 * mints a signed (HMAC + expiry) URL pointing at its own `/api/moodle/moodle-file`
 * endpoint; the endpoint validates the signature and streams the file server-side
 * with the token attached. The signed URL is safe to expose publicly (it cannot be
 * forged and expires), so it works for native `<img>` tags that cannot send a JWT.
 */
@Injectable()
export class MoodleFileProxyService {
  private readonly fileProxyTtlMs = 6 * 60 * 60 * 1000;

  constructor(
    private readonly configService: ConfigService,
    private readonly moodleService: MoodleService,
  ) {}

  // หา public base URL ของ backend นี้ (ใช้ต่อ URL proxy)
  private getBackendPublicUrl(): string {
    return this.configService.getOrThrow<string>('BACKEND_PUBLIC_URL').replace(/\/+$/, '');
  }

  // คืน jwtSecret สำหรับ HMAC signing (throw ถ้ายังไม่ตั้งค่า)
  private getSecret(): string {
    const secret = this.configService.get<string>('jwtSecret');
    if (!secret) {
      throw new Error('jwtSecret is not configured — cannot sign Moodle file proxy URLs.');
    }
    return secret;
  }

  // คำนวณ HMAC-SHA256 จาก "fileurl|exp" — ใช้ mint และตรวจสอบ signature ของ proxy URL
  private sign(fileurl: string, exp: number): string {
    return createHmac('sha256', this.getSecret()).update(`${fileurl}|${exp}`).digest('hex');
  }

  /** Absolute, signed, time-limited proxy URL — or the URL unchanged if not a Moodle pluginfile. */
  toProxyUrl(fileurl: string): string {
    if (!fileurl || !this.moodleService.isMoodlePluginfileUrl(fileurl)) return fileurl;
    const exp = Date.now() + this.fileProxyTtlMs;
    const sig = this.sign(fileurl, exp);
    const params = new URLSearchParams({ fileurl, exp: exp.toString(), sig });
    return `${this.getBackendPublicUrl()}/api/moodle/moodle-file?${params.toString()}`;
  }

  /** Rewrite Moodle pluginfile URLs embedded in HTML to signed proxy URLs. */
  rewriteEmbeddedFileUrls(html: string): string {
    return html.replace(/https?:\/\/[^"'\s)]+\/webservice\/pluginfile\.php\/[^"'\s)]+/g, (match) =>
      this.toProxyUrl(match),
    );
  }

  /** Validate a signed proxy request and stream the underlying Moodle file. */
  async getFileStream(
    fileurl: string,
    exp: string,
    sig: string,
  ): Promise<{
    stream: Readable;
    contentType: string | null;
    contentDisposition: string | null;
    contentLength: string | null;
  }> {
    const expMs = Number(exp);
    if (!fileurl || !sig || !Number.isFinite(expMs)) {
      throw new BadRequestException('Invalid file request.');
    }
    if (Date.now() > expMs) {
      throw new ForbiddenException('File link has expired.');
    }

    const expected = this.sign(fileurl, expMs);
    const sigBuf = Buffer.from(sig, 'hex');
    const expectedBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
      throw new ForbiddenException('Invalid file signature.');
    }

    const response = await this.moodleService.fetchPluginfile(fileurl);
    if (!response.ok || !response.body) {
      throw new NotFoundException('File not found in Moodle.');
    }

    return {
      stream: Readable.fromWeb(response.body as unknown as WebReadableStream<Uint8Array>),
      contentType: response.headers.get('content-type'),
      contentDisposition: response.headers.get('content-disposition'),
      contentLength: response.headers.get('content-length'),
    };
  }
}
