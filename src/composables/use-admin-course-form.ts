import { ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type { AdminCourseFormOptions, CreateCoursePayload } from 'src/types/admin-courses';

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

function emptyOptions(): AdminCourseFormOptions {
  return {
    faculties: [],
    courseTypes: [],
    studyTypes: [],
    classTypes: [],
    skills: [],
    categories: [],
    subcategories: [],
    targets: [],
  };
}

export function useAdminCourseForm() {
  const formOptions = ref<AdminCourseFormOptions>(emptyOptions());
  const isLoadingOptions = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);

  async function fetchFormOptions(): Promise<void> {
    isLoadingOptions.value = true;
    error.value = null;
    try {
      const { data } = await api.get<AdminCourseFormOptions>('/api/admin/courses/form-options');
      formOptions.value = data;
    } catch (e) {
      error.value = extractErrorMessage(e);
    } finally {
      isLoadingOptions.value = false;
    }
  }

  async function createCourse(payload: CreateCoursePayload): Promise<{ courseId: number }> {
    isSaving.value = true;
    error.value = null;
    try {
      const form = new FormData();
      form.append('nameTh', payload.nameTh);
      form.append('nameEn', payload.nameEn);
      form.append('facultyId', String(payload.facultyId));
      form.append('typeCourseId', String(payload.typeCourseId));
      if (payload.theoryHours != null) form.append('theoryHours', String(payload.theoryHours));
      if (payload.practiceHours != null)
        form.append('practiceHours', String(payload.practiceHours));
      form.append('studyTypeId', String(payload.studyTypeId));
      if (payload.skillIds?.length) {
        form.append('skillIds', payload.skillIds.join(','));
      }
      form.append('startDate', payload.startDate);
      form.append('endDate', payload.endDate);
      form.append('categoryId', String(payload.categoryId));
      if (payload.subcategoryId != null)
        form.append('subcategoryId', String(payload.subcategoryId));
      if (payload.targets?.length) {
        form.append('targets', JSON.stringify(payload.targets));
      }
      if (payload.classTypeId != null) form.append('classTypeId', String(payload.classTypeId));
      if (payload.classFee != null) form.append('classFee', String(payload.classFee));
      if (payload.classFeeRemark) form.append('classFeeRemark', payload.classFeeRemark);
      form.append('contactName', payload.contactName);
      form.append('contactTel', payload.contactTel);
      form.append('contactEmail', payload.contactEmail);
      if (payload.contactUrl) form.append('contactUrl', payload.contactUrl);
      if (payload.file) form.append('file', payload.file);

      const { data } = await api.post<{ courseId: number }>('/api/admin/courses', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (e) {
      error.value = extractErrorMessage(e);
      throw e;
    } finally {
      isSaving.value = false;
    }
  }

  return {
    formOptions,
    isLoadingOptions,
    isSaving,
    error,
    fetchFormOptions,
    createCourse,
  };
}
