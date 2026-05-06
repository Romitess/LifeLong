<template>
  <q-dialog v-model="dialogModel" transition-show="scale" transition-hide="scale">
    <q-card class="base-confirm-dialog">
      <q-card-section class="base-confirm-dialog__body q-pa-xl text-center">
        <div class="base-confirm-dialog__icon-wrap q-mx-auto q-mb-lg">
          <q-icon :name="icon" size="38px" :color="iconColor" />
        </div>
        <div class="text-h6 text-weight-bolder text-dark">
          {{ title }}
        </div>
        <div class="text-grey-7 q-mt-sm">
          {{ message }}
        </div>
      </q-card-section>

      <q-card-actions class="base-confirm-dialog__actions q-px-lg q-pb-lg">
        <BaseButton
          outline
          :label="cancelLabel"
          color="grey-7"
          no-caps
          class="base-confirm-dialog__button"
          @click="onCancel"
        />
        <BaseButton
          :label="confirmLabel"
          :color="confirmColor"
          :icon="confirmIcon"
          no-caps
          class="base-confirm-dialog__button"
          @click="onConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

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
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'help_outline',
  iconColor: 'primary',
  confirmColor: 'primary',
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

function onConfirm(): void {
  emit('confirm');
  dialogModel.value = false;
}

function onCancel(): void {
  emit('cancel');
  dialogModel.value = false;
}
</script>

<style lang="scss" scoped>
.base-confirm-dialog {
  width: 380px;
  max-width: 92vw;
  border-radius: 22px !important;
  overflow: hidden;

  &__icon-wrap {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: rgba($primary, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    padding-bottom: 24px;
  }

  &__button {
    width: 120px !important;
    min-width: 120px !important;
    padding-left: 8px !important;
    padding-right: 8px !important;
    min-height: 40px !important;
  }

  &__actions :deep(.q-btn__content) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
    font-size: 13px;
  }
}
</style>
