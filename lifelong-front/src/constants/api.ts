export const PLATFORM_GATEWAY = {
  BASE_PATH: '/api',
  UPLOAD_IMAGE: '/api/images/upload',
  GET_IMAGE: '/api/images',
} as const;

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
} as const;
