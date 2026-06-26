import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { readFile, unlink } from 'node:fs/promises';
import { extname } from 'node:path';
import { isImageCategory, resolveImageFolder } from './constants/image-category.config';
import {
  ApiToken,
  GatewayApiConfig,
  UploadedGatewayFile,
  UploadFileDto,
} from './platform-gateway.types';

type JsonRecord = Record<string, unknown>;

@Injectable()
export class PlatformGatewayService {
  private readonly logger = new Logger(PlatformGatewayService.name);
  private readonly tokenCache = new Map<string, ApiToken>();
  private readonly tokenFetches = new Map<string, Promise<void>>();

  constructor(private readonly configService: ConfigService) {}

  async uploadByCategory(
    category: string,
    file: Express.Multer.File,
    userId?: number | null,
  ): Promise<UploadedGatewayFile> {
    if (!isImageCategory(category)) {
      throw new BadRequestException(`Unknown image category: ${category}`);
    }

    let folder: string;
    try {
      folder = resolveImageFolder(category, userId);
    } catch {
      throw new BadRequestException(`Image category "${category}" requires an authenticated user`);
    }

    return this.uploadFile(file, {
      path: folder,
      fileName: file.originalname,
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    uploadFileDto: UploadFileDto,
  ): Promise<unknown> {
    const data = this.constructFileData(
      { filename: originalName } as Express.Multer.File,
      uploadFileDto,
    );
    return this.uploadPayload(Buffer.from(buffer), data);
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<UploadedGatewayFile> {
    const path =
      uploadFileDto.path && uploadFileDto.path !== 'undefined' ? uploadFileDto.path : '/uploads';
    const dto = { ...uploadFileDto, path };
    const data = this.constructFileData(file, dto);

    try {
      if (!file.path) {
        throw new BadRequestException('Uploaded file is missing a temporary path');
      }
      const buffer = await readFile(file.path);
      const response = await this.uploadPayload(buffer, data);
      return this.toUploadedGatewayFile(data, response);
    } finally {
      if (file.path) {
        await unlink(file.path).catch(() => undefined);
      }
    }
  }

  async getFileList(path: string): Promise<unknown> {
    return this.postApi('getFileList', {
      path: path || '/uploads',
      bucket: this.getBucket(),
    });
  }

  async getPublicFile(fileName: string, downloadName?: string): Promise<unknown> {
    const cleanFileName = fileName.replace(/\/{2,}/g, '/').replace(/^\/+/, '');
    const baseName = cleanFileName.split('/').pop() || cleanFileName;
    const cleanDownloadName = downloadName?.split('/').pop();

    return this.postApi('getPublicFile', {
      filePath: { file_1: cleanFileName },
      time: 7,
      carbonTime: 'D',
      bucket: this.getBucket(),
      originalFileName: { file_1: cleanDownloadName || baseName },
    });
  }

  async getPublicFiles(files: { fileName: string; downloadName?: string }[]): Promise<unknown> {
    const filePath: Record<string, string> = {};
    const originalFileName: Record<string, string> = {};

    files.forEach((file, index) => {
      const key = `file_${index + 1}`;
      const cleanFileName = file.fileName.replace(/\/{2,}/g, '/').replace(/^\/+/, '');
      filePath[key] = cleanFileName;
      originalFileName[key] =
        file.downloadName?.split('/').pop() || cleanFileName.split('/').pop() || cleanFileName;
    });

    return this.postApi('getPublicFile', {
      filePath,
      time: 7,
      carbonTime: 'D',
      bucket: this.getBucket(),
      originalFileName,
    });
  }

  async deleteFile(fileName: string): Promise<unknown> {
    return this.deleteApi('deleteFile', {
      filePath: fileName && fileName !== 'none' ? fileName : '',
      bucket: this.getBucket(),
    });
  }

  async sendEmail(system: string, to: string, subject: string, message: string): Promise<unknown> {
    return this.postApi('sendEmail', {
      send_system: system,
      send_to: process.env.AUTOMATE_TEST_MODE === 'true' ? 'jutamas.lu@go.buu.ac.th' : to,
      send_cc: process.env.AUTOMATE_TEST_MODE === 'true' ? '' : to,
      send_subject: subject,
      send_message: message,
    });
  }

  async timeStamp(payload: JsonRecord): Promise<unknown> {
    return this.postApi('timeStamp', {
      documentName: payload.documentName,
      bucket: this.getBucket(),
    });
  }

  async dsPrefix(): Promise<unknown> {
    return this.getApi('dsPrefix');
  }

  async createShortUrl(payload: JsonRecord): Promise<unknown> {
    return this.postApi('createShortUrl', { url: payload.url });
  }

  async getOriginalUrl(payload: JsonRecord): Promise<unknown> {
    return this.postApi('getOriginalUrl', { shortUrl: payload.shortUrl });
  }

  sendNoti(message: string): void {
    this.logger.warn(`Gateway notification: ${message}`);
  }

  private constructFileData(file: Express.Multer.File, uploadFileDto: UploadFileDto): JsonRecord {
    const path = uploadFileDto.path || '/uploads';
    const originalExtension = this.normalizeExtension(
      uploadFileDto.fileType || extname(uploadFileDto.fileName || file.originalname || ''),
    );
    const fileType =
      uploadFileDto.fileType && uploadFileDto.fileType !== 'undefined'
        ? uploadFileDto.fileType
        : originalExtension;
    const fileName = uploadFileDto.forceFileName
      ? this.sanitizeForcedFileName(uploadFileDto.fileName, fileType)
      : this.generateStoredFileName(fileType);

    return {
      path,
      fileName,
      bucket: uploadFileDto.bucket || this.getBucket(),
      ...(fileType ? { originalExtension: fileType } : {}),
      ...(uploadFileDto.qrVerify === 'true' ? { qrVerify: 'true' } : {}),
    };
  }

  private async uploadPayload(buffer: Buffer, data: JsonRecord): Promise<unknown> {
    const apiName = 'uploadFile';
    const apiConfig = this.getApiConfig(apiName);
    let token = await this.getToken(apiName);
    let response = await this.postUploadForm(apiName, apiConfig, token, buffer, data);

    if (response.status === 401) {
      await this.refreshToken(apiName);
      token = await this.getToken(apiName);
      response = await this.postUploadForm(apiName, apiConfig, token, buffer, data);
    }

    return this.parseGatewayResponse(apiName, response);
  }

  private async postUploadForm(
    _apiName: string,
    apiConfig: GatewayApiConfig,
    token: ApiToken,
    buffer: Buffer,
    data: JsonRecord,
  ): Promise<Response> {
    const form = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, this.toFormValue(value));
      }
    });

