<template>
  <section class="admin-page-hero">
    <div
      :class="[
        'admin-shell',
        { 'admin-shell--wide': wide },
        'admin-page-hero__content',
        { 'admin-page-hero__content--with-aside': hasAside },
      ]"
    >
      <div class="admin-page-hero__copy">
        <div class="admin-eyebrow">
          <q-icon v-if="eyebrowIcon" :name="eyebrowIcon" size="18px" />
          <span>{{ eyebrow }}</span>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <div v-if="$slots.actions" class="admin-page-hero__actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="hasAside" class="admin-page-hero__aside">
        <slot name="aside" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  eyebrow: string;
  eyebrowIcon?: string;
  title: string;
  description: string;
  wide?: boolean;
}

withDefaults(defineProps<Props>(), {
  eyebrowIcon: '',
  wide: false,
});

const slots = useSlots();
const hasAside = computed(() => Boolean(slots.aside));
</script>

<style scoped lang="scss">
.admin-page-hero {
  padding: 58px 0 34px;
  color: #ffffff;
  background:
    linear-gradient(135deg, rgba(16, 35, 63, 0.98), rgba(20, 84, 106, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
  border-bottom: 4px solid var(--admin-gold-accent);
}

.admin-page-hero__content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
}

.admin-page-hero__content--with-aside {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  align-items: center;
}

.admin-page-hero__copy {
  min-width: 0;
}

.admin-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  color: #fff4d8;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.admin-page-hero h1 {
  margin: 14px 0 10px;
  color: #ffffff;
  font-size: clamp(2rem, 3.6vw, 4.4rem);
  line-height: 0.98;
  letter-spacing: -0.045em;
}

.admin-page-hero p {
  max-width: 840px;
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 1.04rem;
  line-height: 1.7;
}

.admin-page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.admin-page-hero__aside {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 900px) {
  .admin-page-hero__content,
  .admin-page-hero__content--with-aside {
    align-items: stretch;
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .admin-page-hero__aside {
    justify-content: flex-start;
  }
}
</style>
