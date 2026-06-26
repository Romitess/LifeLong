<template>
  <section class="instructor-page-hero">
    <div class="instructor-page-hero__overlay" />
    <div class="instructor-page-hero__content">
      <div class="instructor-page-hero__identity">
        <q-avatar size="100px" class="instructor-page-hero__avatar">
          <img
            v-if="authStore.user?.avatar"
            :src="authStore.user.avatar"
            alt="Instructor avatar"
            class="instructor-page-hero__avatar-image"
          />
          <q-icon v-else name="person" size="56px" color="white" />
        </q-avatar>

        <div class="instructor-page-hero__copy">
          <div class="instructor-page-hero__eyebrow">{{ eyebrow }}</div>
          <h1>{{ title }}</h1>
          <div class="instructor-page-hero__meta">
            <q-badge
              rounded
              color="positive"
              :label="t('profile.roles.instructor')"
              class="text-weight-bold"
            />
            <span>{{ authStore.user?.studentId || authStore.user?.username || '-' }}</span>
          </div>
          <p v-if="description">{{ description }}</p>
        </div>
      </div>

      <div v-if="$slots.actions" class="instructor-page-hero__actions">
        <slot name="actions" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();

defineProps<{
  description?: string;
  eyebrow: string;
  title: string;
}>();
</script>

<style lang="scss" scoped>
.instructor-page-hero {
  position: relative;
  overflow: hidden;
  width: 100vw;
  margin-left: 50%;
  margin-bottom: 28px;
  transform: translateX(-50%);
  background:
    radial-gradient(circle at 15% 25%, rgba(245, 166, 35, 0.3), transparent 40%),
    radial-gradient(circle at 85% 75%, rgba(35, 78, 112, 0.4), transparent 40%),
    linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #234e70 100%);
  color: #ffffff;
}

.instructor-page-hero::before {
  content: '';
  position: absolute;
  z-index: 1;
  top: -42%;
  left: -34%;
  width: 34%;
  height: 184%;
  background: linear-gradient(
    105deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.08) 32%,
    rgba(255, 255, 255, 0.34) 48%,
    rgba(255, 246, 199, 0.24) 56%,
    rgba(255, 255, 255, 0) 74%
  );
  filter: blur(1px);
  opacity: 0.88;
  pointer-events: none;
  transform: rotate(10deg);
  animation: instructorPageHeroShine 9.5s ease-in-out infinite;
}

.instructor-page-hero__overlay {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.015) 0,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 48px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.015) 0,
      rgba(255, 255, 255, 0.015) 1px,
      transparent 1px,
      transparent 48px
    );
  pointer-events: none;
}

.instructor-page-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 34px;
  max-width: 1280px;
  min-height: 200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.instructor-page-hero__identity {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 26px;
}

.instructor-page-hero__avatar {
  flex: 0 0 auto;
  border: 3px solid rgba(245, 166, 35, 0.48);
  background: rgba(255, 255, 255, 0.12);
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.08),
    0 14px 30px rgba(0, 0, 0, 0.24);
}

.instructor-page-hero__avatar-image {
  object-fit: cover;
}

.instructor-page-hero__copy {
  min-width: 0;
}

.instructor-page-hero__eyebrow {
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.instructor-page-hero h1 {
  margin: 6px 0 4px;
  font-size: clamp(2rem, 3vw, 2.6rem);
  font-weight: 800;
  line-height: 1.12;
}

.instructor-page-hero__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
  font-weight: 700;
}

.instructor-page-hero p {
  max-width: 720px;
  margin: 10px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.65;
}

.instructor-page-hero__actions {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 14px;
}

@keyframes instructorPageHeroShine {
  0% {
    transform: translateX(0) rotate(10deg);
  }

  42%,
  100% {
    transform: translateX(440%) rotate(10deg);
  }
}

@media (max-width: 1180px) {
  .instructor-page-hero__content {
    align-items: flex-start;
    flex-direction: column;
  }

  .instructor-page-hero__actions {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .instructor-page-hero__content {
    align-items: flex-start;
    flex-direction: column;
    min-height: auto;
    padding: 30px 16px;
  }

  .instructor-page-hero__identity {
    align-items: flex-start;
    flex-direction: column;
    gap: 18px;
  }

  .instructor-page-hero__avatar {
    width: 82px !important;
    height: 82px !important;
    font-size: 82px !important;
  }
}
</style>
