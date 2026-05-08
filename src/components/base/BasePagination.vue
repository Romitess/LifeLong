<template>
  <q-pagination
    v-bind="$attrs"
    :model-value="modelValue"
    :max="max"
    :max-pages="maxPages"
    :gutter="gutter"
    :direction-links="directionLinks"
    :boundary-links="boundaryLinks"
    :color="color"
    :active-color="activeColor"
    :active-text-color="activeTextColor"
    :icon-prev="iconPrev"
    :icon-next="iconNext"
    flat
    round
    active-design="unelevated"
    class="base-pagination"
    @mousedown.prevent
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: number;
  max: number;
  maxPages?: number;
  gutter?: string;
  directionLinks?: boolean;
  boundaryLinks?: boolean;
  color?: string;
  activeColor?: string;
  activeTextColor?: string;
  iconPrev?: string;
  iconNext?: string;
}

withDefaults(defineProps<Props>(), {
  maxPages: 7,
  gutter: 'md',
  directionLinks: true,
  boundaryLinks: false,
  color: 'grey-7',
  activeColor: 'primary',
  activeTextColor: 'white',
  iconPrev: 'chevron_left',
  iconNext: 'chevron_right',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
}>();
</script>

<style lang="scss" scoped>
.base-pagination {
  :deep(.q-btn) {
    width: 40px;
    height: 40px;
    min-height: 40px;
    padding: 0;
    border-radius: 50% !important;
    font-weight: 600;
    transform: none !important;
    background-color: #ffffff !important;
    border: 1px solid #dce4ee !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      color 0.2s ease;

    &::before {
      display: none !important;
    }

    .q-btn__content {
      min-height: unset;
    }
  }

  :deep(.q-btn.q-btn--round[aria-current='true']) {
    background-color: var(--q-primary) !important;
    color: #ffffff !important;
    border-color: var(--q-primary) !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
  }

  :deep(.q-btn.q-btn--round:not([aria-current='true']):hover) {
    background-color: #ffffff !important;
    color: inherit !important;
    transform: translateY(-2px) !important;
    border-color: rgba(245, 166, 35, 0.24) !important;
    box-shadow:
      0 12px 24px rgba(17, 24, 39, 0.08),
      0 0 0 1px rgba(245, 166, 35, 0.08) !important;
  }

  :deep(.q-btn.q-btn--round .q-focus-helper) {
    opacity: 0 !important;
  }
}
</style>
