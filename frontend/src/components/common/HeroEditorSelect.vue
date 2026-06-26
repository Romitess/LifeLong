<template>
  <BaseSelect
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :label="label"
    :options="options"
    emit-value
    map-options
    popup-content-class="admin-select-menu"
    class="hero-editor-select admin-editor-field"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </BaseSelect>
</template>

<script setup lang="ts">
import BaseSelect from 'components/base/BaseSelect.vue';

defineProps<{
  modelValue: unknown;
  label: string;
  options: unknown[];
}>();

defineEmits(['update:modelValue']);
</script>

<style scoped>
/* Clean style block */
</style>
