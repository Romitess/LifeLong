import { computed, ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  AdminRegistrationStatisticsReportFacultyGroup,
  AdminRegistrationStatisticsReportFilterOptions,
  AdminRegistrationStatisticsReportPagination,
  AdminRegistrationStatisticsReportResponse,
  AdminRegistrationStatisticsReportSummary,
} from 'src/types/admin-registration-statistics-report';

interface FetchReportOptions {
  page?: number;
  pageSize?: number;
  startDate?: string | null;
  endDate?: string | null;
  facultyId?: number | null;
  typeCourseId?: number | null;
}

function createEmptyPagination(): AdminRegistrationStatisticsReportPagination {
  return {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  };
}

function createEmptySummary(): AdminRegistrationStatisticsReportSummary {
  return {
    totalCourses: 0,
    totalLearners: 0,
    totalRegistrationFees: 0,
  };
}

function createEmptyFilterOptions(): AdminRegistrationStatisticsReportFilterOptions {
  return {
    faculties: [],
    courseTypes: [],
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

export function useAdminRegistrationStatisticsReport() {
  const groups = ref<AdminRegistrationStatisticsReportFacultyGroup[]>([]);
  const filterOptions = ref<AdminRegistrationStatisticsReportFilterOptions>(
    createEmptyFilterOptions(),
  );
  const summary = ref<AdminRegistrationStatisticsReportSummary>(createEmptySummary());
  const pagination = ref<AdminRegistrationStatisticsReportPagination>(createEmptyPagination());
  const generatedAt = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let latestRequestId = 0;

  const hasRows = computed(() => groups.value.some((group) => group.items.length > 0));

  async function fetchData(options: FetchReportOptions = {}): Promise<void> {
    const requestId = ++latestRequestId;
    isLoading.value = true;
    error.value = null;

    const page = options.page ?? pagination.value.page ?? 1;
    const pageSize = options.pageSize ?? pagination.value.pageSize ?? 10;

    try {
      const { data } = await api.get<AdminRegistrationStatisticsReportResponse>(
        '/api/admin/reports/registration-statistics',
        {
          params: {
            page,
            pageSize,
            startDate: options.startDate || undefined,
            endDate: options.endDate || undefined,
            facultyId: options.facultyId ?? undefined,
            typeCourseId: options.typeCourseId ?? undefined,
          },
        },
      );

      if (requestId !== latestRequestId) {
        return;
      }

      groups.value = data.groups;
      filterOptions.value = data.filterOptions;
      summary.value = data.summary;
      pagination.value = data.pagination;
      generatedAt.value = data.generatedAt;
    } catch (caughtError: unknown) {
      if (requestId !== latestRequestId) {
        return;
      }

      groups.value = [];
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
    groups,
    filterOptions,
    summary,
    pagination,
    generatedAt,
    isLoading,
    error,
    hasRows,
    fetchData,
  };
}
