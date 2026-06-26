<template>
  <AppDialog
    v-model="dialogModel"
    :persistent="persistent"
    :title="title"
    :subtitle="message"
    :icon="resolvedIcon"
    :icon-color="toneMeta.iconColor"
    :icon-background="toneMeta.iconBackground"
    width="500px"
    actions-class="app-confirm-dialog__actions"
    @close="onCancel"
  >
    <template #actions>
      <AppActionButton variant="secondary" :label="cancelLabel" no-caps @click="onCancel" />
      <AppActionButton
        :variant="toneMeta.buttonVariant"
        :label="confirmLabel"
        :icon="confirmIcon || toneMeta.confirmIcon"
        no-caps
        @click="onConfirm"
      />
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppDialog from 'components/common/AppDialog.vue';
import AppActionButton from 'components/common/AppActionButton.vue';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

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

const toneMeta = computed<{
  iconColor: string;
  iconBackground: string;
  confirmIcon: string;
  buttonVariant: ButtonVariant;
  defaultIcon: string;
}>(() => {
  if (props.confirmColor === 'negative' || props.iconColor === 'negative') {
    return {
      iconColor: '#e11d48',
      iconBackground: 'rgba(225, 29, 72, 0.12)',
      confirmIcon: 'delete',
      buttonVariant: 'danger',
      defaultIcon: 'delete_forever',
    };
  }

  if (props.confirmColor === 'warning' || props.iconColor === 'warning') {
    return {
      iconColor: '#b45309',
      iconBackground: 'rgba(245, 166, 35, 0.18)',
      confirmIcon: 'priority_high',
      buttonVariant: 'primary',
      defaultIcon: 'warning_amber',
    };
  }

  if (props.confirmColor === 'positive' || props.iconColor === 'positive') {
    return {
      iconColor: '#15803d',
      iconBackground: 'rgba(21, 128, 61, 0.14)',
      confirmIcon: 'done',
      buttonVariant: 'primary',
      defaultIcon: 'check_circle',
    };
  }

  return {
    iconColor: '#10233f',
    iconBackground: 'rgba(245, 166, 35, 0.16)',
    confirmIcon: 'check_circle',
    buttonVariant: 'primary',
    defaultIcon: 'help_outline',
  };
});

const resolvedIcon = computed(() => props.icon || toneMeta.value.defaultIcon);

function onConfirm(): void {
  emit('confirm');
  dialogModel.value = false;
}

function onCancel(): void {
  emit('cancel');
  dialogModel.value = false;
}
</script>
