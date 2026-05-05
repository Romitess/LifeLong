<template>
  <q-dialog
    v-model="dialogModel"
    :persistent="persistent"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="base-system-dialog" :style="{ maxWidth: resolvedWidth }">
      <q-card-section class="base-system-dialog__body">
        <div class="base-system-dialog__header">
          <div
            class="base-system-dialog__icon-wrap"
            :style="{ backgroundColor: variantMeta.iconBackground }"
          >
            <q-icon :name="resolvedIcon" size="30px" :color="variantMeta.color" />
          </div>

          <div class="base-system-dialog__heading">
            <h2>{{ title }}</h2>
            <p v-if="message">{{ message }}</p>
          </div>
        </div>

        <slot>
          <div v-if="details.length > 0" class="base-system-dialog__details">
            <div v-for="detail in details" :key="detail" class="base-system-dialog__detail">
              <q-icon name="check_circle" size="18px" :color="variantMeta.color" />
              <span>{{ detail }}</span>
            </div>
          </div>
        </slot>
      </q-card-section>

      <q-card-actions class="base-system-dialog__actions">
        <slot name="actions">
          <BaseButton
            v-if="!hideCancel"
            outline
            :label="cancelLabel"
            color="grey-7"
            no-caps
            class="base-system-dialog__button"
            @click="onCancel"
          />
          <BaseButton
            :label="confirmLabel"
            :color="variantMeta.buttonColor"
            :icon="confirmIcon || variantMeta.confirmIcon"
            :loading="loading"
            no-caps
            class="base-system-dialog__button"
            @click="onConfirm"
          />
        </slot>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

type DialogVariant = 'info' | 'confirm' | 'warning' | 'danger' | 'success';

interface Props {
  modelValue: boolean;
  title: string;
  message?: string;
  details?: string[];
  variant?: DialogVariant;
  icon?: string;
  confirmIcon?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  hideCancel?: boolean;
  persistent?: boolean;
  loading?: boolean;
  width?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  details: () => [],
  variant: 'confirm',
  icon: '',
  confirmIcon: '',
  confirmLabel: 'ยืนยัน',
  cancelLabel: 'ยกเลิก',
  hideCancel: false,
  persistent: true,
  loading: false,
  width: '460px',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'confirm'): void;
  (event: 'cancel'): void;
}>();

const variantMap: Record<
  DialogVariant,
  {
    color: string;
    buttonColor: string;
    icon: string;
    confirmIcon: string;
    iconBackground: string;
  }
> = {
  info: {
    color: 'primary',
    buttonColor: 'primary',
    icon: 'info',
    confirmIcon: 'check',
    iconBackground: 'rgba(25, 118, 210, 0.12)',
  },
  confirm: {
    color: 'primary',
    buttonColor: 'primary',
    icon: 'help',
    confirmIcon: 'check_circle',
    iconBackground: 'rgba(245, 166, 35, 0.16)',
  },
  warning: {
    color: 'warning',
    buttonColor: 'warning',
    icon: 'warning',
    confirmIcon: 'priority_high',
    iconBackground: 'rgba(245, 166, 35, 0.18)',
  },
  danger: {
    color: 'logout-danger',
    buttonColor: 'logout-danger',
    icon: 'error',
    confirmIcon: 'delete',
    iconBackground: 'rgba(255, 64, 49, 0.12)',
  },
  success: {
    color: 'positive',
    buttonColor: 'positive',
    icon: 'check_circle',
    confirmIcon: 'done',
    iconBackground: 'rgba(46, 125, 50, 0.12)',
  },
};

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const variantMeta = computed(() => variantMap[props.variant]);
const resolvedIcon = computed(() => props.icon || variantMeta.value.icon);
const resolvedWidth = computed(() => `min(${props.width}, calc(100vw - 32px))`);

function onConfirm(): void {
  emit('confirm');
}

function onCancel(): void {
  emit('cancel');
  dialogModel.value = false;
}
</script>

<style lang="scss" scoped>
.base-system-dialog {
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 56px rgba(15, 23, 42, 0.22);
}

.base-system-dialog :deep(.text-logout-danger) {
  color: #ff4031 !important;
}

.base-system-dialog :deep(.bg-logout-danger) {
  background: #ff4031 !important;
}

.base-system-dialog__body {
  padding: 24px 24px 18px;
}

.base-system-dialog__header {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 16px;
  align-items: flex-start;
}

.base-system-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
}

.base-system-dialog__heading {
  min-width: 0;

  h2 {
    margin: 0;
    color: #10223c;
    font-size: 1.15rem;
    font-weight: 800;
    line-height: 1.35;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.55;
  }
}

.base-system-dialog__details {
  display: grid;
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #f8fafc;
}

.base-system-dialog__detail {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.45;
}

.base-system-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 24px 24px;
}

.base-system-dialog__button {
  width: 100%;
  min-height: 44px;
}

.base-system-dialog__actions :deep(.q-btn__content) {
  width: 100%;
  justify-content: center;
  white-space: nowrap;
}

@media (max-width: 520px) {
  .base-system-dialog__header,
  .base-system-dialog__actions {
    grid-template-columns: 1fr;
  }

  .base-system-dialog__icon-wrap {
    width: 52px;
    height: 52px;
  }
}
</style>
