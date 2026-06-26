<template>
  <div class="review-summary">
    <!-- Average score -->
    <div class="review-summary__score">
      <div class="review-summary__average" aria-label="`${summary.average} out of 5`">
        {{ formattedAverage }}
      </div>
      <div class="review-summary__stars">
        <BaseRatingStars :model-value="summary.average" readonly size="20px" />
      </div>
      <div class="review-summary__total text-caption">
        {{ $t('courseReview.totalReviews', { count: summary.total }) }}
      </div>
    </div>

    <!-- Distribution bars -->
    <div class="review-summary__bars" aria-label="Rating distribution">
      <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="review-summary__bar-row">
        <span class="review-summary__bar-label">{{ star }}</span>
        <q-icon name="star" size="13px" class="review-summary__bar-icon" />
        <q-linear-progress
          :value="getBarValue(star)"
          track-color="grey-3"
          rounded
          size="8px"
          class="review-summary__bar"
          :aria-label="`${star} stars: ${getCount(star)} reviews`"
        />
        <span class="review-summary__bar-count text-caption">{{ getCount(star) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseRatingStars from 'components/base/BaseRatingStars.vue';
import type { ReviewSummary } from 'src/types/course-review';

interface Props {
  summary: ReviewSummary;
}

const props = defineProps<Props>();

const formattedAverage = computed(() =>
  props.summary.total > 0 ? props.summary.average.toFixed(1) : '—',
);

function getCount(star: number): number {
  return props.summary.distribution[String(star) as keyof ReviewSummary['distribution']] ?? 0;
}

function getBarValue(star: number): number {
  if (props.summary.total === 0) return 0;
  return getCount(star) / props.summary.total;
}
</script>

<style lang="scss" scoped>
.review-summary {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  flex-wrap: wrap;
}

.review-summary__score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}

.review-summary__average {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-1);
}

.review-summary__stars {
  display: flex;
}

.review-summary__total {
  color: var(--color-text-3);
  white-space: nowrap;
}

.review-summary__bars {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-summary__bar-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.review-summary__bar-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-text-2);
  min-width: 10px;
  text-align: right;
}

.review-summary__bar-icon {
  color: var(--color-gold-light);
  flex-shrink: 0;
}

.review-summary__bar {
  flex: 1;
  color: var(--color-gold-light);
}

.review-summary__bar-count {
  min-width: 24px;
  text-align: right;
  color: var(--color-text-3);
}
</style>
