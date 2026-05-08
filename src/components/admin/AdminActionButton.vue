<template>
  <BaseButton
    v-bind="$attrs"
    :outline="variant === 'outline'"
    :flat="variant === 'ghost'"
    :hover-lift="variant !== 'ghost'"
    :class="['admin-action-button', `admin-action-button--${variant}`]"
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
.admin-action-button {
  min-height: 44px;
  border-radius: 12px !important;
  font-weight: 850 !important;

  :deep(.q-btn__content) {
    gap: 8px;
    letter-spacing: 0;
  }
}

.admin-action-button--primary {
  color: #12213a !important;
  background: linear-gradient(135deg, var(--admin-gold-soft), var(--admin-gold)) !important;
  border-color: rgba(245, 166, 35, 0.56) !important;
  box-shadow: 0 18px 34px rgba(245, 166, 35, 0.22) !important;
}

.admin-action-button--outline {
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border-color: rgba(255, 255, 255, 0.42) !important;
}

.admin-action-button--secondary {
  color: var(--admin-navy) !important;
  background: #ffffff !important;
  border-color: rgba(16, 35, 63, 0.14) !important;
  box-shadow: var(--admin-shadow-sm) !important;
}

.admin-action-button--danger {
  color: #9f1239 !important;
  background: #fff1f2 !important;
  border-color: rgba(244, 63, 94, 0.22) !important;
}

.admin-action-button--ghost {
  color: var(--admin-navy) !important;
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}
</style>
