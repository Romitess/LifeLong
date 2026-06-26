<template>
  <div
    v-if="showLearnerProgress && learnerProgress"
    class="learner-progress-pill-shell"
    :class="{ 'learner-progress-pill-shell--revealed': isPillVisible }"
  >
    <div class="learner-progress-pill">
      <span class="learner-progress-pill__spark learner-progress-pill__spark--fire-1" />
      <span class="learner-progress-pill__spark learner-progress-pill__spark--fire-2" />
      <span class="learner-progress-pill__spark learner-progress-pill__spark--star-1" />
      <span class="learner-progress-pill__spark learner-progress-pill__spark--star-2" />

      <div class="learner-progress-pill__segment learner-progress-pill__segment--fire">
        <q-icon name="local_fire_department" size="15px" color="deep-orange-6" />
        <span>{{ learnerProgress.streakDays }} วัน</span>
      </div>

      <span class="learner-progress-pill__divider" />

      <div class="learner-progress-pill__segment learner-progress-pill__segment--level">
        <span class="learner-progress-pill__label">Lv.</span>
        <span>{{ learnerProgress.level }}</span>
      </div>

      <span class="learner-progress-pill__divider" />

      <div class="learner-progress-pill__segment learner-progress-pill__segment--xp">
        <q-icon name="stars" size="15px" color="amber-8" />
        <span>{{ formattedXp }} XP</span>
      </div>

      <q-tooltip>สถิติการเรียนรู้ของคุณ</q-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useLearnerProgress } from 'src/composables/use-learner-progress';

const { learnerProgress, showLearnerProgress } = useLearnerProgress();
const route = useRoute();
const scrollY = ref(0);
const revealThreshold = 140;

const formattedXp = computed<string>(() =>
  (learnerProgress.value?.xp ?? 0).toLocaleString('en-US'),
);

const shouldDelayReveal = computed<boolean>(() => route.path === '/main' || route.path === '/');

const isPillVisible = computed<boolean>(() => {
  if (!showLearnerProgress.value || !learnerProgress.value) {
    return false;
  }

  if (!shouldDelayReveal.value) {
    return true;
  }

  return scrollY.value >= revealThreshold;
});

function syncScrollPosition(): void {
  if (typeof window === 'undefined') {
    return;
  }

  scrollY.value = window.scrollY || window.pageYOffset || 0;
}

onMounted(() => {
  syncScrollPosition();
  window.addEventListener('scroll', syncScrollPosition, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncScrollPosition);
});
</script>

<style lang="scss" scoped>
.learner-progress-pill-shell {
  flex: 0 1 auto;
  max-width: 0;
  opacity: 0;
  overflow: visible;
  transform: translateY(-14px) scale(0.88);
  transform-origin: right center;
  pointer-events: none;
  transition:
    max-width 0.62s cubic-bezier(0.2, 0.9, 0.2, 1),
    opacity 0.42s ease,
    transform 0.62s cubic-bezier(0.18, 0.9, 0.2, 1);
}

.learner-progress-pill-shell--revealed {
  max-width: 280px;
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.learner-progress-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(92, 61, 0, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  color: #5c3d00;
  white-space: nowrap;
  overflow: visible;
}

.learner-progress-pill__segment {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1;
}

.learner-progress-pill__segment--level {
  gap: 4px;
}

.learner-progress-pill__label {
  color: rgba(92, 61, 0, 0.7);
  font-size: 0.7rem;
  font-weight: 700;
}

.learner-progress-pill__divider {
  width: 1px;
  height: 14px;
  background: rgba(92, 61, 0, 0.16);
}

.learner-progress-pill__spark {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: 0;
}

.learner-progress-pill-shell--revealed .learner-progress-pill__spark {
  opacity: 1;
}

.learner-progress-pill__spark--fire-1,
.learner-progress-pill__spark--fire-2 {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 244, 180, 0.95),
    rgba(255, 147, 41, 0.88) 54%,
    rgba(255, 90, 31, 0.18) 100%
  );
  filter: blur(0.2px);
  box-shadow: 0 0 14px rgba(255, 131, 36, 0.55);
}

.learner-progress-pill__spark--fire-1 {
  top: -6px;
  left: 18px;
  animation: fireOrbRise 1.35s ease-in-out infinite;
}

.learner-progress-pill__spark--fire-2 {
  top: 24px;
  left: 34px;
  width: 8px;
  height: 8px;
  animation: fireOrbRise 1.7s ease-in-out 0.22s infinite;
}

.learner-progress-pill__spark--star-1,
.learner-progress-pill__spark--star-2 {
  width: 14px;
  height: 14px;
  right: 18px;
  background: linear-gradient(180deg, #ffe08a, #f5a623);
  clip-path: polygon(
    50% 0%,
    61% 37%,
    100% 37%,
    68% 58%,
    79% 100%,
    50% 73%,
    21% 100%,
    32% 58%,
    0% 37%,
    39% 37%
  );
  filter: drop-shadow(0 0 8px rgba(245, 166, 35, 0.45));
}

.learner-progress-pill__spark--star-1 {
  top: -7px;
  animation: starTwinkle 1.8s ease-in-out infinite;
}

.learner-progress-pill__spark--star-2 {
  top: 24px;
  right: 42px;
  width: 10px;
  height: 10px;
  animation: starTwinkle 1.5s ease-in-out 0.28s infinite;
}

.learner-progress-pill__segment--fire :deep(.q-icon) {
  animation: firePulse 1.2s ease-in-out infinite;
}

.learner-progress-pill__segment--xp :deep(.q-icon) {
  animation: starSpin 2.8s linear infinite;
  transform-origin: center;
}

@keyframes firePulse {
  0%,
  100% {
    transform: scale(1) rotate(-4deg);
    filter: drop-shadow(0 0 0 rgba(255, 124, 31, 0));
  }
  50% {
    transform: scale(1.16) rotate(4deg);
    filter: drop-shadow(0 0 8px rgba(255, 124, 31, 0.42));
  }
}

@keyframes fireOrbRise {
  0% {
    transform: translateY(8px) scale(0.75);
    opacity: 0;
  }
  25% {
    opacity: 0.95;
  }
  100% {
    transform: translateY(-14px) translateX(6px) scale(1.08);
    opacity: 0;
  }
}

@keyframes starSpin {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.12);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes starTwinkle {
  0%,
  100% {
    transform: scale(0.7) rotate(0deg);
    opacity: 0.25;
  }
  50% {
    transform: scale(1.1) rotate(18deg);
    opacity: 1;
  }
}
</style>
