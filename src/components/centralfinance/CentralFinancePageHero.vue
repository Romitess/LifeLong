<template>
  <section class="cf-page-hero">
    <div
      :class="[
        'admin-shell',
        'cf-page-hero__content',
        { 'cf-page-hero__content--with-aside': hasAside },
      ]"
    >
      <div class="cf-page-hero__copy">
        <div class="cf-eyebrow">
          <q-icon v-if="eyebrowIcon" :name="eyebrowIcon" size="18px" />
          <span>{{ eyebrow }}</span>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>
        <div v-if="$slots.actions" class="cf-page-hero__actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="hasAside" class="cf-page-hero__aside">
        <slot name="aside" />
      </div>
    </div>
    <GoldenUnderline />
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';

interface Props {
  eyebrow: string;
  eyebrowIcon?: string;
  title: string;
  description: string;
}

withDefaults(defineProps<Props>(), {
  eyebrowIcon: '',
});

const slots = useSlots();
const hasAside = computed(() => Boolean(slots.aside));
</script>

<style scoped lang="scss">
.cf-page-hero {
  position: relative;
  padding: 56px 0 36px;
  color: #ffffff;
  background:
    linear-gradient(135deg, rgba(16, 35, 63, 0.98), rgba(20, 84, 106, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
}

.cf-page-hero__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  min-height: 168px;
}

.cf-page-hero__content--with-aside {
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.6fr);
}

.cf-page-hero__copy {
  min-width: 0;
}

.cf-eyebrow {
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

.cf-page-hero h1 {
  margin: 14px 0 10px;
  color: #ffffff;
  font-size: clamp(1.8rem, 2.6vw, 2.8rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 900;
}

.cf-page-hero p {
  max-width: 720px;
  margin: 0;
  color: rgba(255, 255, 255, 0.82);
  font-size: 1rem;
  line-height: 1.65;
}

.cf-page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.cf-page-hero__aside {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

@media (max-width: 900px) {
  .cf-page-hero {
    padding: 44px 0 28px;
  }

  .cf-page-hero__content,
  .cf-page-hero__content--with-aside {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .cf-page-hero__aside {
    justify-content: flex-start;
  }
}
</style>
