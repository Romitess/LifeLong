import { api } from 'src/boot/axios';
import { IMAGE_CONFIG, PLATFORM_GATEWAY } from 'src/constants/api';
import type { ImageUploadResponse } from 'src/types/image';

export function validateImageFile(file: File): void {
  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    throw new Error('Image file size must not exceed 5MB');
  }

  const lowerName = file.name.toLowerCase();
  const hasAllowedExtension = IMAGE_CONFIG.ALLOWED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext),
  );

  if (
    !(IMAGE_CONFIG.ALLOWED_TYPES as readonly string[]).includes(file.type) ||
    !hasAllowedExtension
  ) {
    throw new Error('Only JPEG, PNG and WebP images are allowed');
  }
}

export async function uploadImage(file: File, folder = 'profile'): Promise<string> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', folder);

  const { data } = await api.post<ImageUploadResponse>(PLATFORM_GATEWAY.UPLOAD_IMAGE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const imagePath = normalizeUploadPath(data);
  if (!imagePath) {
    throw new Error('Image upload response does not include an image path');
  }
  return imagePath;
}

export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('data:')) {
    return imagePath;
  }
  if (imagePath.startsWith('/api/')) {
    return imagePath;
  }

  const normalizedPath = imagePath.startsWith('/uploads/')
    ? imagePath
    : imagePath.startsWith('uploads/')
      ? `/${imagePath}`
      : imagePath.startsWith('/')
        ? imagePath
        : `/uploads/${imagePath}`;
  return `${PLATFORM_GATEWAY.BASE_PATH}${normalizedPath}`.replace(/\/{2,}/g, '/');
}

function normalizeUploadPath(response: ImageUploadResponse): string {
  const direct =
    response.path ||
    response.filePath ||
    response.url ||
    response.result?.path ||
    response.result?.filePath ||
    response.result?.url;

  if (direct) return direct;

  const fileName = response.fileName || response.result?.fileName;
  return fileName ? `/uploads/${fileName.replace(/^\/+/, '')}` : '';
}
