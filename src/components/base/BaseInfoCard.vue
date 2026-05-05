<template>
  <q-card class="base-info-card" :class="`base-info-card--${variant}`" flat bordered>
    <div class="base-info-card__icon" :class="`base-info-card__icon--${tone}`">
      <q-icon :name="icon" />
    </div>

    <div class="base-info-card__body">
      <div v-if="value" class="base-info-card__value">
        {{ value }}
      </div>
      <div class="base-info-card__title text-weight-bold text-dark">
        {{ title }}
      </div>
      <div class="base-info-card__description text-grey-6">
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
  min-height: 104px;
  padding: 18px 20px;
  border-radius: 14px !important;
  background: linear-gradient(145deg, #ffffff, #fffaf0);
  box-shadow:
    0 8px 22px rgba(17, 24, 39, 0.05),
    0 0 0 1px rgba(17, 24, 39, 0.08) !important;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 14px 34px rgba(17, 24, 39, 0.09),
      0 0 0 1px rgba($primary, 0.16) !important;
  }

  &--stat {
    min-height: 112px;
    padding: 22px 30px;
    gap: 16px;
  }

  &__icon {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 12px;
    font-size: 1.55rem;

    &--primary {
      color: $primary;
      background: rgba($primary, 0.12);
    }

    &--secondary {
      color: $secondary;
      background: rgba($secondary, 0.12);
    }

    &--positive {
      color: #15803d;
      background: rgba(21, 128, 61, 0.12);
    }

    &--accent {
      color: $accent;
      background: rgba($accent, 0.14);
    }

    &--amber {
      color: $primary;
      background: rgba($primary, 0.12);
    }

    &--indigo {
      color: #1f2a72;
      background: rgba(31, 42, 114, 0.1);
    }

    &--gold {
      color: #f5a623;
      background: rgba(245, 166, 35, 0.12);
    }

    &--blue {
      color: #1f2a72;
      background: rgba(31, 42, 114, 0.1);
    }
  }

  &__body {
    min-width: 0;
    text-align: left;
  }

  &__value {
    color: $primary;
    font-size: 1.62rem;
    font-weight: 800;
    line-height: 1.1;
  }

  &__title {
    font-size: 0.95rem;
    line-height: 1.3;
    margin-top: 2px;
  }

  &__description {
    margin-top: 4px;
    font-size: 0.78rem;
    line-height: 1.45;
  }
}

@media (max-width: 767px) {
  .base-info-card {
    min-height: 92px;
    padding: 16px;

    &--stat {
      min-height: 88px;
      padding: 14px 12px;
      gap: 10px;
    }

    &__icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      font-size: 1.3rem;
    }

    &__value {
      font-size: 1.35rem;
    }
  }
}
</style>
