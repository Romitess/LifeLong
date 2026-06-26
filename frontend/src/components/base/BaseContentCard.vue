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
  overflow: hidden;
  // อ้างอิง design token กลาง (theme-tokens/colors.scss + radius.scss) — single source
  // (ค่าเดิม #fff / rgba(15,23,42,.1) / 12px → token ที่ค่าเท่ากัน ไม่เปลี่ยนหน้าตา)
  background: var(--color-card);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
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
