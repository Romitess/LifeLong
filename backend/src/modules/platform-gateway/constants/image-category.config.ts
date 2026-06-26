export interface ImageCategoryConfig {
  baseFolder: string;
  scope: 'per-user' | 'shared';
  requireAuth: boolean;
}

export const IMAGE_CATEGORIES = {
  profile: {
    baseFolder: '/uploads/profile',
    scope: 'per-user',
    requireAuth: true,
  },
  course: {
    baseFolder: '/uploads/course',
    scope: 'shared',
    requireAuth: false,
  },
  'page-builder': {
    baseFolder: '/uploads/page-builder',
    scope: 'shared',
    requireAuth: false,
  },
  system: {
    baseFolder: '/uploads/system',
    scope: 'shared',
    requireAuth: false,
  },
  'cert-template': {
    baseFolder: '/uploads/cert-templates',
    scope: 'shared',
    requireAuth: true,
  },
  'cert-signer': {
    baseFolder: '/uploads/cert-signers',
    scope: 'shared',
    requireAuth: true,
  },
} as const satisfies Record<string, ImageCategoryConfig>;

export type ImageCategory = keyof typeof IMAGE_CATEGORIES;

export const isImageCategory = (value: unknown): value is ImageCategory =>
  typeof value === 'string' && Object.prototype.hasOwnProperty.call(IMAGE_CATEGORIES, value);

export const resolveImageFolder = (category: ImageCategory, userId?: number | null): string => {
  const config = IMAGE_CATEGORIES[category];
  if (config.scope === 'per-user') {
    if (userId == null) {
      throw new Error(`Image category "${category}" requires an authenticated user`);
    }
    return `${config.baseFolder}/${userId}`;
  }
  return config.baseFolder;
};
