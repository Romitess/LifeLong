import { computed, ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  AdminCategoryPayload,
  AdminCourseCategory,
  AdminSubcategoryPayload,
} from 'src/types/admin-course-taxonomy';

interface DeleteResponse {
  success: true;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string') {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export function useAdminCourseTaxonomy() {
  const categories = ref<AdminCourseCategory[]>([]);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  const totalSubcategories = computed(() =>
    categories.value.reduce((sum, category) => sum + category.subcategories.length, 0),
  );

  const totalCourseCount = computed(() =>
    categories.value.reduce((sum, category) => sum + category.courseCount, 0),
  );

  const activeNodeCount = computed(() => {
    const activeCategories = categories.value.filter(
      (category) => category.activeFlag === 'Y',
    ).length;
    const activeSubcategories = categories.value.reduce(
      (sum, category) =>
        sum + category.subcategories.filter((subcategory) => subcategory.activeFlag === 'Y').length,
      0,
    );

    return activeCategories + activeSubcategories;
  });

  async function fetchData(showLoading = true): Promise<void> {
    if (showLoading) {
      isLoading.value = true;
    }
    error.value = null;

    try {
      const { data } = await api.get<AdminCourseCategory[]>('/api/admin/categories');
      categories.value = data;
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      if (showLoading) {
        isLoading.value = false;
      }
    }
  }

  async function createCategory(payload: AdminCategoryPayload): Promise<void> {
    isSaving.value = true;
    error.value = null;

    try {
      await api.post('/api/admin/categories', payload);
      await fetchData();
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateCategory(id: number, payload: AdminCategoryPayload): Promise<void> {
    isSaving.value = true;
    error.value = null;

    try {
      await api.patch(`/api/admin/categories/${id}`, payload);
      await fetchData(false);
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteCategory(id: number): Promise<DeleteResponse> {
    isSaving.value = true;
    error.value = null;

    try {
      const { data } = await api.delete<DeleteResponse>(`/api/admin/categories/${id}`);
      await fetchData();
      return data;
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  async function createSubcategory(payload: AdminSubcategoryPayload): Promise<void> {
    isSaving.value = true;
    error.value = null;

    try {
      await api.post('/api/admin/subcategories', payload);
      await fetchData();
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  async function updateSubcategory(id: number, payload: AdminSubcategoryPayload): Promise<void> {
    isSaving.value = true;
    error.value = null;

    try {
      await api.patch(`/api/admin/subcategories/${id}`, payload);
      await fetchData(false);
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  async function deleteSubcategory(id: number): Promise<DeleteResponse> {
    isSaving.value = true;
    error.value = null;

    try {
      const { data } = await api.delete<DeleteResponse>(`/api/admin/subcategories/${id}`);
      await fetchData();
      return data;
    } catch (caughtError: unknown) {
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    categories,
    isLoading,
    isSaving,
    error,
    totalSubcategories,
    totalCourseCount,
    activeNodeCount,
    fetchData,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  };
}
