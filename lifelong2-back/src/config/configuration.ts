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
  database: DatabaseConfig;
  jwtSecret: string;
  rateLimitLoginTtl: number;
  rateLimitLoginLimit: number;
  platformGateway: Record<string, { path: string; scope: string }>;
}

export const configuration = (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'lifelong2',
  },
  jwtSecret: process.env.JWT_SECRET ?? '',
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
