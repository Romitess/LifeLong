import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';

interface VerifyKeyResponse {
  valid: boolean;
  email?: string;
}

interface UseForgotPasswordReturn {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  requestReset: (email: string) => Promise<boolean>;
  verifyKey: (key: string) => Promise<VerifyKeyResponse>;
  resetPassword: (key: string, newPassword: string) => Promise<boolean>;
}

export function useForgotPassword(): UseForgotPasswordReturn {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const requestReset = async (email: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    try {
      await api.post('/api/lltumforgotpass', { email });
      return true;
    } catch {
      error.value = 'ไม่สามารถส่งคำขอได้ กรุณาลองใหม่อีกครั้ง';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const verifyKey = async (key: string): Promise<VerifyKeyResponse> => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<VerifyKeyResponse>(`/api/lltumforgotpass/verify/${key}`);
      return data;
    } catch {
      return { valid: false };
    } finally {
      isLoading.value = false;
    }
  };

  const resetPassword = async (key: string, newPassword: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;
    try {
      await api.post('/api/lltumforgotpass/reset-password', { key, newPassword });
      return true;
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = msg ?? 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, requestReset, verifyKey, resetPassword };
}
