import { ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  AdminCertTemplateItem,
  AdminCertTemplatesPagination,
  AdminCertTemplatesResponse,
} from 'src/types/admin-cert-templates';

export interface FetchCertTemplatesOptions {
  page?: number;
  pageSize?: number;
  search?: string | null;
}

function createEmptyPagination(): AdminCertTemplatesPagination {
  return { page: 1, pageSize: 10, total: 0, totalPages: 0 };
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

export function useAdminCertTemplates() {
  const items = ref<AdminCertTemplateItem[]>([]);
  const pagination = ref<AdminCertTemplatesPagination>(createEmptyPagination());
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let latestRequestId = 0;

  async function fetchData(options: FetchCertTemplatesOptions = {}): Promise<void> {
    const requestId = ++latestRequestId;
    isLoading.value = true;
    error.value = null;

    const page = options.page ?? pagination.value.page ?? 1;
    const pageSize = options.pageSize ?? pagination.value.pageSize ?? 10;

    try {
      const { data } = await api.get<AdminCertTemplatesResponse>('/api/admin/cert-templates', {
        params: {
          page,
          pageSize,
          search: options.search || undefined,
        },
      });

      if (requestId !== latestRequestId) return;

      items.value = data.items;
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

  async function createTemplate(formData: FormData): Promise<AdminCertTemplateItem> {
    const { data } = await api.post<AdminCertTemplateItem>('/api/admin/cert-templates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  async function updateTemplate(id: number, formData: FormData): Promise<AdminCertTemplateItem> {
    const { data } = await api.patch<AdminCertTemplateItem>(
      `/api/admin/cert-templates/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  }

  async function removeTemplate(id: number): Promise<void> {
    await api.delete(`/api/admin/cert-templates/${id}`);
    items.value = items.value.filter((item) => item.id !== id);
    pagination.value = { ...pagination.value, total: Math.max(0, pagination.value.total - 1) };
  }

  return {
    items,
    pagination,
    isLoading,
    error,
    fetchData,
    createTemplate,
    updateTemplate,
    removeTemplate,
  };
}
