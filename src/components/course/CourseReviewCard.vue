<template>
  <div class="review-card" :class="{ 'review-card--mine': isMine }">
    <div class="review-card__header">
      <q-avatar size="40px" class="review-card__avatar" :aria-label="review.reviewer.name">
        <span class="review-card__avatar-text">{{ initial }}</span>
      </q-avatar>
      <div class="review-card__meta">
        <div class="review-card__name text-weight-bold">
          {{ review.reviewer.name }}
          <q-badge v-if="isMine" color="primary" class="review-card__mine-badge q-ml-xs">
            {{ $t('courseReview.myReviewBadge') }}
          </q-badge>
        </div>
        <div class="review-card__date text-caption">
          {{ formattedDate }}
        </div>
      </div>
      <div class="review-card__stars">
        <BaseRatingStars :model-value="review.rating" readonly size="16px" />
      </div>
    </div>
    <p v-if="review.comment" class="review-card__comment">{{ review.comment }}</p>

    <!-- Edit / Delete actions (only for own review) -->
    <div v-if="isMine && showActions" class="review-card__actions">
      <BaseButton
        outline
        no-caps
        size="sm"
        color="primary"
        icon="edit"
        class="review-card__action-btn"
        :label="$t('courseReview.editReview')"
        @click="emit('edit')"
      />
      <BaseButton
        outline
        no-caps
        size="sm"
        color="negative"
        icon="delete"
        class="review-card__action-btn"
        :label="$t('courseReview.deleteReview')"
        @click="emit('delete')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseRatingStars from 'components/base/BaseRatingStars.vue';
import BaseButton from 'components/base/BaseButton.vue';
import type { Review } from 'src/types/course-review';

interface Props {
  review: Review;
  isMine?: boolean;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMine: false,
  showActions: false,
});

const emit = defineEmits<{
  (event: 'edit'): void;
  (event: 'delete'): void;
}>();

const { locale } = useI18n({ useScope: 'global' });

const initial = computed(() => {
  const name = props.review.reviewer.name ?? '';
  return name.charAt(0).toUpperCase() || '?';
});

const formattedDate = computed(() => {
  if (!props.review.createDate) return '';
  try {
    const date = new Date(props.review.createDate);
    return date.toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return props.review.createDate;
  }
});
</script>

<style lang="scss" scoped>
.review-card {
  padding: 16px;
  border-radius: var(--radius-md);
  background: var(--color-card);
  border: 1px solid var(--color-border-subtle);
  transition: box-shadow 0.2s ease;

  &--mine {
    border-color: var(--color-border-subtle);
    background: var(--color-card);
  }
}

.review-card__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.review-card__avatar {
  background: var(--grad-brand);
  flex-shrink: 0;
}

.review-card__avatar-text {
  color: var(--color-on-dark);
  font-size: 1rem;
  font-weight: 700;
}

.review-card__meta {
  flex: 1;
  min-width: 0;
}

.review-card__name {
  font-size: 0.92rem;
  color: var(--color-text-1);
  line-height: 1.3;
}

.review-card__date {
  color: var(--color-text-3);
  margin-top: 2px;
}

.review-card__stars {
  flex-shrink: 0;
}

.review-card__mine-badge {
  font-size: 0.65rem;
  padding: 2px 6px;
  vertical-align: middle;
}

.review-card__comment {
  margin: 10px 0 0;
  font-size: 0.9rem;
  color: var(--color-text-2);
  line-height: 1.6;
  white-space: pre-line;
}

.review-card__actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.review-card__action-btn {
  background: var(--color-card);
}
</style>