    const fileName = typeof data.fileName === 'string' ? data.fileName : 'upload.bin';
    const fileBlob = new Blob([new Uint8Array(buffer)], {
      type: 'application/octet-stream',
    });
    form.append('fileUpload', fileBlob, fileName);

    return fetch(`${this.getDomain()}${apiConfig.path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.access_token}`,
        'x-forwarded-proto': 'https',
      },
      body: form,
    });
  }

  private postApi(apiName: string, data: JsonRecord): Promise<unknown> {
    return this.makeApiRequest('POST', apiName, data);
  }

  private getApi(apiName: string): Promise<unknown> {
    return this.makeApiRequest('GET', apiName);
  }

  private deleteApi(apiName: string, data: JsonRecord): Promise<unknown> {
    return this.makeApiRequest('DELETE', apiName, data);
  }

  private async makeApiRequest(
    method: 'GET' | 'POST' | 'DELETE',
    apiName: string,
    data?: JsonRecord,
  ): Promise<unknown> {
    const apiConfig = this.getApiConfig(apiName);
    const token = await this.getToken(apiName);
    const response = await fetch(`${this.getDomain()}${apiConfig.path}`, {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token.access_token}`,
        'x-forwarded-proto': 'https',
        'Content-Type': 'application/json',
      },
      body: method === 'GET' ? undefined : JSON.stringify(data || {}),
    });

    if (response.status === 401) {
      await this.refreshToken(apiName);
      return this.makeApiRequest(method, apiName, data);
    }

    return this.parseGatewayResponse(apiName, response);
  }

  private async parseGatewayResponse(apiName: string, response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? ((await response.json()) as unknown)
      : await response.text();

    if (!response.ok) {
      this.sendNoti(`${apiName}: ${response.status}`);
      throw new BadRequestException(payload);
    }

    return payload;
  }

  private async getToken(apiName: string): Promise<ApiToken> {
    const cached = this.tokenCache.get(apiName);
    if (cached) return cached;
    await this.ensureToken(apiName);
    const token = this.tokenCache.get(apiName);
    if (!token) throw new Error(`Unable to retrieve API token for ${apiName}`);
    return token;
  }

  private ensureToken(apiName: string): Promise<void> {
    const existing = this.tokenFetches.get(apiName);
    if (existing) return existing;

    const request = this.requestToken(apiName).finally(() => {
      this.tokenFetches.delete(apiName);
    });
    this.tokenFetches.set(apiName, request);
    return request;
  }

  private async requestToken(apiName: string): Promise<void> {
    const apiConfig = this.getApiConfig(apiName);
    const tokenConfig = this.getTokenConfig();
    const response = await fetch(`${this.getDomain()}${apiConfig.path}${tokenConfig.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: tokenConfig.clientSecret,
        client_id: tokenConfig.clientId,
        grant_type: tokenConfig.grantType,
        scope: apiConfig.scope,
        provision_key: apiConfig.provisionKey,
        authenticated_userid: tokenConfig.authenticatedUserId,
      }),
    });

    const payload = (await response.json()) as ApiToken;
    if (!response.ok || !payload.access_token) {
      throw new Error(`Gateway token request failed for ${apiName}: ${response.status}`);
    }
    this.tokenCache.set(apiName, payload);
  }

  private async refreshToken(apiName: string): Promise<void> {
    const cached = this.tokenCache.get(apiName);
    if (!cached?.refresh_token) {
      this.tokenCache.delete(apiName);
      return this.ensureToken(apiName);
    }

    const apiConfig = this.getApiConfig(apiName);
    const tokenConfig = this.getTokenConfig();
    const response = await fetch(`${this.getDomain()}${apiConfig.path}${tokenConfig.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_secret: tokenConfig.clientSecret,
        client_id: tokenConfig.clientId,
        grant_type: 'refresh_token',
        refresh_token: cached.refresh_token,
      }),
    });

    if (!response.ok) {
      this.tokenCache.delete(apiName);
      return this.ensureToken(apiName);
    }

    this.tokenCache.set(apiName, (await response.json()) as ApiToken);
  }

  private getDomain(): string {
    const domain =
      this.configService.get<string>('PLATFORM_GATEWAY_DOMAIN') ||
      this.configService.get<string>('BUU_DOMAIN');
    if (!domain) throw new Error('Platform gateway domain is not configured');
    return domain.replace(/\/+$/, '');
  }

  private toFormValue(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    return JSON.stringify(value);
  }

  private normalizeExtension(value: string | undefined): string {
    return (value || '').replace(/^\./, '').trim().toLowerCase();
  }

  private sanitizeForcedFileName(fileName: string | undefined, fileType: string): string {
    const baseName = (fileName || 'upload')
      .split(/[\\/]/)
      .pop()
      ?.replace(/[^\w.-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const safeName = baseName || 'upload';
    return extname(safeName) || !fileType ? safeName : `${safeName}.${fileType}`;
  }

  private generateStoredFileName(fileType: string): string {
    return `${randomUUID()}${fileType ? `.${fileType}` : ''}`;
  }

  private toUploadedGatewayFile(data: JsonRecord, response: unknown): UploadedGatewayFile {
    const folder = typeof data.path === 'string' ? data.path : '/uploads';
    const requestedFileName = typeof data.fileName === 'string' ? data.fileName : 'upload.bin';
    const gatewayFile = this.extractUploadedFile(response);
    const path =
      gatewayFile.path ||
      `${folder.replace(/\/+$/, '')}/${gatewayFile.fileName || requestedFileName}`.replace(
        /\/{2,}/g,
        '/',
      );
    const fileName =
      gatewayFile.fileName || path.split('/').filter(Boolean).pop() || requestedFileName;

    return {
      fileName,
      path,
      url: `/api${path}`,
      response,
    };
  }

  private extractUploadedFile(response: unknown): { fileName?: string; path?: string } {
    const candidates = this.collectResponseRecords(response);

    for (const candidate of candidates) {
      const path = this.pickString(candidate, [
        'path',
        'filePath',
        'filepath',
        'url',
        'fileUrl',
        'file_url',
      ]);
      const fileName = this.pickString(candidate, [
        'fileName',
        'filename',
        'name',
        'originalFileName',
        'original_file_name',
      ]);
      const normalizedPath = path ? this.normalizeUploadedPath(path, fileName) : undefined;
      if (normalizedPath || fileName) {
        return { fileName, path: normalizedPath };
      }
    }

    return {};
  }

  private collectResponseRecords(value: unknown): JsonRecord[] {
    if (!value || typeof value !== 'object') return [];
    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectResponseRecords(item));
    }

    const record = value as JsonRecord;
    const nestedKeys = ['data', 'result', 'file', 'files', 'payload'];
    return [record, ...nestedKeys.flatMap((key) => this.collectResponseRecords(record[key]))];
  }

  private pickString(record: JsonRecord, keys: string[]): string | undefined {
    for (const key of keys) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return undefined;
  }

  private normalizeUploadedPath(value: string, fileName?: string): string | undefined {
    const withoutQuery = value.split('?')[0] || value;
    const match = withoutQuery.match(/\/uploads\/.+$/);
    const normalized = match
      ? match[0].replace(/\/{2,}/g, '/')
      : withoutQuery.startsWith('uploads/')
        ? `/${withoutQuery}`.replace(/\/{2,}/g, '/')
        : undefined;
    if (!normalized) return undefined;

    const lastSegment = normalized.split('/').filter(Boolean).pop() || '';
    if (fileName && lastSegment !== fileName && !extname(lastSegment)) {
      return `${normalized.replace(/\/+$/, '')}/${fileName}`;
    }
    if (extname(lastSegment)) return normalized;
    if (fileName && lastSegment === fileName) return normalized;
    return undefined;
  }

  private getBucket(): string {
    return this.configService.get<string>('PLATFORM_GATEWAY_BUCKET') || 'hrd.storage';
  }

  private getTokenConfig(): {
    path: string;
    clientId: string;
    clientSecret: string;
    grantType: string;
    authenticatedUserId: string;
  } {
    const clientId =
      this.configService.get<string>('PLATFORM_GATEWAY_CLIENT_ID') ||
      this.configService.get<string>('BUU_REQUEST_CLIENT_ID') ||
      '';
    const clientSecret =
      this.configService.get<string>('PLATFORM_GATEWAY_CLIENT_SECRET') ||
      this.configService.get<string>('BUU_REQUEST_CLIENT_SECRET') ||
      '';
    if (!clientId || !clientSecret) {
      throw new Error('Platform gateway client credentials are not configured');
    }

    return {
      path:
        this.configService.get<string>('PLATFORM_GATEWAY_TOKEN_PATH') ||
        this.configService.get<string>('BUU_REQUEST_TOKEN_PATH') ||
        '/oauth2/token/',
      clientId,
      clientSecret,
      grantType:
        this.configService.get<string>('PLATFORM_GATEWAY_GRANT_TYPE') ||
        this.configService.get<string>('BUU_REQUEST_GRANT_TYPE') ||
        'password',
      authenticatedUserId:
        this.configService.get<string>('PLATFORM_GATEWAY_AUTHENTICATED_USERID') ||
        this.configService.get<string>('BUU_REQUEST_AUTH_USERID') ||
        this.configService.get<string>('BUU_REQUEST_AUTHENTICATED_USERID') ||
        'hrd-kong',
    };
  }

  private getApiConfig(apiName: string): GatewayApiConfig {
    const gatewayConfig = this.configService.get<{ path: string; scope: string }>(
      `platformGateway.${apiName}`,
    );
    if (!gatewayConfig) {
      throw new Error(`Platform gateway configuration for "${apiName}" is not defined`);
    }

    const upperName = apiName.replace(/[A-Z]/g, (char) => `_${char}`).toUpperCase();
    const provisionKey =
      this.configService.get<string>(`PLATFORM_GATEWAY_${upperName}_PROVISION_KEY`) ||
      this.getLegacyProvisionKey(apiName);

    if (!provisionKey) {
      throw new Error(`Platform gateway provision key for "${apiName}" is not configured`);
    }

    return { path: gatewayConfig.path, provisionKey, scope: gatewayConfig.scope };
  }

  private getLegacyProvisionKey(apiName: string): string {
    const envNames: Record<string, string[]> = {
      uploadFile: ['BUU_UPLOAD_FILE_PROVISION_KEY'],
      getFileList: ['BUU_GET_FILE_LIST_PROVISION_KEY', 'BUU_GET_PUBLIC_FILE_PROVISION_KEY'],
      getPublicFile: ['BUU_GET_PUBLIC_FILE_PROVISION_KEY'],
      deleteFile: ['BUU_DELETE_FILE_PROVISION_KEY'],
      sendEmail: ['BUU_SEND_EMAIL_PROVISION_KEY'],
      timeStamp: ['BUU_TIME_STAMP_PROVISION_KEY'],
      dsPrefix: ['BUU_DS_PREFIX_PROVISION_KEY'],
      createShortUrl: ['BUU_CREATE_SHORT_URL_PROVISION_KEY'],
      getOriginalUrl: ['BUU_GET_ORIGINAL_URL_PROVISION_KEY'],
    };

    for (const envName of envNames[apiName] || []) {
      const value = this.configService.get<string>(envName);
      if (value) return value;
    }
    return '';
  }
}
