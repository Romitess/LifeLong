import { computed, ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  AdminCourseInterestReportItem,
  AdminCourseInterestReportPagination,
  AdminCourseInterestReportResponse,
  AdminCourseInterestReportSummary,
} from 'src/types/admin-course-interest-report';

interface FetchReportOptions {
  page?: number;
  pageSize?: number;
  search?: string;
}

function createEmptyPagination(): AdminCourseInterestReportPagination {
  return {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };
}

function createEmptySummary(): AdminCourseInterestReportSummary {
  return {
    totalCourses: 0,
    totalViews: 0,
    totalEnrollments: 0,
  };
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

export function useAdminCourseInterestReport() {
  const items = ref<AdminCourseInterestReportItem[]>([]);
  const summary = ref<AdminCourseInterestReportSummary>(createEmptySummary());
  const pagination = ref<AdminCourseInterestReportPagination>(createEmptyPagination());
  const generatedAt = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let latestRequestId = 0;

  const hasRows = computed(() => items.value.length > 0);

  async function fetchData(options: FetchReportOptions = {}): Promise<void> {
    const requestId = ++latestRequestId;
    isLoading.value = true;
    error.value = null;

    const page = options.page ?? pagination.value.page ?? 1;
    const pageSize = options.pageSize ?? pagination.value.pageSize ?? 10;
    const search = options.search ?? '';

    try {
      const { data } = await api.get<AdminCourseInterestReportResponse>(
        '/api/admin/reports/interested-courses',
        {
          params: {
            page,
            pageSize,
            search: search.trim() || undefined,
          },
        },
      );

      if (requestId !== latestRequestId) {
        return;
      }

      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
      generatedAt.value = data.generatedAt;
    } catch (caughtError: unknown) {
      if (requestId !== latestRequestId) {
        return;
      }

      items.value = [];
      summary.value = createEmptySummary();
      pagination.value = {
        ...createEmptyPagination(),
        page,
        pageSize,
      };
      generatedAt.value = null;
      error.value = extractErrorMessage(caughtError);
      throw caughtError;
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
      }
    }
  }

  return {
    items,
    summary,
    pagination,
    generatedAt,
    isLoading,
    error,
    hasRows,
    fetchData,
  };
}
