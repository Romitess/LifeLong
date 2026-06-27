import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { createWriteStream } from 'node:fs';
import { ProgressService } from '../progress/progress.service';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';

interface EnrollmentInfo {
  enrollId: number | string;
  userId: number | string;
  courseId: number | string;
  courseCode: string | null;
  courseNameTH: string | null;
  userFNameTH: string | null;
  userLNameTH: string | null;
  userFNameEN: string | null;
  userLNameEN: string | null;
}

interface TemplateRow {
  id: number | string;
  path: string | null;
}

interface SignerRow {
  id: number | string;
  name: string | null;
  position: string | null;
  sigPath: string | null;
}

interface UserCertQueryRow {
  certId: number | string;
  certCode: string | null;
  certUrl: string | null;
  issueDate: Date | string | null;
  courseName: string | null;
  courseCode: string | null;
}

export interface CertRow {
  certId: number | string;
  enrollId: number | string;
  certCode: string; // stored in CER_FILENAME
  certPath: string | null; // derived
  certUrl: string | null; // derived
  tempId: number | string | null;
  signId: number | string | null;
  issueDate: Date | string | null;
}

interface RawCertRow {
  certId: number | string;
  enrollId: number | string;
  cerFilename: string | null;
  tempId: number | string | null;
  signId: number | string | null;
  issueDate: Date | string | null;
  courseName?: string | null;
  courseCode?: string | null;
}

interface VerifyQueryRow {
  certId: number | string;
  enrollId: number | string;
  cerFilename: string | null;
  issueDate: Date | string | null;
  fNameTH: string | null;
  lNameTH: string | null;
  fNameEN: string | null;
  lNameEN: string | null;
  courseName: string | null;
}

@Injectable()
export class CertificatesService {
  private readonly fontsDir = join(process.cwd(), 'src', 'assets', 'fonts');
  private readonly certsUploadDir = join(process.cwd(), 'uploads', 'certificates');

  constructor(
    private readonly dataSource: DataSource,
    private readonly progressService: ProgressService,
    private readonly platformGatewayService: PlatformGatewayService,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    enrollId: number,
    templateId?: number,
    signerId?: number,
    force = false,
  ): Promise<{ cert: CertRow; alreadyExisted: boolean }> {
    // Check existing
    const existing = await this.findByEnrollId(enrollId);
    if (existing && !force) {
      return { cert: existing, alreadyExisted: true };
    }

    if (!force) {
      // Check course completion (uses Moodle activity data with local DB fallback)
      const completion = await this.progressService.getMoodleCompletion(enrollId);
      if (!completion.completed) {
        throw new BadRequestException(
          `Course not yet completed (${completion.done}/${completion.total})`,
        );
      }
    }

    // Load enrollment + user + course info
    const enrollment = await this.loadEnrollmentInfo(enrollId);

    // Pick template (first active if not specified)
    const template = await this.loadTemplate(templateId);

    // Pick signer (first active if not specified)
    const signer = await this.loadSigner(signerId);

    // Generate PDF — CER_FILENAME stores the descriptive name; path/URL are derived from it
    const safeCode = (enrollment.courseCode ?? 'COURSE').replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const certCode = `${safeCode}_${enrollId}_certificate`;
    const filename = `${certCode}.pdf`;
    const absolutePath = join(this.certsUploadDir, filename);
    const verifyUrl = `${this.backendUrl()}/api/certificates/verify/${certCode}`;

    await mkdir(this.certsUploadDir, { recursive: true });
    await this.generatePdf(absolutePath, {
      enrollment,
      template,
      signer,
      certCode,
      verifyUrl,
    });

    // Save to DB (upsert by ENROLL_ID)
    if (existing) {
      await this.dataSource.query(
        `UPDATE LLTCERTIFICATE
         SET CER_FILENAME=?, TEMP_ID=?, SIGN_ID=?, CREATEDATE=NOW()
         WHERE ENROLL_ID=?`,
        [certCode, template?.id ?? null, signer?.id ?? null, enrollId],
      );
    } else {
      await this.dataSource.query(
        `INSERT INTO LLTCERTIFICATE (ENROLL_ID, CER_FILENAME, TEMP_ID, SIGN_ID, CREATEDATE)
         VALUES (?, ?, ?, ?, NOW())`,
        [enrollId, certCode, template?.id ?? null, signer?.id ?? null],
      );
    }

    const cert = (await this.findByEnrollId(enrollId))!;
    return { cert, alreadyExisted: false };
  }

