<template>
  <div class="review-list">
    <!-- Controls -->
    <div class="review-list__controls">
      <BaseSelect
        v-model="localSort"
        :options="sortOptions"
        emit-value
        map-options
        option-label="label"
        option-value="value"
        :label="$t('courseReview.sortLabel')"
        class="review-list__sort"
        @update:model-value="onSortChange"
      />
      <BaseSelect
        v-model="localRating"
        :options="ratingOptions"
        emit-value
        map-options
        option-label="label"
        option-value="value"
        :label="$t('courseReview.filterByRating')"
        class="review-list__filter"
        @update:model-value="onRatingChange"
      >
        <template #option="{ itemProps, opt }">
          <q-item v-bind="itemProps">
            <q-item-section>
              <div class="row items-center no-wrap review-list__opt">
                <template v-if="opt.stars > 0">
                  <span class="q-mr-xs">{{ opt.stars }}</span>
                  <q-icon name="star" size="15px" class="review-list__opt-star" />
                </template>
                <span v-else>{{ opt.label }}</span>
              </div>
            </q-item-section>
          </q-item>
        </template>
        <template #selected-item="{ opt }">
          <div class="row items-center no-wrap review-list__opt">
            <template v-if="opt.stars > 0">
              <span class="q-mr-xs">{{ opt.stars }}</span>
              <q-icon name="star" size="15px" class="review-list__opt-star" />
            </template>
            <span v-else>{{ opt.label }}</span>
          </div>
        </template>
      </BaseSelect>
    </div>

    <!-- Loading state -->
    <template v-if="isLoading">
      <div v-for="n in 3" :key="n" class="review-list__skeleton">
        <q-skeleton type="rect" height="100px" class="full-width" />
      </div>
    </template>

    <!-- Error state -->
    <div v-else-if="error" class="review-list__error">
      <q-icon name="error_outline" size="2rem" color="negative" />
      <span class="text-caption text-negative q-ml-sm">{{ error }}</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="items.length === 0" class="review-list__empty">
      <q-icon name="rate_review" size="3rem" color="grey-4" />
      <p class="text-grey-6 q-mt-md">{{ $t('courseReview.noReviews') }}</p>
    </div>

    <!-- Review cards -->
    <template v-else>
      <CourseReviewCard
        v-for="review in items"
        :key="review.id"
        :review="review"
        :is-mine="myReviewId === review.id"
        :show-actions="myReviewId === review.id"
        class="review-list__card"
        @edit="emit('editReview', review)"
        @delete="emit('deleteReview', review)"
      />
    </template>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="review-list__pagination">
      <BasePagination
        :model-value="currentPage"
        :max="totalPages"
        :direction-links="true"
        :boundary-links="true"
        :boundary-numbers="true"
        :disable="isLoading"
        @update:model-value="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CourseReviewCard from './CourseReviewCard.vue';
import BaseSelect from 'components/base/BaseSelect.vue';
import BasePagination from 'components/base/BasePagination.vue';
import type { Review, ReviewSortOption } from 'src/types/course-review';

interface Props {
  items: Review[];
  isLoading?: boolean;
  error?: string | null;
  currentPage: number;
  totalPages: number;
  myReviewId?: number | null;
  initialSort?: ReviewSortOption;
  initialRating?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  error: null,
  myReviewId: null,
  initialSort: 'newest',
  initialRating: null,
});

const emit = defineEmits<{
  (event: 'pageChange', page: number): void;
  (event: 'sortChange', sort: ReviewSortOption): void;
  (event: 'ratingChange', rating: number | null): void;
  (event: 'editReview', review: Review): void;
  (event: 'deleteReview', review: Review): void;
}>();

const { t } = useI18n({ useScope: 'global' });

const localSort = ref<ReviewSortOption>(props.initialSort);
const localRating = ref<number | null>(props.initialRating);

const sortOptions = computed(() => [
  { label: t('courseReview.sortNewest'), value: 'newest' },
  { label: t('courseReview.sortHighest'), value: 'highest' },
  { label: t('courseReview.sortLowest'), value: 'lowest' },
]);

const ratingOptions = computed(() => [
  { label: t('courseReview.allRatings'), value: null, stars: 0 },
  { label: '5', value: 5, stars: 5 },
  { label: '4', value: 4, stars: 4 },
  { label: '3', value: 3, stars: 3 },
  { label: '2', value: 2, stars: 2 },
  { label: '1', value: 1, stars: 1 },
]);

function onSortChange(val: unknown): void {
  emit('sortChange', val as ReviewSortOption);
}

function onRatingChange(val: unknown): void {
  emit('ratingChange', val as number | null);
}

function onPageChange(page: number): void {
  emit('pageChange', page);
}
</script>

<style lang="scss" scoped>
.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-list__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
}

.review-list__sort,
.review-list__filter {
  width: 180px;
}

.review-list__opt-star {
  color: var(--color-gold-light);
}

.review-list__skeleton {
  border-radius: var(--radius-md);
  overflow: hidden;
}

.review-list__error {
  display: flex;
  align-items: center;
  padding: 20px;
}

.review-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.review-list__card {
  margin-bottom: 4px;
}

.review-list__pagination {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

@media (max-width: 480px) {
  .review-list__sort,
  .review-list__filter {
    width: 100%;
  }
}
</style>
