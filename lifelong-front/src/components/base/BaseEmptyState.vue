<template>
  <div class="base-empty" :class="{ 'base-empty--dense': dense }">
    <div class="base-empty__icon-wrap">
      <q-icon :name="icon" :size="iconSize" color="primary" />
    </div>
    <div class="base-empty__title text-h6 text-weight-bolder text-dark">
      {{ title }}
    </div>
    <div v-if="caption" class="base-empty__caption text-body2 text-grey-6 q-mt-sm">
      {{ caption }}
    </div>
    <div v-if="$slots.action" class="base-empty__action q-mt-lg">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** Material icon name shown in the soft circle */
  icon?: string;
  /** Primary line — what is empty */
  title: string;
  /** Optional secondary explanation */
  caption?: string;
  /** Icon glyph size */
  iconSize?: string;
  /** Tighter padding for inline/in-card use */
  dense?: boolean;
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  caption: '',
  iconSize: '40px',
  dense: false,
});
</script>

<style lang="scss" scoped>
.base-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 24px;

  &--dense {
    padding: 24px 16px;
  }

  &__icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: rgba($primary, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  &--dense &__icon-wrap {
    width: 64px;
    height: 64px;
    margin-bottom: 12px;
  }

  &__caption {
    max-width: 340px;
  }
}
</style>
