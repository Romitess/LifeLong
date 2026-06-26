import { api } from 'src/boot/axios';
import type { HeroTemplateConfig } from 'src/stores/system-image-store';

export interface SlideshowImageUploadResult {
  filename: string;
  imgSize: string;
  imgType: string;
  path: string;
  url: string;
}

/** Public read used by the main page (no auth). */
export async function fetchHeroConfig(): Promise<unknown> {
  const { data } = await api.get<unknown>('/api/slideshow');
  return data;
}

/** Admin save of the full hero config (idempotent upsert). */
export async function saveHeroConfig(config: HeroTemplateConfig): Promise<unknown> {
  const { data } = await api.put<unknown>('/api/admin/slideshow', config);
  return data;
}

/** Upload a hero image file; returns the stored public URL. */
export async function uploadHeroImage(file: File): Promise<SlideshowImageUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<SlideshowImageUploadResult>(
    '/api/admin/slideshow/image',
    formData,
  );
  return data;
}
