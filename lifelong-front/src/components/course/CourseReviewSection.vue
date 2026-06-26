<template>
  <section class="review-section">
    <div class="section-container">
      <q-card flat bordered class="review-section__card">
        <q-card-section class="review-section__header">
          <div class="review-section__heading">
            <div class="review-section__eyebrow">
              {{ $t('courseReview.eyebrow') }}
            </div>
            <h2 class="review-section__title">{{ $t('courseReview.title') }}</h2>
          </div>

          <!-- Write-review CTA (logged in + eligible) -->
          <BaseButton
            v-if="authStore.isLoggedIn && myReviewData?.canReview && !myReviewData?.review"
            unelevated
            color="primary"
            no-caps
            icon="rate_review"
            :label="$t('courseReview.writeBtn')"
            @click="openWriteDialog"
          />

          <!-- Edit own review CTA (already has review) -->
          <BaseButton
            v-else-if="authStore.isLoggedIn && myReviewData?.review"
            outline
            color="primary"
            no-caps
            icon="edit"
            :label="$t('courseReview.editBtn')"
            @click="openEditDialog"
          />
        </q-card-section>

        <q-card-section class="review-section__body">
          <!-- Summary skeleton -->
          <div v-if="isMyReviewLoading || summaryLoading" class="review-section__summary-skeleton">
            <q-skeleton type="rect" height="80px" class="full-width" />
          </div>

          <!-- Summary -->
          <CourseReviewSummary
            v-else-if="summary && summary.total > 0"
            :summary="summary"
            class="q-mb-lg"
          />

          <!-- Not completed hint -->
          <q-banner
            v-if="authStore.isLoggedIn && myReviewData?.reason === 'NOT_COMPLETED'"
            dense
            rounded
            class="review-section__hint q-mb-md"
          >
            <template #avatar>
              <q-icon name="info" color="warning" />
            </template>
            {{ $t('courseReview.notCompletedHint') }}
          </q-banner>

          <!-- Login prompt (not logged in) -->
          <q-banner
            v-if="!authStore.isLoggedIn"
            dense
            rounded
            class="review-section__login-banner q-mb-md"
          >
            <template #avatar>
              <q-icon name="login" color="primary" />
            </template>
            {{ $t('courseReview.loginPrompt') }}
            <template #action>
              <q-btn flat no-caps color="primary" :label="$t('login')" to="/login" />
            </template>
          </q-banner>

          <!-- Own review card (highlighted) -->
          <div v-if="myReviewData?.review" class="q-mb-md">
            <p class="text-caption text-grey-6 q-mb-sm">{{ $t('courseReview.yourReview') }}</p>
            <CourseReviewCard
              :review="myReviewData.review"
              :is-mine="true"
              :show-actions="true"
              @edit="openEditDialog"
              @delete="showDeleteConfirm = true"
            />
          </div>

          <!-- List of all reviews -->
          <CourseReviewList
            :items="items"
            :is-loading="isLoading"
            :error="error"
            :current-page="currentPage"
            :total-pages="totalPages"
            :my-review-id="myReviewData?.review?.id ?? null"
            :initial-sort="sort"
            :initial-rating="ratingFilter"
            @page-change="onPageChange"
            @sort-change="onSortChange"
            @rating-change="onRatingChange"
            @edit-review="openEditDialog"
            @delete-review="onDeleteFromList"
          />
        </q-card-section>
      </q-card>
    </div>

    <!-- Write / Edit Dialog -->
    <CourseReviewDialog
      v-model="showReviewDialog"
      :existing-review="dialogEditReview"
      :is-submitting="isSubmitting"
      :submit-error="submitError"
      @submit="onDialogSubmit"
    />

    <!-- Delete confirm dialog -->
    <BaseConfirmDialog
      v-model="showDeleteConfirm"
      :title="$t('courseReview.deleteTitle')"
      :message="$t('courseReview.deleteMessage')"
      :confirm-label="$t('courseReview.deleteConfirmBtn')"
      :cancel-label="$t('courseReview.cancelBtn')"
      confirm-icon="delete"
      confirm-color="negative"
      @confirm="onConfirmDelete"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseReviews } from 'src/composables/use-course-reviews';
