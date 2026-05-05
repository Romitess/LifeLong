<template>
  <div class="language-switch" :class="{ 'language-switch--wide': wide }">
    <q-icon name="translate" size="18px" class="language-switch__icon" />

    <div class="language-switch__toggle" role="group" :aria-label="t('language')">
      <span
        class="language-switch__thumb"
        :class="{ 'language-switch__thumb--right': selectedLocale === 'en-US' }"
      />
      <button
        v-for="option in languageOptions"
        :key="option.value"
        type="button"
        class="language-switch__option"
        :class="{ 'language-switch__option--active': selectedLocale === option.value }"
        :aria-pressed="selectedLocale === option.value"
        @click="selectedLocale = option.value"
      >
        {{ option.label }}
      </button>
    </div>

    <q-tooltip v-if="!wide">{{ t('language') }}</q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

type SupportedLocale = 'th' | 'en-US';

interface Props {
  wide?: boolean;
}

interface LanguageOption {
  label: string;
  value: SupportedLocale;
}

withDefaults(defineProps<Props>(), {
  wide: false,
});

const { locale, t } = useI18n({ useScope: 'global' });

const languageOptions: LanguageOption[] = [
  { label: 'TH', value: 'th' },
  { label: 'EN', value: 'en-US' },
];

const selectedLocale = computed<SupportedLocale>({
  get() {
    return isSupportedLocale(locale.value) ? locale.value : 'th';
  },
  set(value) {
    // Save document height and scroll position before the language change
    const scrollY = window.scrollY;
    const docHeightBefore = document.documentElement.scrollHeight;

    locale.value = value;
    saveLocale(value);

    // After Vue re-renders, adjust scroll so the viewport stays in the same relative place
    void nextTick(() => {
      const docHeightAfter = document.documentElement.scrollHeight;
      const delta = docHeightAfter - docHeightBefore;
      window.scrollTo({ top: scrollY + delta, behavior: 'instant' });
    });
  },
});

function isSupportedLocale(value: string): value is SupportedLocale {
  return value === 'th' || value === 'en-US';
}

function saveLocale(value: SupportedLocale): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('lang', value);
}
</script>

<style lang="scss" scoped>
.language-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 38px;
  padding: 4px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.language-switch:hover {
  border-color: rgba($primary, 0.42);
  box-shadow: 0 10px 24px rgba(17, 24, 39, 0.1);
}

.language-switch__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: $primary;
  background: rgba($primary, 0.14);
  transition:
    background 0.24s ease,
    transform 0.24s ease;
}

.language-switch:hover .language-switch__icon {
  background: rgba($primary, 0.2);
  transform: rotate(-8deg);
}

.language-switch__toggle {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(40px, 1fr));
  gap: 0;
  overflow: hidden;
  padding: 2px;
  border-radius: 999px;
  background: #edf1f4;
  isolation: isolate;
}

.language-switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  z-index: 0;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd977 0%, $primary 100%);
  box-shadow:
    0 5px 12px rgba($primary, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  transition:
    transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.24s ease;
}

.language-switch__thumb--right {
  transform: translateX(100%);
}

.language-switch__option {
  position: relative;
  z-index: 1;
  min-width: 40px;
  min-height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #516170;
  cursor: pointer;
  font: inherit;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
  transition:
    color 0.2s ease,
    transform 0.18s ease;
}

.language-switch__option:hover {
  color: #1f2937;
}

.language-switch__option:active {
  transform: scale(0.96);
}

.language-switch__option:focus-visible {
  outline: 2px solid rgba($primary, 0.48);
  outline-offset: 2px;
}

.language-switch__option--active {
  color: #1f2937;
  transform: translateY(-1px);
}

.language-switch--wide {
  display: flex;
  width: 100%;
  min-height: 46px;
  padding: 6px;
  border-radius: 14px;

  .language-switch__toggle {
    flex: 1;
  }

  .language-switch__option {
    min-height: 32px;
  }
}
</style>
