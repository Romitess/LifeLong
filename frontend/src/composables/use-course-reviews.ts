import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type {
  Review,
  ReviewListResponse,
  ReviewListParams,
  ReviewSummary,
  MyReviewResponse,
  ModerationListResponse,
  ModerationReview,
  ReviewModerationStatus,
  ReviewSubmitPayload,
} from 'src/types/course-review';

function extractErrorMessage(error: unknown): string {
  const err = error as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  if (typeof err?.message === 'string') return err.message;
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

interface UseCourseReviewsReturn {
  items: Ref<Review[]>;
  summary: Ref<ReviewSummary | null>;
  total: Ref<number>;
  page: Ref<number>;
  limit: Ref<number>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  fetchReviews: (courseId: number | string, params?: ReviewListParams) => Promise<void>;

  myReview: Ref<MyReviewResponse | null>;
  isMyReviewLoading: Ref<boolean>;
  fetchMyReview: (courseId: number | string) => Promise<void>;

  isSubmitting: Ref<boolean>;
  submitError: Ref<string | null>;
  submitReview: (
    courseId: number | string,
    payload: ReviewSubmitPayload,
    isEdit: boolean,
  ) => Promise<Review | null>;
  deleteReview: (courseId: number | string) => Promise<boolean>;
}

export function useCourseReviews(): UseCourseReviewsReturn {
  // Public list state
  const items = ref<Review[]>([]);
  const summary = ref<ReviewSummary | null>(null);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // My review state
  const myReview = ref<MyReviewResponse | null>(null);
  const isMyReviewLoading = ref(false);

  // Submit / delete state
  const isSubmitting = ref(false);
  const submitError = ref<string | null>(null);

  async function fetchReviews(
    courseId: number | string,
    params: ReviewListParams = {},
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ReviewListResponse>(`/api/courses/${courseId}/reviews`, {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          sort: params.sort ?? 'newest',
          ...(params.rating ? { rating: params.rating } : {}),
        },
      });
      items.value = data.items;
      summary.value = data.summary;
      total.value = data.total;
      page.value = data.page;
      limit.value = data.limit;
    } catch (err) {
      error.value = extractErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyReview(courseId: number | string): Promise<void> {
    isMyReviewLoading.value = true;
    try {
      const { data } = await api.get<MyReviewResponse>(`/api/courses/${courseId}/reviews/me`);
      myReview.value = data;
    } catch {
      myReview.value = null;
    } finally {
      isMyReviewLoading.value = false;
    }
  }

  async function submitReview(
    courseId: number | string,
    payload: ReviewSubmitPayload,
    isEdit: boolean,
  ): Promise<Review | null> {
    isSubmitting.value = true;
    submitError.value = null;
    try {
      const { data } = await api[isEdit ? 'patch' : 'post']<Review>(
        isEdit ? `/api/courses/${courseId}/reviews/me` : `/api/courses/${courseId}/reviews`,
        payload,
      );
      return data;
    } catch (err) {
      submitError.value = extractErrorMessage(err);
      return null;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function deleteReview(courseId: number | string): Promise<boolean> {
    isSubmitting.value = true;
    submitError.value = null;
    try {
      await api.delete(`/api/courses/${courseId}/reviews/me`);
      return true;
    } catch (err) {
      submitError.value = extractErrorMessage(err);
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    items,
    summary,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchReviews,
    myReview,
    isMyReviewLoading,
    fetchMyReview,
    isSubmitting,
    submitError,
    submitReview,
    deleteReview,
  };
}

// ── Admin moderation composable ─────────────────────────────────

interface UseAdminReviewsReturn {
  items: Ref<ModerationReview[]>;
  total: Ref<number>;
  page: Ref<number>;
  limit: Ref<number>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  fetchReviews: (params?: {
    page?: number;
    limit?: number;
    status?: ReviewModerationStatus;
  }) => Promise<void>;
  updateStatus: (id: number, status: ReviewModerationStatus) => Promise<boolean>;
  isUpdating: Ref<boolean>;
}

export function useAdminReviews(): UseAdminReviewsReturn {
  const items = ref<ModerationReview[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isUpdating = ref(false);

  async function fetchReviews(
    params: {
      page?: number;
      limit?: number;
      status?: ReviewModerationStatus;
    } = {},
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<ModerationListResponse>('/api/admin/reviews', {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          ...(params.status ? { status: params.status } : {}),
        },
      });
      items.value = data.items;
      total.value = data.total;
      page.value = data.page;
      limit.value = data.limit;
    } catch (err) {
      error.value = extractErrorMessage(err);
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStatus(id: number, status: ReviewModerationStatus): Promise<boolean> {
    isUpdating.value = true;
    try {
      await api.patch(`/api/admin/reviews/${id}/status`, { status });
      const item = items.value.find((r) => r.id === id);
      if (item) item.status = status;
      return true;
    } catch {
      return false;
    } finally {
      isUpdating.value = false;
    }
  }

  return { items, total, page, limit, isLoading, error, fetchReviews, updateStatus, isUpdating };
}
