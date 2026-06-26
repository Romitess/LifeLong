export interface ApiToken {
  access_token: string;
  refresh_token?: string;
}

export interface GatewayApiConfig {
  path: string;
  scope?: string;
  provisionKey?: string;
}

export interface UploadFileDto {
  path?: string;
  fileName?: string;
  fileType?: string;
  bucket?: string;
  qrVerify?: string;
  forceFileName?: boolean;
}

export interface UploadedGatewayFile {
  fileName: string;
  path: string;
  url: string;
  response: unknown;
}

export interface GatewayFileResult {
  result?: Record<string, string | { view?: string }>;
  file_1?: string | { view?: string };
}
