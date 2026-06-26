<template>
  <div
    class="base-rating-stars"
    :class="{ 'base-rating-stars--interactive': !readonly }"
    role="group"
    :aria-label="readonly ? `${modelValue} out of ${count} stars` : 'Rating'"
  >
    <button
      v-for="star in count"
      :key="star"
      type="button"
      class="base-rating-stars__star"
      :class="{ 'base-rating-stars__star--readonly': readonly }"
      :disabled="readonly"
      :aria-label="`${star} star${star > 1 ? 's' : ''}`"
      :aria-pressed="!readonly ? modelValue >= star : undefined"
      @click="!readonly && emit('update:modelValue', star)"
      @keydown.right.prevent="
        !readonly && emit('update:modelValue', Math.min(count, modelValue + 1))
      "
      @keydown.left.prevent="!readonly && emit('update:modelValue', Math.max(0, modelValue - 1))"
    >
      <q-icon :name="getStarIcon(star)" :size="size" :class="getStarClass(star)" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number;
  readonly?: boolean;
  size?: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  size: '24px',
  count: 5,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
}>();

function getStarIcon(star: number): string {
  if (props.modelValue >= star) return 'star';
  if (props.modelValue >= star - 0.5) return 'star_half';
  return 'star_border';
}

function getStarClass(star: number): string {
  if (props.modelValue >= star - 0.5) return 'base-rating-stars__icon--filled';
  return 'base-rating-stars__icon--empty';
}
</script>

<style lang="scss" scoped>
.base-rating-stars {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.base-rating-stars__star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  background: transparent;
  border: none;
  cursor: default;
  border-radius: var(--radius-xs);
  outline: none;
  line-height: 1;
  transition: transform 0.15s ease;

  .base-rating-stars--interactive &:not(:disabled) {
    cursor: pointer;

    &:hover,
    &:focus-visible {
      transform: scale(1.2);
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px var(--q-primary);
    }
  }
}

.base-rating-stars__star--readonly,
.base-rating-stars__star:disabled {
  cursor: default !important;
  opacity: 1 !important;
}

.base-rating-stars__icon--filled {
  color: var(--color-gold-light);
}

.base-rating-stars__icon--empty {
  color: var(--color-text-4);
}
</style>
