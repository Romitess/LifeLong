<template>
  <q-card
    flat
    :class="[
      'cf-surface-card',
      `cf-surface-card--${tone}`,
      { 'cf-surface-card--accent': accent },
      cardClass,
    ]"
  >
    <GoldenUnderline
      v-if="accent"
      position="top"
      left="22px"
      right="22px"
      border-radius="0 0 999px 999px"
    />
    <div v-if="showHeader" class="cf-surface-card__header">
      <div class="cf-surface-card__heading">
        <p v-if="eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title">{{ title }}</h2>
        <span v-if="subtitle">{{ subtitle }}</span>
      </div>
      <div v-if="$slots['header-actions']" class="cf-surface-card__header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <div :class="['cf-surface-card__body', `cf-surface-card__body--${bodyPadding}`, bodyClass]">
      <slot />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';

interface Props {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tone?: 'default' | 'glass';
  accent?: boolean;
  bodyPadding?: 'none' | 'md' | 'lg';
  cardClass?: string | string[] | Record<string, boolean>;
  bodyClass?: string | string[] | Record<string, boolean>;
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '',
  title: '',
  subtitle: '',
  tone: 'default',
  accent: false,
  bodyPadding: 'lg',
  cardClass: '',
  bodyClass: '',
});

const slots = useSlots();
const showHeader = computed(() =>
  Boolean(props.eyebrow || props.title || props.subtitle || slots['header-actions']),
);
</script>

<style scoped lang="scss">
.cf-surface-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba($primary, 0.12) !important;
  border-radius: var(--finance-radius-lg);
  background: #ffffff;
  box-shadow:
    0 1px 3px rgba($primary, 0.06),
    0 8px 24px rgba(17, 24, 39, 0.04);
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba($primary, 0.6) !important;
    box-shadow: 0 16px 32px rgba(17, 24, 39, 0.12) !important;
  }
}

.cf-surface-card--glass {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: none;
  backdrop-filter: blur(18px);
}

.cf-surface-card--glass:hover {
  transform: none;
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: none;
}

.cf-surface-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0;
}

.cf-surface-card__heading {
  min-width: 0;
}

.cf-surface-card__heading p {
  margin: 0 0 5px;
  color: #b7791f;
  font-size: 0.75rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.cf-surface-card__heading h2 {
  margin: 0;
  color: var(--finance-navy);
  font-size: 1.2rem;
  font-weight: 950;
  line-height: 1.2;
}

.cf-surface-card__heading span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 8px;
  color: var(--finance-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  min-height: 3.1em;
}

.cf-surface-card__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cf-surface-card__body--none {
  padding: 0;
}

.cf-surface-card__body--md {
  padding: 18px 24px 24px;
}

.cf-surface-card__body--lg {
  padding: 22px 24px 24px;
}

.cf-surface-card--glass .cf-surface-card__heading p,
.cf-surface-card--glass .cf-surface-card__heading h2,
.cf-surface-card--glass .cf-surface-card__heading span {
  color: #ffffff;
}

@media (max-width: 760px) {
  .cf-surface-card__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
