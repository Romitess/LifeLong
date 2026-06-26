<template>
  <q-dialog
    v-model="dialogModel"
    :persistent="persistent"
    :maximized="maximized"
    :transition-show="transitionShow"
    :transition-hide="transitionHide"
    :class="['app-dialog', dialogClass]"
  >
    <q-card
      class="app-dialog__card"
      :class="cardClass"
      :style="maximized ? undefined : { maxWidth: resolvedWidth }"
    >
      <div v-if="showHeader" class="app-dialog__header" :class="headerClass">
        <slot name="header">
          <div class="app-dialog__title-block">
            <div v-if="eyebrow" class="app-dialog__eyebrow">{{ eyebrow }}</div>
            <div v-if="icon || title" class="app-dialog__title-row">
              <span v-if="icon" class="app-dialog__icon-wrap" :style="iconWrapStyle">
                <q-icon :name="icon" size="26px" class="app-dialog__title-icon" />
              </span>
              <h2 v-if="title" class="app-dialog__title">{{ title }}</h2>
            </div>
            <p v-if="subtitle" class="app-dialog__subtitle">{{ subtitle }}</p>
          </div>
        </slot>

        <AppIconButton
          v-if="showClose"
          icon="close"
          class="app-dialog__close"
          :aria-label="closeAriaLabel"
          @click="closeDialog"
        />
      </div>

      <div class="app-dialog__body" :class="bodyClass">
        <slot />
      </div>

      <div v-if="$slots.actions" class="app-dialog__actions" :class="actionsClass">
        <slot name="actions" />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import AppIconButton from './AppIconButton.vue';

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    subtitle?: string;
    eyebrow?: string;
    icon?: string;
    iconColor?: string;
    iconBackground?: string;
    persistent?: boolean;
    maximized?: boolean;
    width?: string;
    showClose?: boolean;
    closeAriaLabel?: string;
    transitionShow?: string;
    transitionHide?: string;
    dialogClass?: string;
    cardClass?: string;
    headerClass?: string;
    bodyClass?: string;
    actionsClass?: string;
  }>(),
  {
    title: '',
    subtitle: '',
    eyebrow: '',
    icon: '',
    iconColor: '',
    iconBackground: '',
    persistent: false,
    maximized: false,
    width: '720px',
    showClose: true,
    closeAriaLabel: 'ปิด',
    transitionShow: 'scale',
    transitionHide: 'scale',
    dialogClass: '',
    cardClass: '',
    headerClass: '',
    bodyClass: '',
    actionsClass: '',
  },
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'close'): void;
}>();

const slots = useSlots();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const showHeader = computed(() =>
  Boolean(
    props.title || props.subtitle || props.eyebrow || props.icon || props.showClose || slots.header,
  ),
);
const resolvedWidth = computed(() => `min(${props.width}, calc(100vw - 32px))`);
const iconWrapStyle = computed(() => ({
  color: props.iconColor || 'var(--admin-gold, #f5a623)',
  backgroundColor: props.iconBackground || 'rgba(245, 166, 35, 0.14)',
}));

function closeDialog(): void {
  emit('close');
  dialogModel.value = false;
}
</script>

<style scoped lang="scss">
.app-dialog__card {
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.app-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.app-dialog__title-block {
  min-width: 0;
}

.app-dialog__eyebrow {
  margin-bottom: 4px;
  color: var(--admin-gold, #f5a623);
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.app-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  border-radius: 14px;
}

.app-dialog__title-icon {
  color: currentColor;
}

.app-dialog__title {
  margin: 0;
  color: var(--admin-navy, #10233f);
  font-size: 1.18rem;
  font-weight: 850;
  line-height: 1.35;
}

.app-dialog__subtitle {
  margin: 6px 0 0;
  color: var(--admin-muted, #64748b);
  font-size: 0.92rem;
  line-height: 1.55;
}

.app-dialog__close {
  flex: 0 0 auto;
}

.app-dialog__body {
  padding: 22px 24px;
}

.app-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 22px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}
</style>
