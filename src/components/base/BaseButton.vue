<template>
  <q-btn
    v-bind="$attrs"
    :class="['base-button', { 'base-button--hover-lift': hoverLift }]"
    :unelevated="unelevated"
    :ripple="{ color: 'white' }"
  >
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
/**
 * BaseButton - A custom button component for LLLv1 project
 * Features:
 * - Consistent rounded corners (8px-12px)
 * - Optional hover lifting effect with border
 */

interface Props {
  /**
   * If true, the button will lift up and show a border on hover
   */
  hoverLift?: boolean;
  /**
   * Remove button shadow (default Quasar behavior)
   */
  unelevated?: boolean;
}

withDefaults(defineProps<Props>(), {
  hoverLift: false,
  unelevated: true,
});
</script>

<style lang="scss" scoped>
.base-button {
  // 1. All buttons are square with rounded corners (ขอบหม่น)
  border-radius: 12px !important;
  font-weight: 600;
  padding: 8px 24px;
  min-height: 44px;
  text-transform: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.08) !important; // เพิ่มขอบให้เห็นชัดเจนทุกปุ่มเป็นพื้นฐาน

  // Ensure text/icon alignment
  :deep(.q-btn__content) {
    letter-spacing: 0.02em;
  }

  // 2. Hover effect: Lift up and show border
  &--hover-lift {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(245, 166, 35, 0.2) !important;
      border-color: $primary !important; // ขอบจะชัดขึ้นและเป็นสีทองเมื่อ Hover

      &.bg-white {
        border-color: $primary !important;
      }
    }

    &:active {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(245, 166, 35, 0.15) !important;
    }
  }
}
</style>
