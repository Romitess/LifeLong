import { ref } from 'vue';
import { uploadImage } from 'src/services/image.service';

interface UseImageUploadOptions {
  onSuccess?: (imagePath: string) => void;
  onError?: (error: Error) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const isUploading = ref(false);
  const uploadError = ref<string | null>(null);

  const handleImageUpload = async (file: File, folder = 'profile'): Promise<string> => {
    isUploading.value = true;
    uploadError.value = null;

    try {
      const imagePath = await uploadImage(file, folder);
      options.onSuccess?.(imagePath);
      return imagePath;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      uploadError.value = normalizedError.message;
      options.onError?.(normalizedError);
      throw normalizedError;
    } finally {
      isUploading.value = false;
    }
  };

  return {
    isUploading,
    uploadError,
    handleImageUpload,
  };
}
