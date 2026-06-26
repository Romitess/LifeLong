<template>
  <BaseButton
    v-bind="$attrs"
    class="app-icon-button"
    :class="`app-icon-button--${tone}`"
    flat
    round
    dense
    unelevated
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from 'components/base/BaseButton.vue';

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    tone?: 'default' | 'view' | 'edit' | 'delete' | 'copy' | 'warning';
  }>(),
  {
    tone: 'default',
  },
);
</script>

<style scoped lang="scss">
.app-icon-button {
  width: 34px;
  height: 34px;
  min-width: 34px;
  min-height: 34px;
  padding: 0 !important;
  border-radius: 999px !important;
  background: var(--app-icon-button-bg, var(--admin-surface, #ffffff)) !important;
  color: var(--app-icon-button-color, var(--admin-muted, #64748b)) !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;

  :deep(.q-icon) {
    font-size: 17px;
  }

  &:hover {
    background: var(--app-icon-button-bg-hover, rgba(245, 166, 35, 0.12)) !important;
    color: var(--app-icon-button-color-hover, var(--app-icon-button-color)) !important;
  }
}

.app-icon-button--view,
.app-icon-button--default {
  --app-icon-button-color: var(--admin-info-ink, #1d4ed8);
}

.app-icon-button--edit {
  --app-icon-button-color: var(--admin-gold, #f5a623);
}

.app-icon-button--delete {
  --app-icon-button-color: var(--admin-danger-ink, #be123c);
  --app-icon-button-bg-hover: rgba(225, 29, 72, 0.1);
}

.app-icon-button--copy {
  --app-icon-button-color: var(--admin-accent-ink, #92400e);
}

.app-icon-button--warning {
  --app-icon-button-color: var(--admin-warning-ink, #b7791f);
}
</style>
