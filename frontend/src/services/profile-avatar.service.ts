import { api } from 'src/boot/axios';

interface ProfileAvatarResponse {
  avatarPath: string;
  avatarUrl: string;
}

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

export async function uploadProfileAvatar(
  file: Blob | File,
  fileName = 'profile-avatar.png',
): Promise<ProfileAvatarResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);

  const { data } = await api.post<ProfileAvatarResponse>('/api/auth/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data;
}

export async function uploadProfileAvatarDataUrl(
  dataUrl: string,
  fileName = 'profile-avatar.png',
): Promise<ProfileAvatarResponse> {
  return uploadProfileAvatar(dataUrlToBlob(dataUrl), fileName);
}
