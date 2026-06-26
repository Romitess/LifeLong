// ── Course Review Types ─────────────────────────────────────────
// Matches the backend API contract exactly.

export interface ReviewerInfo {
  name: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createDate: string | null;
  reviewer: ReviewerInfo;
}

export interface ReviewDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: ReviewDistribution;
}

export interface ReviewListResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  summary: ReviewSummary;
}

export type ReviewSortOption = 'newest' | 'highest' | 'lowest';

export interface ReviewListParams {
  page?: number;
  limit?: number;
  sort?: ReviewSortOption;
  rating?: number;
}

// My-review eligibility response
export interface MyReviewResponse {
  canReview: boolean;
  reason: 'NOT_ENROLLED' | 'NOT_COMPLETED' | null;
  review: Review | null;
}

// Admin moderation review item
export type ReviewModerationStatus = 'A' | 'P' | 'H';

export interface ModerationReview {
  id: number;
  rating: number;
  comment: string | null;
  status: ReviewModerationStatus;
  courseId: number;
  createDate: string | null;
  reviewer: ReviewerInfo;
}

export interface ModerationListResponse {
  items: ModerationReview[];
  total: number;
  page: number;
  limit: number;
}

// Upsert / submit payload
export interface ReviewSubmitPayload {
  rating: number;
  comment?: string;
}
