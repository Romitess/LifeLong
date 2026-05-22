import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type { ApiCategory } from 'src/types/category';

interface UseCategoryListReturn {
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  fetchCategories: () => Promise<ApiCategory[]>;
}

export function useCategoryList(): UseCategoryListReturn {
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchCategories = async (): Promise<ApiCategory[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiCategory[]>('/api/categories');
      return data;
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้';
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, fetchCategories };
}