  async verify(code: string): Promise<object> {
    const rows = await this.dataSource.query<VerifyQueryRow[]>(
      `SELECT
         c.CER_ID        AS certId,
         c.ENROLL_ID     AS enrollId,
         c.CER_FILENAME  AS cerFilename,
         c.CREATEDATE    AS issueDate,
         u.USER_FNAMETH  AS fNameTH,
         u.USER_LNAMETH  AS lNameTH,
         u.USER_FNAMEEN  AS fNameEN,
         u.USER_LNAMEEN  AS lNameEN,
         co.COSE_NAMETH  AS courseName
       FROM LLTCERTIFICATE c
       JOIN LLTENROLL e   ON e.ENROLL_ID = c.ENROLL_ID
       JOIN LLTUMUSER u   ON u.USER_ID   = e.USER_ID
       JOIN LLTCOURSE co  ON co.COSE_ID  = e.COSE_ID
       WHERE c.CER_FILENAME = ?`,
      [code],
    );

    if (!rows[0]) throw new NotFoundException('Certificate not found or invalid code');

    const r = rows[0];
    return {
      valid: true,
      certId: Number(r.certId),
      enrollId: Number(r.enrollId),
      certCode: r.cerFilename,
      certUrl: r.cerFilename ? this.deriveCertUrl(r.cerFilename) : null,
      issueDate: r.issueDate,
      studentNameTH: `${r.fNameTH ?? ''} ${r.lNameTH ?? ''}`.trim() || null,
      studentNameEN: `${r.fNameEN ?? ''} ${r.lNameEN ?? ''}`.trim() || null,
      courseName: r.courseName,
    };
  }

  async findByUser(userId: number): Promise<UserCertQueryRow[]> {
    const rows = await this.dataSource.query<RawCertRow[]>(
      `SELECT
         c.CER_ID       AS certId,
         c.CER_FILENAME AS cerFilename,
         c.CREATEDATE   AS issueDate,
         co.COSE_NAMETH AS courseName,
         co.COSE_CODE   AS courseCode
       FROM LLTCERTIFICATE c
       JOIN LLTENROLL e  ON e.ENROLL_ID = c.ENROLL_ID
       JOIN LLTCOURSE co ON co.COSE_ID  = e.COSE_ID
       WHERE e.USER_ID = ?
       ORDER BY c.CREATEDATE DESC`,
      [userId],
    );
    return rows.map((r) => ({
      certId: Number(r.certId),
      certCode: r.cerFilename,
      certUrl: r.cerFilename ? this.deriveCertUrl(r.cerFilename) : null,
      issueDate: r.issueDate,
      courseName: r.courseName ?? null,
      courseCode: r.courseCode ?? null,
    }));
  }

