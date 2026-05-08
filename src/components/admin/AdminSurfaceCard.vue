<template>
  <q-card
    flat
    :class="[
      'admin-surface-card',
      `admin-surface-card--${tone}`,
      { 'admin-surface-card--accent': accent },
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
    <div v-if="showHeader" class="admin-surface-card__header">
      <div class="admin-surface-card__heading">
        <p v-if="eyebrow">{{ eyebrow }}</p>
        <h2 v-if="title">{{ title }}</h2>
        <span v-if="subtitle">{{ subtitle }}</span>
      </div>
      <div v-if="$slots['header-actions']" class="admin-surface-card__header-actions">
        <slot name="header-actions" />
      </div>
    </div>

    <div
      :class="['admin-surface-card__body', `admin-surface-card__body--${bodyPadding}`, bodyClass]"
    >
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
.admin-surface-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius-lg);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-sm);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.admin-surface-card:hover {
  transform: translateY(-4px);
  border-color: rgba(245, 166, 35, 0.24);
  box-shadow:
    0 12px 24px rgba(17, 24, 39, 0.08),
    0 0 0 1px rgba(245, 166, 35, 0.08);
}

.admin-surface-card--glass {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.11);
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: none;
  backdrop-filter: blur(18px);
}

.admin-surface-card--glass:hover {
  transform: none;
  border-color: rgba(255, 255, 255, 0.16);
  box-shadow: none;
}

.admin-surface-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px 24px 0;
}

.admin-surface-card__heading {
  min-width: 0;
}

.admin-surface-card__heading p {
  margin: 0 0 5px;
  color: #b7791f;
  font-size: 0.75rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.admin-surface-card__heading h2 {
  margin: 0;
  color: var(--admin-navy);
  font-size: 1.2rem;
  font-weight: 950;
  line-height: 1.2;
}

.admin-surface-card__heading span {
  display: block;
  margin-top: 8px;
  color: var(--admin-muted);
  font-size: 0.9rem;
  line-height: 1.55;
}

.admin-surface-card__header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-surface-card__body--none {
  padding: 0;
}

.admin-surface-card__body--md {
  padding: 18px 24px 24px;
}

.admin-surface-card__body--lg {
  padding: 22px 24px 24px;
}

.admin-surface-card--glass .admin-surface-card__heading p,
.admin-surface-card--glass .admin-surface-card__heading h2,
.admin-surface-card--glass .admin-surface-card__heading span {
  color: #ffffff;
}

@media (max-width: 760px) {
  .admin-surface-card__header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
