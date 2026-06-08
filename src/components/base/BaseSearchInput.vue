<template>
  <div class="base-search-input">
    <q-input
      :model-value="modelValue"
      borderless
      dense
      clearable
      class="base-search-input__field"
      :debounce="debounce"
      :placeholder="placeholder"
      @update:model-value="onUpdate"
      @clear="onClear"
    >
      <template #prepend>
        <q-icon name="search" color="grey-5" />
      </template>
    </q-input>
  </div>
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
  --base-search-height: 52px;
  --base-search-padding-x: 18px;
  --base-search-font-size: 1rem;

  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.14);
  border-radius: 999px;
  background: #ffffff;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--q-primary);
  }

  &__field {
    :deep(.q-field__control) {
      min-height: var(--base-search-height);
      padding: 0 var(--base-search-padding-x);
      border-radius: 999px;
      background: transparent;
    }
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    font-size: var(--base-search-font-size);
    color: #2f2f2f;
  }

  :deep(.q-field__native::placeholder),
  :deep(.q-field__input::placeholder) {
    color: #8c8c8c;
  }
}
</style>
