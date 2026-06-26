<template>
  <q-card
    class="base-info-strip"
    :class="[`base-info-strip--${variant}`, { 'base-info-strip--floating': floating }]"
    :style="stripStyle"
    flat
    bordered
  >
    <div class="base-info-strip__grid">
      <div
        v-for="item in items"
        :key="item.label"
        class="base-info-strip__item"
        :style="getItemStyle(item)"
      >
        <div class="base-info-strip__icon">
          <q-icon :name="item.icon" size="28px" />
        </div>

        <div class="base-info-strip__content">
          <div v-if="item.value" class="base-info-strip__value">
            {{ item.value }}
          </div>
          <div class="base-info-strip__label">
            {{ item.label }}
          </div>
          <div class="base-info-strip__description">
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface InfoStripItem {
  icon: string;
  label: string;
  description: string;
  value?: string;
  color?: string;
  iconBg?: string;
}

interface Props {
  items: InfoStripItem[];
  variant?: 'stat' | 'feature';
  floating?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'feature',
  floating: false,
});

const stripStyle = computed(() => ({
  '--info-strip-columns': String(Math.max(props.items.length, 1)),
}));

function getItemStyle(item: InfoStripItem): Record<string, string> {
  return {
    '--info-strip-icon-color': item.color ?? '#f5a623',
    '--info-strip-icon-bg': item.iconBg ?? 'rgba(245, 166, 35, 0.12)',
  };
}
</script>

<style lang="scss" scoped>
.base-info-strip {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba(17, 24, 39, 0.03),
    0 2px 8px rgba(0, 0, 0, 0.02);
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba($primary, 0.6);
    box-shadow:
      0 0 0 1px rgba($primary, 0.06),
      0 16px 32px rgba(17, 24, 39, 0.12);
  }

  &--floating {
    box-shadow:
      0 0 0 1px rgba(17, 24, 39, 0.03),
      0 10px 28px rgba(17, 24, 39, 0.1);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(var(--info-strip-columns), minmax(0, 1fr));
  }

  &__item {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0;
    min-height: 112px;
    gap: 14px;
    padding: 22px 24px 20px;
  }

  &__item + &__item::before {
    content: '';
    position: absolute;
    top: 24px;
    bottom: 22px;
    left: 0;
    width: 1px;
    background: rgba(17, 24, 39, 0.08);
  }

  &__icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 54px;
    height: 54px;
    border-radius: 12px;
    color: var(--info-strip-icon-color);
    background: var(--info-strip-icon-bg);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.72);
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover &__icon {
    transform: translateY(-1px);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.72),
      0 8px 18px rgba(17, 24, 39, 0.08);
  }

  &__content {
    min-width: 0;
  }

  &__value {
    color: $primary;
    font-size: 1.45rem;
    font-weight: 800;
    line-height: 1;
  }

  &__label {
    margin-top: 3px;
    color: #111827;
    font-size: 0.98rem;
    font-weight: 750;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  &__description {
    margin-top: 5px;
    color: #667085;
    font-size: 0.8rem;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }

  &--feature &__item {
    min-height: 116px;
  }

  &--feature &__label {
    font-size: 1.02rem;
  }
}

@media (max-width: 1023px) {
  .base-info-strip {
    &__grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__item + &__item::before {
      display: none;
    }

    &__item {
      border-top: 1px solid rgba(17, 24, 39, 0.08);
    }

    &__item:nth-child(-n + 2) {
      border-top: 0;
    }
  }
}

@media (max-width: 767px) {
  .base-info-strip {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__item {
      min-height: 98px;
      padding: 18px;
      border-top: 1px solid rgba(17, 24, 39, 0.08);
    }

    &__item:first-child {
      border-top: 0;
    }

    &__icon {
      width: 48px;
      height: 48px;
    }

    &__value {
      font-size: 1.28rem;
    }
  }
}
</style>
