<template>
  <q-select
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    outlined
    dense
    stack-label
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
  </q-select>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: unknown;
  label: string;
  options: unknown[];
}>();

defineEmits(['update:modelValue']);
</script>
