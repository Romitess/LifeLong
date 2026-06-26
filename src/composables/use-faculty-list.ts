import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type { ApiFaculty } from 'src/types/faculty';

interface UseFacultyListReturn {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  fetchFaculties: () => Promise<ApiFaculty[]>;
}

export function useFacultyList(): UseFacultyListReturn {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchFaculties = async (): Promise<ApiFaculty[]> => {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ApiFaculty[]>('/api/lltfaculty/options');
      return data;
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลส่วนงานได้';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, fetchFaculties };
}
