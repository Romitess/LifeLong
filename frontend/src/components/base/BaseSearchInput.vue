<template>
  <q-input
    :model-value="modelValue"
    outlined
    dense
    clearable
    class="base-search-input"
    :debounce="debounce"
    :placeholder="placeholder"
    @update:model-value="onUpdate"
    @clear="onClear"
  >
    <template #prepend>
      <q-icon name="search" color="grey-5" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  debounce?: number | string;
}

withDefaults(defineProps<Props>(), {
  placeholder: 'ค้นหา...',
  debounce: 300,
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  clear: [];
}>();

function onUpdate(value: string | number | null): void {
  emit('update:modelValue', value === null ? '' : String(value));
}

function onClear(): void {
  emit('update:modelValue', '');
  emit('clear');
}
</script>

<style scoped lang="scss">
.base-search-input {
  :deep(.q-field__control) {
    background: #ffffff !important;
  }

  :deep(.q-field__control::before) {
    border-color: rgba(17, 24, 39, 0.14) !important;
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(17, 24, 39, 0.22) !important;
  }

  &.q-field--focused :deep(.q-field__control::after) {
    border-color: var(--q-primary) !important;
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: #1f2937;
    font-size: 0.95rem;
    font-weight: 500;
  }

  :deep(.q-field__native::placeholder),
  :deep(.q-field__input::placeholder) {
    color: #8a94a6;
    opacity: 1;
  }
}
</style>
