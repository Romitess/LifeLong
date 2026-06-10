<template>
  <section :class="['base-content-card', `base-content-card--${padding}`]">
    <slot />
  </section>
</template>

<script setup lang="ts">
// Flat content surface used by the in-app Moodle learning pages
// (content / quiz / assign / feedback / forum). Single source of the card
// look so pages don't redefine borders/radius/background ad-hoc.
interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), { padding: 'lg' });
</script>

<style lang="scss" scoped>
.base-content-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
}

.base-content-card--none {
  padding: 0;
}

.base-content-card--sm {
  padding: 12px 16px;
}

.base-content-card--md {
  padding: 16px 20px;
}

.base-content-card--lg {
  padding: 24px;
}
</style>
