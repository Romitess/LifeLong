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

<!-- Plain `outlined` q-input: border, radius, font and focus all come from the
     global .q-field--outlined styles so search matches every other field. -->
