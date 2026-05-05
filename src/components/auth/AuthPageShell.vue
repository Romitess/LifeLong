<template>
  <q-page class="auth-page" :class="`auth-page--${variant}`">
    <div class="auth-page__language">
      <LanguageToggle />
    </div>

    <section
      class="auth-shell"
      :class="[
        `auth-shell--${variant}`,
        switchingTo ? 'auth-shell--content-exit-right' : '',
        isContentEntering ? 'auth-shell--content-enter-right' : '',
      ]"
    >
      <aside class="auth-visual">
        <div class="auth-visual__content">
          <img src="~assets/brand/buu-lll-logo.png" class="auth-logo" alt="BUU LLL" />

          <div class="auth-copy">
            <div v-if="eyebrow" class="auth-eyebrow">{{ eyebrow }}</div>
            <h1>{{ title }}</h1>
            <p v-if="subtitle">{{ subtitle }}</p>
          </div>

          <div class="auth-visual-list">
            <div
              v-for="item in visualItems"
              :key="`${item.icon}-${item.text}`"
              class="auth-visual-item"
            >
              <q-icon :name="item.icon" />
              <div>
                <strong v-if="item.title">{{ item.title }}</strong>
                <span>{{ item.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main class="auth-panel">
        <div class="auth-panel__header">
          <div class="auth-panel__icon">
            <q-icon :name="panelIcon" />
          </div>
          <div>
            <h2>{{ panelTitle }}</h2>
            <p v-if="panelSubtitle">{{ panelSubtitle }}</p>
          </div>
        </div>

        <slot />
      </main>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import LanguageToggle from 'components/navigation/language-toggle.vue';

export interface AuthVisualItem {
  icon: string;
  title?: string;
  text: string;
}

interface Props {
  variant: 'login' | 'register';
  eyebrow?: string;
  title: string;
  subtitle?: string;
  panelIcon: string;
  panelTitle: string;
  panelSubtitle?: string;
  visualItems: AuthVisualItem[];
  switchingTo?: 'login' | 'register' | null;
}

const props = defineProps<Props>();

const authTransitionKey = 'lll-auth-content-transition';
const isContentEntering = ref(false);
let entryTimer: ReturnType<typeof setTimeout> | undefined;

function setAuthTransition(target: 'login' | 'register'): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(authTransitionKey, `to-${target}`);
}

function clearAuthTransition(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(authTransitionKey);
}

watch(
  () => props.switchingTo,
  (target) => {
    if (target) {
      setAuthTransition(target);
    }
  },
);

onMounted(() => {
  if (typeof window === 'undefined') {
    return;
  }

  const transitionTarget = window.sessionStorage.getItem(authTransitionKey);

  if (transitionTarget !== `to-${props.variant}`) {
    return;
  }

  clearAuthTransition();
  isContentEntering.value = true;
  entryTimer = setTimeout(() => {
    isContentEntering.value = false;
  }, 620);
});

onBeforeUnmount(() => {
  if (entryTimer) {
    clearTimeout(entryTimer);
  }
});
</script>

<style lang="scss" scoped>
.auth-page {
  box-sizing: border-box;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 48%, #f3f6f8 100%);
}

.auth-page__language {
  position: fixed;
  top: 20px;
  right: 24px;
  z-index: 3;
}

.auth-shell {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: min(1080px, 100%);
  height: min(570px, calc(100dvh - 40px));
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 14px;
  background: #ffffff;
  box-shadow:
    0 18px 44px rgba(17, 24, 39, 0.1),
    0 2px 8px rgba(17, 24, 39, 0.04);
}

.auth-page--register .auth-shell {
  width: min(1080px, 100%);
  height: min(570px, calc(100dvh - 40px));
}

.auth-visual {
  position: relative;
  display: flex;
  min-height: 100%;
  padding: 30px;
  color: #111827;
  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.98) 0%,
      rgba(255, 255, 255, 0.94) 50%,
      rgba(255, 255, 255, 0.7) 100%
    ),
    url('../../assets/homepicture2.png');
  background-size: cover;
  background-position: 58% center;
  border-right: 1px solid rgba(17, 24, 39, 0.08);
  z-index: 2;
}

.auth-visual__content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  transition:
    transform 0.48s cubic-bezier(0.76, 0, 0.24, 1),
    opacity 0.28s ease;
}

.auth-logo {
  width: min(184px, 74%);
  padding: 9px 11px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
}

