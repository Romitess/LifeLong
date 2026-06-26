<template>
  <BaseSearchInput
    :model-value="modelValue"
    :debounce="debounce"
    :placeholder="placeholder"
    @update:model-value="emit('update:modelValue', $event)"
    @clear="emit('clear')"
  />
</template>

<script setup lang="ts">
import BaseSearchInput from 'components/base/BaseSearchInput.vue';

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
</script>
