import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ForgotPasswordEmailOptions {
  to: string;
  resetLink: string;
}

export interface AnnouncementEmailOptions {
  to: string;
  recipientName: string;
  courseName: string;
  title: string;
  content: string;
  instructorName: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private readonly domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly provisionKey: string;
  private readonly tokenUrl: string;
  private readonly sendUrl: string;
  private readonly isConfigured: boolean;

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenFetchPromise: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {
    this.domain = this.configService.get<string>('BUU_DOMAIN') ?? '';
    this.clientId = this.configService.get<string>('BUU_REQUEST_CLIENT_ID') ?? '';
    this.clientSecret = this.configService.get<string>('BUU_REQUEST_CLIENT_SECRET') ?? '';
    this.provisionKey = this.configService.get<string>('BUU_SEND_EMAIL_PROVISION_KEY') ?? '';
    this.isConfigured = !!(this.domain && this.clientId && this.clientSecret && this.provisionKey);
    this.tokenUrl = `${this.domain}/service-api/email.SendEmail/oauth2/token/`;
    this.sendUrl = `${this.domain}/service-api/email.SendEmail`;
    if (!this.isConfigured) {
      this.logger.warn('BUU Email API not configured — email sending is disabled');
    }
  }

  async sendForgotPasswordEmail(opts: ForgotPasswordEmailOptions): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
                   style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <tr>
                <td style="background:#1a56db;padding:24px 32px;">
                  <p style="margin:0;color:#ffffff;font-size:13px;opacity:.8;">ระบบ Lifelong Learning — BUU</p>
                  <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">รีเซ็ตรหัสผ่าน</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;color:#374151;">เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</p>
                  <p style="margin:0 0 24px;color:#374151;">คลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่ ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง</p>
                  <div style="text-align:center;margin-bottom:24px;">
                    <a href="${opts.resetLink}"
                       style="display:inline-block;background:#1a56db;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:6px;font-size:16px;font-weight:600;">
                      ตั้งรหัสผ่านใหม่
                    </a>
                  </div>
                  <p style="margin:0;color:#6b7280;font-size:13px;">
                    หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาเพิกเฉยต่ออีเมลนี้
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                    อีเมลนี้ส่งโดยอัตโนมัติจากระบบ Lifelong Learning — กรุณาอย่าตอบกลับ
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await this.sendWithRetry({
      send_system: 'LIFELONG',
      send_to: opts.to,
      send_cc: '',
      send_subject: 'รีเซ็ตรหัสผ่าน — ระบบ Lifelong Learning',
      send_message: html,
    });

    this.logger.debug(`Forgot password email sent to ${opts.to}`);
  }

  async sendAnnouncementEmail(opts: AnnouncementEmailOptions): Promise<void> {
    const safeContent = opts.content.replace(/\n/g, '<br>');

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
                   style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
              <tr>
                <td style="background:#1a56db;padding:24px 32px;">
                  <p style="margin:0;color:#ffffff;font-size:13px;opacity:.8;">ระบบ Lifelong Learning — BUU</p>
                  <h1 style="margin:8px 0 0;color:#ffffff;font-size:20px;">ประกาศจากรายวิชา</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 16px;color:#374151;">เรียน <strong>${opts.recipientName}</strong>,</p>
                  <p style="margin:0 0 24px;color:#374151;">มีประกาศใหม่จากรายวิชา <strong>${opts.courseName}</strong></p>
                  <div style="background:#f9fafb;border-left:4px solid #1a56db;border-radius:4px;padding:20px 24px;margin-bottom:24px;">
                    <h2 style="margin:0 0 12px;color:#111827;font-size:18px;">${opts.title}</h2>
                    <p style="margin:0;color:#374151;line-height:1.6;">${safeContent}</p>
                  </div>
                  <p style="margin:0;color:#6b7280;font-size:13px;">
                    ประกาศโดย: <strong>${opts.instructorName}</strong>
                  </p>
                </td>
              </tr>
              <tr>
                <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">
                    อีเมลนี้ส่งโดยอัตโนมัติจากระบบ Lifelong Learning — กรุณาอย่าตอบกลับ
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await this.sendWithRetry({
      send_system: 'LIFELONG',
      send_to: opts.to,
      send_cc: '',
      send_subject: `[ประกาศ] ${opts.courseName}: ${opts.title}`,
      send_message: html,
    });

    this.logger.debug(`Announcement email sent to ${opts.to}`);
  }

  private async sendWithRetry(payload: Record<string, string>): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(`BUU Email not configured — skipping send to ${payload['send_to'] ?? '?'}`);
      return;
    }

    if (!this.accessToken) {
      await this.ensureToken();
    }

    const response = await this.callSendApi(payload);

    if (response.status === 401) {
      this.logger.warn('BUU Email API: 401 — refreshing token and retrying');
      await this.doRefreshToken();
      const retryResponse = await this.callSendApi(payload);
      if (!retryResponse.ok) {
        const body = await retryResponse.text();
        throw new Error(`BUU Email API error after retry: ${retryResponse.status} — ${body}`);
      }
      return;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`BUU Email API error: ${response.status} — ${body}`);
    }
  }

  private callSendApi(payload: Record<string, string>): Promise<Response> {
    return fetch(this.sendUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  // Ensures only one token fetch runs at a time if called concurrently
  private ensureToken(): Promise<void> {
    if (!this.tokenFetchPromise) {
      this.tokenFetchPromise = this.doFetchToken().finally(() => {
        this.tokenFetchPromise = null;
      });
    }
    return this.tokenFetchPromise;
  }

  private async doFetchToken(): Promise<void> {
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: 'password',
      scope: 'write',
      provision_key: this.provisionKey,
      authenticated_userid: 'hrd-kong',
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`BUU Email token request failed: ${response.status} — ${text}`);
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.logger.log('BUU Email API: access token acquired');
  }

  private async doRefreshToken(): Promise<void> {
    if (!this.refreshToken) {
      return this.doFetchToken();
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });

    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      this.logger.warn('BUU Email API: refresh token failed — fetching new token');
      this.accessToken = null;
      this.refreshToken = null;
      return this.doFetchToken();
    }

    const data = (await response.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.logger.log('BUU Email API: access token refreshed');
  }
}
