<template>
  <BaseSystemDialog
    v-model="dialogModel"
    :title="title"
    :message="message"
    :variant="resolvedVariant"
    :icon="icon"
    :confirm-label="confirmLabel"
    :cancel-label="cancelLabel"
    :confirm-icon="confirmIcon"
    :persistent="persistent"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseSystemDialog from './BaseSystemDialog.vue';

type DialogVariant = 'info' | 'confirm' | 'warning' | 'danger' | 'success';

interface Props {
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  icon?: string;
  iconColor?: string;
  confirmColor?: string;
  confirmIcon?: string;
  persistent?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: '',
  iconColor: 'primary',
  confirmColor: 'primary',
  confirmIcon: '',
  persistent: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const resolvedVariant = computed<DialogVariant>(() => {
  if (props.confirmColor === 'negative' || props.iconColor === 'negative') {
    return 'danger';
  }

  if (props.confirmColor === 'warning' || props.iconColor === 'warning') {
    return 'warning';
  }

  if (props.confirmColor === 'positive' || props.iconColor === 'positive') {
    return 'success';
  }

  return 'confirm';
});

function onConfirm(): void {
  emit('confirm');
  dialogModel.value = false;
}

function onCancel(): void {
  emit('cancel');
  dialogModel.value = false;
}
</script>