  async bulkGenerate(
    enrollIds: number[],
    templateId?: number,
    signerId?: number,
  ): Promise<{ generated: number; skipped: number; errors: string[] }> {
    let generated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const enrollId of enrollIds) {
      try {
        const result = await this.generate(enrollId, templateId, signerId, false);
        if (result.alreadyExisted) skipped++;
        else generated++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`enrollId=${enrollId}: ${msg}`);
      }
    }

    return { generated, skipped, errors };
  }

  async findActiveTemplates(): Promise<
    { id: number; name: string; url: string | null; layout: object | null }[]
  > {
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
      layout: r.layout ? (JSON.parse(r.layout) as object) : null,
    }));
  }

  async verifyEnrollmentOwnership(enrollId: number, userId: number | null): Promise<void> {
    if (userId == null) throw new ForbiddenException();
    const rows = await this.dataSource.query<Array<{ cnt: number | string }>>(
      'SELECT COUNT(*) AS cnt FROM LLTENROLL WHERE ENROLL_ID = ? AND USER_ID = ?',
      [enrollId, userId],
    );
    if (Number(rows[0]?.cnt ?? 0) === 0) throw new ForbiddenException();
  }

  // ── private helpers ─────────────────────────────────────────────────────────

  private backendUrl(): string {
    const configuredUrl =
      this.configService.get<string>('BACKEND_PUBLIC_URL') ||
      this.configService.get<string>('BACKEND_URL');
    if (configuredUrl) {
      return configuredUrl.replace(/\/+$/, '');
    }

    const port = this.configService.get<number>('PORT') ?? 3000;
    return `http://localhost:${port}`;
  }

  private deriveCertUrl(certCode: string): string {
    return `${this.backendUrl()}/uploads/certificates/${certCode}.pdf`;
  }

  private async findByEnrollId(enrollId: number): Promise<CertRow | null> {
    const rows = await this.dataSource.query<RawCertRow[]>(
      `SELECT CER_ID AS certId, ENROLL_ID AS enrollId, CER_FILENAME AS cerFilename,
              TEMP_ID AS tempId, SIGN_ID AS signId, CREATEDATE AS issueDate
       FROM LLTCERTIFICATE WHERE ENROLL_ID = ?`,
      [enrollId],
    );
    const raw = rows[0];
    if (!raw) return null;
    return {
      certId: raw.certId,
      enrollId: raw.enrollId,
      certCode: raw.cerFilename ?? '',
      certPath: raw.cerFilename ? `uploads/certificates/${raw.cerFilename}.pdf` : null,
      certUrl: raw.cerFilename ? this.deriveCertUrl(raw.cerFilename) : null,
      tempId: raw.tempId,
      signId: raw.signId,
      issueDate: raw.issueDate,
    };
  }

  private async loadEnrollmentInfo(enrollId: number): Promise<EnrollmentInfo> {
    const rows = await this.dataSource.query<EnrollmentInfo[]>(
      `SELECT e.ENROLL_ID AS enrollId, e.USER_ID AS userId, e.COSE_ID AS courseId,
              c.COSE_CODE AS courseCode, c.COSE_NAMETH AS courseNameTH,
              u.USER_FNAMETH AS userFNameTH, u.USER_LNAMETH AS userLNameTH,
              u.USER_FNAMEEN AS userFNameEN, u.USER_LNAMEEN AS userLNameEN
       FROM LLTENROLL e
       JOIN LLTUMUSER u  ON u.USER_ID  = e.USER_ID
       JOIN LLTCOURSE c  ON c.COSE_ID  = e.COSE_ID
       WHERE e.ENROLL_ID = ?`,
      [enrollId],
    );
    if (!rows[0]) throw new NotFoundException(`Enrollment ${enrollId} not found`);
    return rows[0];
  }

  private async loadTemplate(templateId?: number): Promise<TemplateRow | null> {
    const sql = templateId
      ? `SELECT TEMP_ID AS id, TEMP_PATH AS path FROM LLTTEMPLATECERTIFICATE WHERE TEMP_ID = ? AND TEMP_STATUS = 'Y' LIMIT 1`
      : `SELECT TEMP_ID AS id, TEMP_PATH AS path FROM LLTTEMPLATECERTIFICATE WHERE TEMP_STATUS = 'Y' ORDER BY TEMP_ID ASC LIMIT 1`;
    const params = templateId ? [templateId] : [];
    const rows = await this.dataSource.query<TemplateRow[]>(sql, params);
    return rows[0] ?? null;
  }

  private async loadSigner(signerId?: number): Promise<SignerRow | null> {
    const sql = signerId
      ? `SELECT SIGN_ID AS id, SIGN_NAME AS name, SIGN_POSITION AS position, SIGN_PATH AS sigPath FROM LLTSIGNCERTIFICATE WHERE SIGN_ID = ? AND SIGN_STATUS = 'Y' LIMIT 1`
      : `SELECT SIGN_ID AS id, SIGN_NAME AS name, SIGN_POSITION AS position, SIGN_PATH AS sigPath FROM LLTSIGNCERTIFICATE WHERE SIGN_STATUS = 'Y' ORDER BY SIGN_ID ASC LIMIT 1`;
    const params = signerId ? [signerId] : [];
    const rows = await this.dataSource.query<SignerRow[]>(sql, params);
    return rows[0] ?? null;
  }

  private async generatePdf(
    outputPath: string,
    opts: {
      enrollment: EnrollmentInfo;
      template: TemplateRow | null;
      signer: SignerRow | null;
      certCode: string;
      verifyUrl: string;
    },
  ): Promise<void> {
    const { enrollment, template, signer, certCode, verifyUrl } = opts;
    const templateImage = await this.loadPdfImageBuffer(template?.path);
    const signerImage = await this.loadPdfImageBuffer(signer?.sigPath);

    const fontRegular = join(this.fontsDir, 'Sarabun-Regular.ttf');
    const fontBold = join(this.fontsDir, 'Sarabun-Bold.ttf');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    const writeStream = createWriteStream(outputPath);

    await new Promise<void>((resolve, reject) => {
      doc.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);

      const pageW = doc.page.width; // 842
      const pageH = doc.page.height; // 595

      // Background template image
      if (templateImage) {
        doc.image(templateImage, 0, 0, { width: pageW, height: pageH });
      }

      const nameTH = [enrollment.userFNameTH, enrollment.userLNameTH].filter(Boolean).join(' ');
      const nameEN = [enrollment.userFNameEN, enrollment.userLNameEN].filter(Boolean).join(' ');
      const courseName = enrollment.courseNameTH ?? '';
      const issueDateTH = new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date());

      // Thai name
      if (nameTH) {
        doc
          .font(fontBold)
          .fontSize(26)
          .fillColor('#3b2a00')
          .text(nameTH, 0, 185, { width: pageW, align: 'center' });
      }

      // English name
      if (nameEN) {
        doc
          .font(fontRegular)
          .fontSize(20)
          .fillColor('#3b2a00')
          .text(nameEN, 0, 216, { width: pageW, align: 'center' });
      }

      // Course name
      doc
        .font(fontRegular)
        .fontSize(15)
        .fillColor('#3b2a00')
        .text(courseName, 0, 312, { width: pageW, align: 'center' });

      // Issue date
      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor('#3b2a00')
        .text(issueDateTH, 0, 368, { width: pageW, align: 'center' });

      // Signer signature image
      if (signerImage) {
        doc.image(signerImage, 102, 397, { width: 130, height: 65 });
      }

      // Signer name
      if (signer?.name) {
        doc
          .font(fontBold)
          .fontSize(11)
          .fillColor('#3b2a00')
          .text(signer.name, 60, 466, { width: 230, align: 'center' });
      }

      // Signer position
      if (signer?.position) {
        doc
          .font(fontRegular)
          .fontSize(9)
          .fillColor('#3b2a00')
          .text(signer.position, 60, 480, { width: 230, align: 'center' });
      }

      // Certificate ID
      doc
        .font(fontRegular)
        .fontSize(8)
        .fillColor('#888888')
        .text(`Certificate No. ${certCode}`, 35, 524);

      // QR code — render synchronously via callback-style promise
      QRCode.toBuffer(verifyUrl, { errorCorrectionLevel: 'M', width: 90 }, (err, buf) => {
        if (!err && buf) {
          doc.image(buf, pageW - 130, pageH - 118, { width: 90, height: 90 });
        }
        doc.end();
      });
    });
  }

  private async loadPdfImageBuffer(path?: string | null): Promise<Buffer | undefined> {
    if (!path) return undefined;

    const localPath = this.resolveLocalUploadPath(path);
    if (localPath) {
      try {
        return await readFile(localPath);
      } catch {
        // Fall through to platform-gateway for migrated rows.
      }
    }

    const gatewayPath = this.resolveGatewayUploadPath(path);
    if (!gatewayPath) return undefined;

    try {
      const result = await this.platformGatewayService.getPublicFile(gatewayPath);
      const fileUrl = this.extractGatewayFileUrl(result);
      if (!fileUrl) return undefined;
      const response = await fetch(fileUrl);
      if (!response.ok) return undefined;
      return Buffer.from(await response.arrayBuffer());
    } catch {
      return undefined;
    }
  }

  private resolveLocalUploadPath(path: string): string | null {
    if (/^https?:\/\//i.test(path) && !/\/uploads\//.test(path)) return null;
    const withoutQuery = path.split('?')[0] || path;
    const match = withoutQuery.match(/\/uploads\/.+$/);
    const relative = match
      ? match[0]
      : withoutQuery.startsWith('uploads/')
        ? `/${withoutQuery}`
        : '';
    if (!relative) return null;
    return join(process.cwd(), relative.replace(/^\/+/, ''));
  }

  private resolveGatewayUploadPath(path: string): string | null {
    const withoutQuery = path.split('?')[0] || path;
    const match = withoutQuery.match(/\/uploads\/.+$/);
    if (match) return match[0].replace(/^\/+/, '');
    if (withoutQuery.startsWith('uploads/')) return withoutQuery;
    return null;
  }

  private extractGatewayFileUrl(result: unknown): string | null {
    if (!result || typeof result !== 'object') return null;
    const record = result as Record<string, unknown>;
    const direct = record.file_1;
    const nested =
      record.result && typeof record.result === 'object'
        ? (record.result as Record<string, unknown>).file_1
        : undefined;
    const value = direct || nested;
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const view = (value as Record<string, unknown>).view;
      if (typeof view === 'string') return view;
    }
    return null;
  }
}
