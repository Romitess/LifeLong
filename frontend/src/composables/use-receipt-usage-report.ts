import { ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  ReceiptUsageFilters,
  ReceiptUsageItem,
  ReceiptUsageResponse,
} from 'src/types/receipt-usage-report';

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

function createEmptyFilters(): ReceiptUsageFilters {
  return {
    fiscalYear: '',
    receiptDateStart: '',
    receiptDateEnd: '',
    faculty: '',
    courseName: '',
    customerName: '',
    collector: '',
    receiptNo: '',
    status: '',
  };
}

export interface FacultyOption {
  id: number;
  name: string;
  nameEn: string | null;
}

export function useReceiptUsageReport() {
  const items = ref<ReceiptUsageItem[]>([]);
  const facultyOptions = ref<FacultyOption[]>([]);
  const isLoading = ref(false);
  const isFacultyLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<ReceiptUsageFilters>(createEmptyFilters());

  async function fetchFacultyOptions(): Promise<void> {
    isFacultyLoading.value = true;
    try {
      const { data } = await api.get<FacultyOption[]>(
        '/api/centralfinance/receipt-usage/faculty-options',
      );
      facultyOptions.value = data;
    } catch {
      facultyOptions.value = [];
    } finally {
      isFacultyLoading.value = false;
    }
  }

  async function fetchData(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const params: Record<string, string> = {};
      if (filters.value.fiscalYear) params.fiscalYear = filters.value.fiscalYear;
      if (filters.value.receiptDateStart) params.receiptDateStart = filters.value.receiptDateStart;
      if (filters.value.receiptDateEnd) params.receiptDateEnd = filters.value.receiptDateEnd;
      if (filters.value.faculty) params.facName = filters.value.faculty;
      if (filters.value.courseName) params.courseName = filters.value.courseName;
      if (filters.value.customerName) params.customerName = filters.value.customerName;
      if (filters.value.collector) params.collector = filters.value.collector;
      if (filters.value.receiptNo) params.receiptNo = filters.value.receiptNo;
      if (filters.value.status) params.status = filters.value.status;

      const { data } = await api.get<ReceiptUsageResponse>('/api/centralfinance/receipt-usage', {
        params,
      });
      items.value = data.data;
    } catch (caughtError: unknown) {
      items.value = [];
      error.value = extractErrorMessage(caughtError);
    } finally {
      isLoading.value = false;
    }
  }

  function clearFilters(): void {
    filters.value = createEmptyFilters();
    items.value = [];
    error.value = null;
  }

  return {
    items,
    facultyOptions,
    isLoading,
    isFacultyLoading,
    error,
    filters,
    fetchData,
    fetchFacultyOptions,
    clearFilters,
  };
}
