<template>
  <BaseInput
    :model-value="displayValue"
    @update:model-value="onUpdate"
    :type="type"
    :label="label"
    :min="min"
    :max="max"
    :step="step"
    hide-bottom-space
    class="hero-editor-input admin-editor-field"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseInput from 'components/base/BaseInput.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string | number | null | undefined;
    label: string;
    type?: 'text' | 'number';
    min?: number;
    max?: number;
    step?: number;
  }>(),
  {
    type: 'text',
  },
);

const emit = defineEmits(['update:modelValue']);

const displayValue = computed(() => {
  if (props.type === 'number') {
    return props.modelValue ?? 0;
  }
  return props.modelValue ?? '';
});

function onUpdate(val: string | number | FileList | null | undefined): void {
  if (props.type === 'number') {
    // Force numeric conversion and fallback to 0
    let num = val === '' || val === null || val === undefined ? 0 : Number(val);

    // Clamp values if min/max are provided
    if (props.min !== undefined && num < props.min) num = props.min;
    if (props.max !== undefined && num > props.max) num = props.max;

    emit('update:modelValue', isNaN(num) ? 0 : num);
  } else {
    emit('update:modelValue', val ?? '');
  }
}
</script>