.auth-copy {
  width: min(100%, 500px);
  padding: 0;

  h1 {
    margin: 8px 0 10px;
    color: $secondary;
    font-size: clamp(1.55rem, 2.6vw, 2.2rem);
    line-height: 1.12;
    font-weight: 800;
    letter-spacing: 0;
  }

  p {
    max-width: 440px;
    margin: 0;
    color: #475467;
    font-size: 0.92rem;
    font-weight: 500;
    line-height: 1.6;
  }
}

.auth-eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 5px 11px;
  border-radius: 999px;
  color: #8a5a11;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba($primary, 0.28);
  font-size: 0.78rem;
  font-weight: 800;
}

.auth-visual-list {
  display: grid;
  gap: 8px;
}

.auth-visual-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.84);
  backdrop-filter: blur(10px);

  .q-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    color: $primary;
    background: rgba($primary, 0.12);
    box-shadow: inset 0 0 0 1px rgba($primary, 0.16);
    font-size: 20px;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #111827;
    font-size: 0.9rem;
  }

  span {
    color: #475467;
    font-size: 0.86rem;
    font-weight: 500;
    line-height: 1.5;
  }
}

.auth-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  padding: clamp(18px, 2.4vw, 30px);
  background: #ffffff;
  box-shadow: inset 1px 0 0 rgba(17, 24, 39, 0.04);
  overflow-y: auto;
  min-height: 0;
  transition:
    transform 0.48s cubic-bezier(0.76, 0, 0.24, 1),
    opacity 0.28s ease;
  z-index: 1;
}

.auth-page--register .auth-panel {
  justify-content: flex-start;
  gap: 12px;
  padding: clamp(18px, 2.2vw, 28px);
}

.auth-shell--content-exit-right .auth-panel {
  opacity: 0;
  pointer-events: none;
  transform: translateX(calc(100% + 72px));
}

.auth-shell--content-exit-right .auth-visual__content {
  opacity: 0;
  pointer-events: none;
  transform: translateX(calc(-100% - 72px));
}

.auth-shell--content-enter-right .auth-panel {
  animation: auth-slide-enter-right 0.58s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.auth-shell--content-enter-right .auth-visual__content {
  animation: auth-slide-enter-left 0.58s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.auth-panel__header {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  align-items: center;
  animation: auth-content-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;

  h2,
  p {
    margin: 0;
  }

  h2 {
    color: #111827;
    font-size: 1.25rem;
    font-weight: 800;
  }

  p {
    color: #667085;
    font-size: 0.9rem;
    line-height: 1.5;
  }
}

.auth-panel__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: $secondary;
  background: rgba($secondary, 0.08);
  box-shadow: inset 0 0 0 1px rgba($primary, 0.2);
  font-size: 22px;
}

.auth-panel > :deep(:not(.auth-panel__header)) {
  animation: auth-content-enter 0.34s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.auth-panel > :deep(:nth-child(2)) {
  animation-delay: 0.04s;
}

.auth-panel > :deep(:nth-child(3)) {
  animation-delay: 0.08s;
}

.auth-panel > :deep(:nth-child(4)) {
  animation-delay: 0.12s;
}

@keyframes auth-content-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes auth-slide-enter-right {
  0% {
    opacity: 0;
    transform: translateX(calc(100% + 72px));
  }

  72% {
    opacity: 1;
    transform: translateX(-10px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes auth-slide-enter-left {
  0% {
    opacity: 0;
    transform: translateX(calc(-100% - 72px));
  }

  72% {
    opacity: 1;
    transform: translateX(10px);
  }

  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-panel__header,
  .auth-panel > :deep(:not(.auth-panel__header)),
  .auth-shell--content-enter-right .auth-panel,
  .auth-shell--content-enter-right .auth-visual__content {
    animation: none;
  }
}

@media (max-width: 980px) {
  .auth-page {
    align-items: flex-start;
    padding: 84px 16px 24px;
  }

  .auth-page__language {
    top: 16px;
    right: 16px;
  }

  .auth-shell,
  .auth-page--register .auth-shell {
    grid-template-columns: 1fr;
    height: auto;
    min-height: auto;
    border-radius: 14px;
  }

  .auth-visual {
    min-height: 320px;
    padding: 28px;
    border-right: 0;
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  }

  .auth-shell--register .auth-visual,
  .auth-shell--register .auth-panel {
    grid-column: auto;
    grid-row: auto;
  }

  .auth-panel,
  .auth-page--register .auth-panel {
    padding: 26px 20px 28px;
  }
}

@media (max-width: 520px) {
  .auth-panel__header {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-visual__content,
  .auth-panel {
    transition: none;
  }
}
</style>
