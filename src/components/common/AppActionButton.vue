<template>
  <BaseButton
    v-bind="$attrs"
    :outline="variant === 'outline'"
    :flat="variant === 'ghost'"
    :hover-lift="variant !== 'ghost'"
    :class="['app-action-button', `app-action-button--${variant}`]"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from 'components/base/BaseButton.vue';

defineOptions({ inheritAttrs: false });

interface Props {
  variant?: 'primary' | 'outline' | 'secondary' | 'danger' | 'ghost';
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
});
</script>

<style scoped lang="scss">
.app-action-button {
  min-height: 44px;
  padding-inline: 22px !important;
  border-radius: 12px !important;
  font-weight: 600 !important;

  :deep(.q-btn__content) {
    flex-wrap: nowrap;
    flex-direction: row;
    gap: 8px;
    letter-spacing: 0;
    white-space: nowrap;
  }

  :deep(.block) {
    white-space: nowrap;
  }
}

.app-action-button--primary {
  color: #ffffff !important;
  background: var(--admin-gold, #f5a623) !important;
  border-color: rgba(245, 166, 35, 0.7) !important;
  box-shadow: none !important;
}

.app-action-button--outline {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
}

.app-action-button--secondary {
  color: #374151 !important;
  background: #ffffff !important;
  border-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: none !important;
}

.app-action-button--danger {
  color: #ffffff !important;
  background: #ff4031 !important;
  border-color: rgba(255, 64, 49, 0.7) !important;
  box-shadow: none !important;
}

.app-action-button--ghost {
  color: var(--admin-navy, #10233f) !important;
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}

.app-action-button--primary:hover {
  box-shadow: 0 12px 24px rgba(245, 166, 35, 0.2) !important;
}

.app-action-button--secondary:hover {
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08) !important;
  border-color: rgba(16, 35, 63, 0.16) !important;
}

.app-action-button--danger:hover {
  box-shadow: 0 12px 24px rgba(255, 64, 49, 0.18) !important;
}
</style>
