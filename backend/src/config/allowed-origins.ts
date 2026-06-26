const originsEnv = process.env['ALLOWED_ORIGINS'];
const isProd = process.env['NODE_ENV'] === 'production';

let origins: string[] = [];

if (originsEnv) {
  origins = originsEnv
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
} else if (isProd) {
  throw new Error(
    'CRITICAL: ALLOWED_ORIGINS environment variable is not defined in production environment.',
  );
} else {
  origins = [
    'http://localhost:8080',
    'http://localhost:9000', 
    'http://lll.localhost',
    'http://moodle.localhost',
  ];
}

export const ALLOWED_ORIGINS = origins;
