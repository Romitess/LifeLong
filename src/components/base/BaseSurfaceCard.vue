<template>
  <div :class="['base-surface-card', { 'base-surface-card--accent': accent }]">
    <GoldenUnderline
      v-if="accent"
      position="top"
      left="22px"
      right="22px"
      border-radius="0 0 999px 999px"
    />

    <div v-if="showHeader" class="base-surface-card__header">
      <div class="base-surface-card__heading">
        <p v-if="eyebrow" class="base-surface-card__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title" class="base-surface-card__title">{{ title }}</h2>
        <span v-if="subtitle" class="base-surface-card__subtitle">{{ subtitle }}</span>
      </div>
      <div v-if="$slots['header-actions']" class="base-surface-card__header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <div :class="['base-surface-card__body', `base-surface-card__body--${bodyPadding}`]">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';

interface Props {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  accent?: boolean;
  bodyPadding?: 'none' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  eyebrow: '',
  title: '',
  subtitle: '',
  accent: false,
  bodyPadding: 'lg',
});

const slots = useSlots();
const showHeader = computed(() =>
  Boolean(props.eyebrow || props.title || props.subtitle || slots['header-actions']),
);
</script>

<style lang="scss" scoped>
.base-surface-card {
  position: relative;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 16px;
  box-shadow:
    0 1px 3px rgba(15, 23, 42, 0.05),
    0 8px 24px rgba(17, 24, 39, 0.04);
  transition:
    transform 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.28s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(245, 166, 35, 0.6);
    box-shadow: 0 16px 32px rgba(17, 24, 39, 0.12);
  }
}

// ── Header ────────────────────────────────────────────────
.base-surface-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.base-surface-card__heading {
  min-width: 0;
}

.base-surface-card__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.base-surface-card__title {
  margin: 0 0 4px;
  color: #101828;
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.3;
}

.base-surface-card__subtitle {
  color: #667085;
  font-size: 0.82rem;
}

.base-surface-card__header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

// ── Body ──────────────────────────────────────────────────
.base-surface-card__body--none {
  padding: 0;
}

.base-surface-card__body--md {
  padding: 16px 20px;
}

.base-surface-card__body--lg {
  padding: 24px;
}
</style>
