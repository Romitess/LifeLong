export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AppConfig {
  nodeEnv: string;
  port: number;
  allowedOrigins?: string;
  frontendUrl?: string;
  backendInternalUrl?: string;
  database: DatabaseConfig;
  jwtSecret: string;
  rateLimitLoginTtl: number;
  rateLimitLoginLimit: number;
  platformGateway: Record<string, { path: string; scope: string }>;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }
  return value;
}

export const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  frontendUrl: process.env.FRONTEND_URL,
  backendInternalUrl: process.env.BACKEND_INTERNAL_URL,
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'root',
    password: requiredEnv('DB_PASSWORD'),
    database: process.env.DB_NAME ?? 'lifelong2',
  },
  jwtSecret: requiredEnv('JWT_SECRET'),
  rateLimitLoginTtl: Number(process.env.RATE_LIMIT_LOGIN_TTL ?? 60000),
  rateLimitLoginLimit: Number(process.env.RATE_LIMIT_LOGIN_LIMIT ?? 5),
  platformGateway: {
    uploadFile: {
      path: process.env.PLATFORM_GATEWAY_UPLOAD_FILE_PATH ?? '/service-api/minio.PutFile',
      scope: process.env.PLATFORM_GATEWAY_UPLOAD_FILE_SCOPE ?? 'write',
    },
    getFileList: {
      path: process.env.PLATFORM_GATEWAY_GET_FILE_LIST_PATH ?? '/service-api/minio.GetFilesList',
      scope: process.env.PLATFORM_GATEWAY_GET_FILE_LIST_SCOPE ?? 'read',
    },
    getPublicFile: {
      path: process.env.PLATFORM_GATEWAY_GET_PUBLIC_FILE_PATH ?? '/service-api/minio.GetPublicFile',
      scope: process.env.PLATFORM_GATEWAY_GET_PUBLIC_FILE_SCOPE ?? 'read',
    },
    deleteFile: {
      path: process.env.PLATFORM_GATEWAY_DELETE_FILE_PATH ?? '/service-api/minio.DeleteFile',
      scope: process.env.PLATFORM_GATEWAY_DELETE_FILE_SCOPE ?? 'write',
    },
    sendEmail: {
      path: process.env.PLATFORM_GATEWAY_SEND_EMAIL_PATH ?? '/service-api/email.SendEmail',
      scope: process.env.PLATFORM_GATEWAY_SEND_EMAIL_SCOPE ?? 'write',
    },
    timeStamp: {
      path: process.env.PLATFORM_GATEWAY_TIME_STAMP_PATH ?? '/service-api/ds.TimeStamp',
      scope: process.env.PLATFORM_GATEWAY_TIME_STAMP_SCOPE ?? 'write',
    },
    dsPrefix: {
      path: process.env.PLATFORM_GATEWAY_DS_PREFIX_PATH ?? '/service-api/ds.Prefix',
      scope: process.env.PLATFORM_GATEWAY_DS_PREFIX_SCOPE ?? 'read',
    },
    createShortUrl: {
      path:
        process.env.PLATFORM_GATEWAY_CREATE_SHORT_URL_PATH ??
        '/service-api/shorturl.CreateShortUrl',
      scope: process.env.PLATFORM_GATEWAY_CREATE_SHORT_URL_SCOPE ?? 'write',
    },
    getOriginalUrl: {
      path:
        process.env.PLATFORM_GATEWAY_GET_ORIGINAL_URL_PATH ??
        '/service-api/shorturl.GetOriginalUrl',
      scope: process.env.PLATFORM_GATEWAY_GET_ORIGINAL_URL_SCOPE ?? 'read',
    },
  },
});
