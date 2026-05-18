<template>
  <q-input
    :model-value="modelValue"
    outlined
    dense
    :debounce="debounce"
    :placeholder="placeholder"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event as string)"
  >
    <template #prepend><q-icon name="search" /></template>
    <template v-if="modelValue" #append>
      <q-icon name="close" class="cursor-pointer" @click="onClear" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

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

function onClear() {
  emit('update:modelValue', '');
  emit('clear');
}
</script>
