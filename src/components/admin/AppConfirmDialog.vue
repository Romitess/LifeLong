<template>
  <q-dialog
    v-model="dialogModel"
    :persistent="persistent"
    class="admin-dialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="admin-confirm-dialog">
      <q-card-section class="admin-confirm-dialog__body">
        <div class="admin-confirm-dialog__header">
          <div
            class="admin-confirm-dialog__icon-wrap"
            :style="{ backgroundColor: toneMeta.iconBackground }"
          >
            <q-icon :name="resolvedIcon" size="28px" :color="toneMeta.iconColor" />
          </div>

          <div class="admin-confirm-dialog__heading">
            <h2>{{ title }}</h2>
            <p v-if="message">{{ message }}</p>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="admin-confirm-dialog__actions">
        <AppActionButton variant="secondary" :label="cancelLabel" no-caps @click="onCancel" />
        <AppActionButton
          :variant="toneMeta.buttonVariant"
          :label="confirmLabel"
          :icon="confirmIcon || toneMeta.confirmIcon"
          no-caps
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppActionButton from './AppActionButton.vue';

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

<style scoped lang="scss">
.admin-confirm-dialog {
  --admin-navy: #10233f;
  --admin-gold: #f5a623;
  --admin-gold-soft: #ffd166;
  --admin-gold-accent: #f7d046;
  --admin-shadow-sm: 0 18px 40px rgba(16, 35, 63, 0.07);
  width: min(500px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.admin-confirm-dialog__body {
  padding: 24px 24px 18px;
}

.admin-confirm-dialog__header {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 16px;
  align-items: flex-start;
}

.admin-confirm-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
}

.admin-confirm-dialog__heading h2 {
  margin: 0;
  color: #10223c;
  font-size: 1.15rem;
  font-weight: 850;
  line-height: 1.35;
}

.admin-confirm-dialog__heading p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.55;
}

.admin-confirm-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 24px 24px;
}

.admin-confirm-dialog__actions > * {
  width: 100%;
}

@media (max-width: 640px) {
  .admin-confirm-dialog__header,
  .admin-confirm-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
