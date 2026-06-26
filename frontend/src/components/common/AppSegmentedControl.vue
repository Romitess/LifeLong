<template>
  <q-btn-toggle
    v-model="model"
    v-bind="$attrs"
    class="app-segmented-control"
    no-caps
    dense
    unelevated
    :options="options"
    :toggle-color="toggleColor"
    :text-color="textColor"
  />
</template>

<script setup lang="ts">
type AppSegmentedValue = string | number | boolean;

interface AppSegmentedOption {
  label?: string;
  value: AppSegmentedValue;
  icon?: string;
  slot?: string;
  disable?: boolean;
}

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    options: AppSegmentedOption[];
    toggleColor?: string;
    textColor?: string;
  }>(),
  {
    toggleColor: 'primary',
    textColor: 'grey-8',
  },
);

const model = defineModel<AppSegmentedValue | null>();
</script>

<style scoped lang="scss">
.app-segmented-control {
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.04);
  padding: 4px;

  :deep(.q-btn) {
    border-radius: 8px !important;
    min-height: 32px;
    padding: 0 14px;
    font-size: 0.78rem;
    box-shadow: none !important;
  }

  :deep(.q-btn--active) {
    box-shadow: none !important;
  }
}
</style>
