import { api } from 'src/boot/axios';
import { getImageUrl } from 'src/services/image.service';

interface ProfileAvatarResponse {
  avatarPath?: string;
  avatarUrl: string;
}

interface ProfileAvatarOptionsResponse {
  avatarOptions: string[];
}

interface ProfileImageResponse {
  imageUrl: string | null;
}

const DEFAULT_PROFILE_AVATAR_FILE_NAME = 'profile-avatar.png';
const DEFAULT_PROFILE_PHOTO_FILE_NAME = 'profile-photo.png';

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, content] = dataUrl.split(',', 2);
  if (!header || !content) {
    throw new Error('Invalid avatar image data');
  }

  const mimeMatch = header.match(/^data:(.+);base64$/);
  if (!mimeMatch) {
    throw new Error('Unsupported avatar image format');
  }

  const mimeType = mimeMatch[1] || 'image/png';
  const binary = window.atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to prepare avatar image'));
    image.src = source;
  });
}

async function svgDataUrlToPngBlob(dataUrl: string): Promise<Blob> {
  const image = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width || 560;
  canvas.height = image.naturalHeight || image.height || 560;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to prepare avatar image');
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('Unable to prepare avatar image'));
    }, 'image/png');
  });
}

async function dataUrlToUploadableImageBlob(dataUrl: string): Promise<Blob> {
  if (/^data:image\/svg\+xml[;,]/i.test(dataUrl)) {
    return svgDataUrlToPngBlob(dataUrl);
  }

  return dataUrlToBlob(dataUrl);
}

export async function uploadProfileAvatar(
  file: Blob | File,
  fileName = DEFAULT_PROFILE_AVATAR_FILE_NAME,
): Promise<ProfileAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const { data } = await api.patch<ProfileImageResponse>('/api/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return { avatarUrl: getImageUrl(data.imageUrl) };
}

export async function uploadProfileAvatarOption(
  file: Blob | File,
  fileName = DEFAULT_PROFILE_PHOTO_FILE_NAME,
): Promise<ProfileAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const { data } = await api.post<ProfileImageResponse>(
    '/api/profile/avatar-options/upload',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return { avatarUrl: getImageUrl(data.imageUrl) };
}

export async function getProfileAvatarOptions(): Promise<string[]> {
  const { data } = await api.get<ProfileAvatarOptionsResponse>('/api/profile/avatar-options');
  return data.avatarOptions.map((avatarOption) => getImageUrl(avatarOption));
}

export async function saveProfileAvatarOptions(avatarOptions: string[]): Promise<string[]> {
  const { data } = await api.patch<ProfileAvatarOptionsResponse>('/api/profile/avatar-options', {
    avatarOptions,
  });
  return data.avatarOptions;
}

export async function saveProfileAvatarUrl(avatarUrl: string): Promise<ProfileAvatarResponse> {
  const { data } = await api.patch<ProfileImageResponse>('/api/profile/image-url', {
    imageUrl: avatarUrl,
  });
  return { avatarUrl: getImageUrl(data.imageUrl) };
}

export async function uploadProfileAvatarDataUrl(
  dataUrl: string,
  fileName = DEFAULT_PROFILE_AVATAR_FILE_NAME,
): Promise<ProfileAvatarResponse> {
  return uploadProfileAvatar(await dataUrlToUploadableImageBlob(dataUrl), fileName);
}
