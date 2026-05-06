<template>
  <q-card
    class="base-info-card"
    :class="[`base-info-card--${variant}`, `base-info-card--${tone}-tone`]"
    flat
    bordered
  >
    <div class="base-info-card__icon" :class="`base-info-card__icon--${tone}`">
      <q-icon :name="icon" size="28px" />
    </div>

    <div class="base-info-card__body">
      <div v-if="value" class="base-info-card__value">
        {{ value }}
      </div>
      <div class="base-info-card__title">
        {{ title }}
      </div>
      <div class="base-info-card__description">
        {{ description }}
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'stat' | 'feature';
  tone?: 'primary' | 'secondary' | 'positive' | 'accent' | 'amber' | 'indigo' | 'gold' | 'blue';
  icon: string;
  title: string;
  description: string;
  value?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'feature',
  tone: 'primary',
  value: '',
});
</script>

<style lang="scss" scoped>
.base-info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 80px;
  padding: 16px 20px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba($primary, 0.12) !important;
  box-shadow:
    0 1px 3px rgba($primary, 0.06),
    0 8px 24px rgba(17, 24, 39, 0.04);
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba($primary, 0.24) !important;
    box-shadow:
      0 12px 32px rgba($primary, 0.1),
      0 4px 12px rgba(17, 24, 39, 0.06);
  }

  &--stat {
    min-height: 88px;
    padding: 18px 24px;
  }

  // ── Icon ──
  &__icon {
    flex: 0 0 46px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 46px !important;
    height: 46px !important;
    min-width: 46px !important;
    min-height: 46px !important;
    border-radius: 14px !important;
    font-size: 24px;
    align-self: center !important;
    color: #ffffff !important;
    transition: transform 0.24s ease;

    &--primary {
      background: linear-gradient(135deg, $primary, #d88b0a) !important;
      box-shadow: 0 4px 12px rgba($primary, 0.3);
    }

    &--secondary {
      background: linear-gradient(135deg, $secondary, #111653) !important;
      box-shadow: 0 4px 12px rgba($secondary, 0.3);
    }

    &--positive {
      background: linear-gradient(135deg, #22c55e, #16a34a) !important;
      box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
    }

    &--accent {
      background: linear-gradient(135deg, $accent, #bd4300) !important;
      box-shadow: 0 4px 12px rgba($accent, 0.3);
    }

    &--amber,
    &--gold {
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    &--indigo,
    &--blue {
      background: linear-gradient(135deg, #4f7df5, #3b63d4) !important;
      box-shadow: 0 4px 12px rgba(79, 125, 245, 0.3);
    }
  }

  &:hover &__icon {
    transform: scale(1.08);
  }

  // ── Body ──
  &__body {
    min-width: 0;
    flex: 1;
  }

  &__value {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    color: $secondary !important;
    line-height: 1;
    margin-bottom: 3px;
    letter-spacing: -0.02em;
  }

  &__title {
    display: block;
    font-size: 0.95rem;
    font-weight: 700;
    color: #111827 !important;
    line-height: 1.3;
  }

  &__description {
    display: block;
    font-size: 0.82rem;
    color: #667085 !important;
    margin-top: 2px;
    line-height: 1.4;
  }

  @media (max-width: 600px) {
    padding: 14px 16px;
    border-radius: 14px;
    gap: 12px;

    &__icon {
      flex: 0 0 40px !important;
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
      font-size: 20px;
      border-radius: 12px !important;
    }

    &__title {
      font-size: 0.88rem;
    }

    &__value {
      font-size: 1.25rem;
    }
  }
}
</style>
