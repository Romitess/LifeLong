<template>
  <BaseSystemDialog
    v-model="dialogModel"
    :title="isEdit ? $t('courseReview.editDialogTitle') : $t('courseReview.writeDialogTitle')"
    :hide-cancel="false"
    :confirm-label="$t('courseReview.submitBtn')"
    :cancel-label="$t('courseReview.cancelBtn')"
    :loading="isSubmitting"
    variant="confirm"
    icon="rate_review"
    width="480px"
    :persistent="true"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <div class="review-dialog__body">
      <!-- Star rating -->
      <div class="review-dialog__field">
        <label class="review-dialog__label">
          {{ $t('courseReview.ratingLabel') }}
          <span class="review-dialog__required">*</span>
        </label>
        <div class="review-dialog__stars">
          <BaseRatingStars v-model="localRating" :readonly="false" size="32px" />
          <span v-if="ratingError" class="review-dialog__error">
            {{ $t('courseReview.ratingRequired') }}
          </span>
        </div>
      </div>

      <!-- Comment textarea -->
      <div class="review-dialog__field">
        <BaseInput
          v-model="localComment"
          :label="$t('courseReview.commentLabel')"
          type="textarea"
          :placeholder="$t('courseReview.commentPlaceholder')"
          outlined
          autogrow
          :maxlength="1000"
          counter
          rows="4"
          class="review-dialog__textarea"
        />
      </div>

      <div
        v-if="submitError"
        class="review-dialog__submit-error text-negative text-caption q-mt-xs"
      >
        {{ submitError }}
      </div>
    </div>
  </BaseSystemDialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';
import BaseRatingStars from 'components/base/BaseRatingStars.vue';
import BaseInput from 'components/base/BaseInput.vue';
import type { Review } from 'src/types/course-review';

interface Props {
  modelValue: boolean;
  existingReview?: Review | null;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  existingReview: null,
  isSubmitting: false,
  submitError: null,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', payload: { rating: number; comment: string }): void;
}>();

const localRating = ref(0);
const localComment = ref('');
const ratingError = ref(false);

const isEdit = computed(() => !!props.existingReview);

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// Prefill when dialog opens or existingReview changes
watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localRating.value = props.existingReview?.rating ?? 0;
      localComment.value = props.existingReview?.comment ?? '';
      ratingError.value = false;
    }
  },
);

function onConfirm(): void {
  if (localRating.value < 1) {
    ratingError.value = true;
    return;
  }
  ratingError.value = false;
  emit('submit', { rating: localRating.value, comment: localComment.value.trim() });
}

function onCancel(): void {
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.review-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.review-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.review-dialog__label {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--admin-navy, var(--color-text-1));
}

.review-dialog__required {
  color: var(--q-negative);
  margin-left: 2px;
}

.review-dialog__stars {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-dialog__error {
  color: var(--q-negative);
  font-size: 0.8rem;
}

.review-dialog__textarea :deep(.q-field__native) {
  resize: none;
}

.review-dialog__submit-error {
  padding: 4px 0;
}
</style>
