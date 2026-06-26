// Common constants for the application

// Database field lengths
export const DB_FIELD_LENGTHS = {
  NAME: 255,
  KEYWORD: 400,
  URL: 255,
  TEXT_SHORT: 255,
} as const;

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  MOODLE_CACHE_TTL: 10 * 60 * 1000, // 10 minutes
  RESET_EXPIRY_HOURS: 24,
  RESET_EXPIRY_MS: 24 * 60 * 60 * 1000, // 24 hours
  WEEK_MS: 7 * 24 * 60 * 60 * 1000, // 1 week
  UNIX_TO_MS: 1000, // Unix timestamp to milliseconds
} as const;

// Default URLs and ports
export const DEFAULT_URLS = {
  BACKEND_PORT: 3000,
  FRONTEND_PORT: 9000,
  BACKEND_URL: 'http://backend:3000',
  LOCALHOST_FRONTEND: 'http://localhost:9000',
  LOCALHOST_BACKEND: 'http://localhost:3000',
} as const;

// Batch processing
export const BATCH_SIZES = {
  DEFAULT: 500,
  SMALL: 100,
  LARGE: 1000,
} as const;

// Allowed origins for CORS
export const ALLOWED_ORIGINS = [
  'http://localhost:8080',
  'http://localhost:9000',
  'http://lll.localhost',
  'http://moodle.localhost',
] as const;