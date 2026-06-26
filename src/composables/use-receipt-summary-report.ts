import { ref } from 'vue';
import { AxiosError } from 'axios';
import { api } from 'src/boot/axios';
import type {
  ReceiptSummaryFilters,
  ReceiptSummaryItem,
  ReceiptSummaryResponse,
} from 'src/types/receipt-summary-report';

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string') return message;
  }
  if (error instanceof Error) return error.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

function createEmptyFilters(): ReceiptSummaryFilters {
  return {
    faculty: '',
    receiptDateStart: '',
    receiptDateEnd: '',
    effectiveDateStart: '',
    effectiveDateEnd: '',
  };
}

export function useReceiptSummaryReport() {
  const items = ref<ReceiptSummaryItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filters = ref<ReceiptSummaryFilters>(createEmptyFilters());

  async function fetchData(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const params: Record<string, string> = {};
      if (filters.value.faculty) params.facName = filters.value.faculty;
      if (filters.value.receiptDateStart) params.receiptDateStart = filters.value.receiptDateStart;
      if (filters.value.receiptDateEnd) params.receiptDateEnd = filters.value.receiptDateEnd;
      if (filters.value.effectiveDateStart)
        params.effectiveDateStart = filters.value.effectiveDateStart;
      if (filters.value.effectiveDateEnd) params.effectiveDateEnd = filters.value.effectiveDateEnd;

      const { data } = await api.get<ReceiptSummaryResponse>(
        '/api/centralfinance/receipt-summary',
        { params },
      );
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
  }

  return { items, isLoading, error, filters, fetchData, clearFilters };
}