import CourseReviewSummary from './CourseReviewSummary.vue';
import CourseReviewCard from './CourseReviewCard.vue';
import CourseReviewList from './CourseReviewList.vue';
import CourseReviewDialog from './CourseReviewDialog.vue';
import BaseButton from 'components/base/BaseButton.vue';
import BaseConfirmDialog from 'components/base/BaseConfirmDialog.vue';
import type { Review, ReviewSortOption } from 'src/types/course-review';

interface Props {
  courseId: number | string;
}

const props = defineProps<Props>();

const $q = useQuasar();
const { t } = useI18n({ useScope: 'global' });
const authStore = useAuthStore();

const {
  items,
  summary,
  total,
  page,
  limit,
  isLoading,
  error,
  fetchReviews,
  myReview: myReviewData,
  isMyReviewLoading,
  fetchMyReview,
  isSubmitting,
  submitError,
  submitReview,
  deleteReview,
} = useCourseReviews();

const sort = ref<ReviewSortOption>('newest');
const ratingFilter = ref<number | null>(null);
const summaryLoading = ref(false);

// Dialog state
const showReviewDialog = ref(false);
const dialogEditReview = ref<Review | null>(null);
const showDeleteConfirm = ref(false);

const currentPage = computed(() => page.value);
const totalPages = computed(() => (total.value > 0 ? Math.ceil(total.value / limit.value) : 1));

async function loadReviews(p = 1): Promise<void> {
  await fetchReviews(props.courseId, {
    page: p,
    limit: 10,
    sort: sort.value,
    ...(ratingFilter.value ? { rating: ratingFilter.value } : {}),
  });
}

async function loadMyReview(): Promise<void> {
  if (!authStore.isLoggedIn) return;
  await fetchMyReview(props.courseId);
}

onMounted(async () => {
  summaryLoading.value = true;
  await Promise.all([loadReviews(), loadMyReview()]);
  summaryLoading.value = false;
});

// Re-fetch my review when login state changes
watch(
  () => authStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) void loadMyReview();
    else myReviewData.value = null;
  },
);

function onPageChange(p: number): void {
  void loadReviews(p);
}

function onSortChange(s: ReviewSortOption): void {
  sort.value = s;
  void loadReviews(1);
}

function onRatingChange(r: number | null): void {
  ratingFilter.value = r;
  void loadReviews(1);
}

function openWriteDialog(): void {
  dialogEditReview.value = null;
  showReviewDialog.value = true;
}

function openEditDialog(): void {
  dialogEditReview.value = myReviewData.value?.review ?? null;
  showReviewDialog.value = true;
}

function onDeleteFromList(): void {
  showDeleteConfirm.value = true;
}

async function onDialogSubmit(payload: { rating: number; comment: string }): Promise<void> {
  const isEdit = !!myReviewData.value?.review;
  const result = await submitReview(props.courseId, payload, isEdit);
  if (result) {
    showReviewDialog.value = false;
    $q.notify({
      type: 'positive',
      message: t(isEdit ? 'courseReview.editSuccess' : 'courseReview.submitSuccess'),
      position: 'top',
    });
    await Promise.all([loadReviews(1), loadMyReview()]);
  }
}

async function onConfirmDelete(): Promise<void> {
  const ok = await deleteReview(props.courseId);
  if (ok) {
    $q.notify({
      type: 'positive',
      message: t('courseReview.deleteSuccess'),
      position: 'top',
    });
    await Promise.all([loadReviews(1), loadMyReview()]);
  } else {
    $q.notify({
      type: 'negative',
      message: t('courseReview.deleteError'),
      position: 'top',
    });
  }
}
</script>

<style lang="scss" scoped>
.review-section {
  padding: 0 0 48px;
}

.review-section__card {
  border-radius: var(--radius-lg) !important;
  border: 1px solid var(--color-border-subtle) !important;
}

.review-section__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 28px 20px;
}

.review-section__eyebrow {
  color: var(--color-text-3);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.review-section__title {
  margin: 4px 0 0;
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 800;
  color: var(--color-text-1);
  line-height: 1.2;
}

.review-section__body {
  padding: 0 28px 28px;
}

.review-section__summary-skeleton {
  margin-bottom: 24px;
}

.review-section__hint {
  background: rgba(245, 166, 35, 0.08);
  color: var(--color-text-2);
  border-radius: var(--radius-md);
}

.review-section__login-banner {
  background: var(--color-overlay);
  border-radius: var(--radius-md);
}

@media (max-width: 600px) {
  .review-section__header,
  .review-section__body {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
