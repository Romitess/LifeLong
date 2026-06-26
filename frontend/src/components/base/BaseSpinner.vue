<template>
  <div class="base-loading" :class="{ 'base-loading--full': full }">
    <div class="base-loading__content">
      <div class="base-loading__spinner">
        <div class="base-loading__circle"></div>
        <div class="base-loading__circle base-loading__circle--inner"></div>
        <q-icon name="school" class="base-loading__icon" size="32px" />
      </div>
      <div v-if="displayMessage" class="base-loading__message text-weight-bold q-mt-lg">
        {{ displayMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface Props {
  full?: boolean;
  message?: string;
}

const props = withDefaults(defineProps<Props>(), {
  full: false,
  message: '',
});

const { t } = useI18n();

const displayMessage = computed(() => props.message || t('loading'));
</script>

<style lang="scss" scoped>
.base-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px;

  &--full {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(4px);
    z-index: 9999;
    padding: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__spinner {
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__circle {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4px solid rgba($primary, 0.1);
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;

    &--inner {
      width: 70%;
      height: 70%;
      border-color: rgba($secondary, 0.1);
      border-bottom-color: $secondary;
      animation-direction: reverse;
      animation-duration: 0.8s;
    }
  }

  &__icon {
    color: $primary;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__message {
    color: #4b5563;
    font-size: 1.1rem;
    letter-spacing: 0.02em;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.15);
    opacity: 0.8;
  }
}
</style>
