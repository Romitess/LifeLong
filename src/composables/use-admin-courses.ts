import { computed, ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  AdminCourseDetail,
  AdminCourseFormOptions,
  AdminCourseItem,
  AdminCoursesFilterOptions,
  AdminCoursesPagination,
  AdminCoursesResponse,
} from 'src/types/admin-courses';

export interface FetchCoursesOptions {
  page?: number;
  pageSize?: number;
  courseName?: string | null;
  facultyId?: number | null;
  typeCourseId?: number | null;
  search?: string | null;
  feeType?: 'free' | 'paid' | null;
}

function createEmptyPagination(): AdminCoursesPagination {
  return { page: 1, pageSize: 10, total: 0, totalPages: 0 };
}

function createEmptyFilterOptions(): AdminCoursesFilterOptions {
  return { faculties: [], courseTypes: [] };
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

export function useAdminCourses() {
  const items = ref<AdminCourseItem[]>([]);
  const filterOptions = ref<AdminCoursesFilterOptions>(createEmptyFilterOptions());
  const pagination = ref<AdminCoursesPagination>(createEmptyPagination());
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let latestRequestId = 0;

  const isEmpty = computed(() => !isLoading.value && items.value.length === 0);

  async function fetchData(options: FetchCoursesOptions = {}): Promise<void> {
    const requestId = ++latestRequestId;
    isLoading.value = true;
    error.value = null;

    const page = options.page ?? pagination.value.page ?? 1;
    const pageSize = options.pageSize ?? pagination.value.pageSize ?? 10;

    try {
      const { data } = await api.get<AdminCoursesResponse>('/api/admin/courses', {
        params: {
          page,
          pageSize,
          courseName: options.courseName || undefined,
          facultyId: options.facultyId ?? undefined,
          typeCourseId: options.typeCourseId ?? undefined,
          search: options.search || undefined,
          feeType: options.feeType ?? undefined,
        },
      });

      if (requestId !== latestRequestId) return;

      items.value = data.items;
      filterOptions.value = data.filterOptions;
      pagination.value = data.pagination;
    } catch (caughtError: unknown) {
      if (requestId !== latestRequestId) return;

      items.value = [];
      pagination.value = { ...createEmptyPagination(), page, pageSize };
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
      }
    }
  }

  async function removeCourse(id: number): Promise<void> {
    await api.delete(`/api/admin/courses/${id}`);
    items.value = items.value.filter((item) => item.courseId !== id);
    pagination.value = { ...pagination.value, total: Math.max(0, pagination.value.total - 1) };
  }

  async function fetchCourseDetail(id: number): Promise<AdminCourseDetail> {
    const { data } = await api.get<AdminCourseDetail>(`/api/admin/courses/${id}`);
    return data;
  }

  const formOptions = ref<AdminCourseFormOptions | null>(null);

  async function fetchFormOptions(): Promise<void> {
    if (formOptions.value) return;
    const { data } = await api.get<AdminCourseFormOptions>('/api/admin/courses/form-options');
    formOptions.value = data;
  }

  async function updateCourse(id: number, payload: FormData): Promise<{ courseId: number }> {
    const { data } = await api.patch<{ courseId: number }>(`/api/admin/courses/${id}`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async function publishCourse(id: number): Promise<{ courseId: number; warnings: string[] }> {
    const { data } = await api.patch<{ courseId: number; warnings: string[] }>(
      `/api/admin/courses/${id}/publish`,
    );
    return data;
  }

  async function unpublishCourse(id: number): Promise<{ courseId: number }> {
    const { data } = await api.patch<{ courseId: number }>(`/api/admin/courses/${id}/unpublish`);
    return data;
  }

  async function copyCourse(id: number): Promise<{ courseId: number }> {
    const { data } = await api.post<{ courseId: number }>(`/api/admin/courses/${id}/copy`);
    return data;
  }

  async function retryMoodleSync(id: number): Promise<void> {
    await api.post(`/api/admin/courses/${id}/retry-moodle`);
  }

  return {
    items,
    filterOptions,
    pagination,
    isLoading,
    error,
    isEmpty,
    fetchData,
    removeCourse,
    fetchCourseDetail,
    updateCourse,
    publishCourse,
    unpublishCourse,
    copyCourse,
    retryMoodleSync,
    formOptions,
    fetchFormOptions,
  };
}
