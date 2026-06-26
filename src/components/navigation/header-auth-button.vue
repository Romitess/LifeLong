<template>
  <q-btn
    unelevated
    no-caps
    class="header-auth-button"
    :class="`header-auth-button--${variant}`"
    :aria-label="label"
    @click="(e) => emit('click', e)"
  >
    <span class="header-auth-button__inner">
      <span class="header-auth-button__label">{{ label }}</span>
      <q-icon class="header-auth-button__icon" :name="resolvedIcon" />
    </span>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type HeaderAuthButtonVariant = 'login' | 'register';

interface Props {
  variant: HeaderAuthButtonVariant;
  label: string;
  icon?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [event: Event];
}>();

const defaultIcons: Record<HeaderAuthButtonVariant, string> = {
  login: 'login',
  register: 'person_add',
};

const resolvedIcon = computed(() => props.icon ?? defaultIcons[props.variant]);
</script>

<style lang="scss" scoped>
.header-auth-button {
  --auth-button-width: 118px;

  flex: 0 0 var(--auth-button-width);
  width: var(--auth-button-width);
  min-width: var(--auth-button-width);
  max-width: var(--auth-button-width);
  height: 36px;
  min-height: 36px;
  padding: 0 12px !important;
  border: 0 !important;
  border-radius: 10px !important;
  color: #5c3d00 !important;
  background: rgba(255, 255, 255, 0.72) !important;
  box-shadow: none !important;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;

  &--login {
    color: #ffffff !important;
    background: $primary !important;
    box-shadow: 0 2px 8px rgba($primary, 0.28) !important;
  }

  &--register {
    --auth-button-width: 158px;
  }

  &:hover {
    transform: translateY(-2px);
    background: #ffffff !important;
    box-shadow: 0 6px 16px rgba(17, 24, 39, 0.1) !important;
  }

  &--login:hover {
    background: $primary !important;
    box-shadow: 0 8px 20px rgba($primary, 0.36) !important;
  }

  :deep(.q-btn__content) {
    width: 100%;
  }
}

.header-auth-button__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 18px;
  align-items: center;
  width: 100%;
  column-gap: 7px;
}

.header-auth-button__label {
  min-width: 0;
  overflow: hidden;
  color: inherit;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.header-auth-button__icon {
  justify-self: end;
  width: 18px;
  font-size: 1.08rem;
}
</style>
