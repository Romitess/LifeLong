<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    maximized
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="login-checkin">
      <div class="login-checkin__body">
        <div class="login-checkin__mascot">
          <div class="login-checkin__mascot-jump">
            <svg viewBox="0 0 180 120" aria-hidden="true" class="login-checkin__dolphin">
              <defs>
                <linearGradient id="dolphin-body" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffd76a" />
                  <stop offset="28%" stop-color="#ff9f1c" />
                  <stop offset="62%" stop-color="#ff6b1a" />
                  <stop offset="100%" stop-color="#c53d13" />
                </linearGradient>
                <linearGradient id="dolphin-belly" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#fff4bf" />
                  <stop offset="100%" stop-color="#ffd166" />
                </linearGradient>
                <radialGradient id="dolphin-glow" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stop-color="rgba(255, 223, 120, 0.95)" />
                  <stop offset="100%" stop-color="rgba(255, 223, 120, 0)" />
                </radialGradient>
              </defs>

              <ellipse cx="96" cy="58" rx="64" ry="30" fill="url(#dolphin-glow)" />

              <path
                d="M20 98 C30 74 52 42 88 26 C113 14 139 18 153 28 C163 35 165 47 158 54 C149 63 134 64 119 58 C113 70 102 80 84 90 C63 102 41 106 20 98 Z"
                fill="url(#dolphin-body)"
              />
              <path
                d="M82 39 C92 23 111 11 132 14 C125 27 122 39 124 51 C110 56 97 54 82 39 Z"
                fill="url(#dolphin-body)"
              />
              <path
                d="M109 58 C121 58 134 54 144 47 C143 60 132 72 116 78 C98 85 77 84 54 74 C71 73 93 68 109 58 Z"
                fill="url(#dolphin-belly)"
              />
              <path
                d="M59 75 C56 86 51 95 42 102 C37 93 35 84 37 74 C44 78 51 79 59 75 Z"
                fill="url(#dolphin-body)"
              />
              <path
                d="M69 66 C74 60 80 57 87 56 C84 67 79 76 71 82 C67 77 66 71 69 66 Z"
                fill="#8f260f"
              />
              <path
                d="M142 39 C149 36 155 38 160 44 C154 48 147 49 140 47 C139 44 140 41 142 39 Z"
                fill="#b93816"
              />
              <circle cx="144" cy="35" r="2.4" fill="#0f172a" />
              <path
                d="M149 40 C154 41 158 43 161 46"
                stroke="#ffe7a8"
                stroke-width="1.8"
                stroke-linecap="round"
                fill="none"
              />
              <path
                d="M88 25 C109 12 131 11 145 18"
                stroke="rgba(255,248,214,0.5)"
                stroke-width="3"
                stroke-linecap="round"
                fill="none"
              />
            </svg>
          </div>

          <div class="login-checkin__water">
            <span class="login-checkin__splash login-checkin__splash--left" />
            <span class="login-checkin__splash login-checkin__splash--right" />
          </div>
        </div>

        <div class="login-checkin__count">{{ streakDays }}</div>
        <div class="login-checkin__label">{{ streakLabel }}</div>

        <div class="login-checkin__week-card">
          <div class="login-checkin__week-row">
            <div v-for="day in days" :key="day.key" class="login-checkin__day">
              <span
                class="login-checkin__day-label"
                :class="{ 'login-checkin__day-label--today': day.isToday }"
              >
                {{ day.label }}
              </span>
              <span
                class="login-checkin__day-dot"
                :class="{
                  'login-checkin__day-dot--checked': day.checked,
                  'login-checkin__day-dot--today': day.isToday,
                }"
              >
                <span v-if="day.checked" class="login-checkin__day-stamp" aria-hidden="true"
                  >🐬</span
                >
              </span>
            </div>
          </div>

          <div class="login-checkin__message">
            {{ description }}
          </div>
        </div>
      </div>

      <div class="login-checkin__footer">
        <div class="login-checkin__brand">
          <div class="login-checkin__brand-mark">
            <img :src="brandLogo" alt="Lifelong Learning logo" class="login-checkin__brand-logo" />
          </div>
          <div class="login-checkin__brand-copy">
            <strong>Lifelong Learning</strong>
            <span>Burapha University</span>
          </div>
        </div>

        <div class="login-checkin__actions">
          <q-btn
            outline
            no-caps
            color="grey-5"
            class="login-checkin__review"
            :label="secondaryLabel"
            @click="emit('continue')"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            class="login-checkin__continue"
            :label="continueLabel"
            @click="emit('continue')"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import brandLogo from 'src/assets/brand/buu-lll-logo.png';

interface LoginCheckInDay {
  checked: boolean;
  isToday: boolean;
  key: string;
  label: string;
}

const props = defineProps<{
  continueLabel: string;
  days: LoginCheckInDay[];
  description: string;
  modelValue: boolean;
  secondaryLabel: string;
  streakDays: number;
  streakLabel: string;
}>();

const emit = defineEmits<{
  (event: 'continue'): void;
  (event: 'update:modelValue', value: boolean): void;
}>();

void props;
</script>

<style lang="scss" scoped>
.login-checkin {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #ffffff;
}

.login-checkin__body {
  flex: 1;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 18px;
  padding: 48px 24px 32px;
}

.login-checkin__mascot {
  position: relative;
  display: grid;
  width: 280px;
  height: 198px;
  justify-items: center;
  align-items: end;
}

.login-checkin__mascot-jump {
  width: 230px;
  transform-origin: 50% 85%;
  animation: dolphin-leap 3.2s ease-in-out infinite;
}

.login-checkin__dolphin {
  display: block;
  width: 100%;
  height: auto;
  filter: drop-shadow(0 24px 30px rgba(255, 102, 0, 0.28))
    drop-shadow(0 0 20px rgba(255, 196, 84, 0.38)) drop-shadow(0 0 38px rgba(255, 92, 0, 0.2));
}

.login-checkin__water {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 254px;
  height: 48px;
  transform: translateX(-50%);
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 28%, rgba(255, 238, 171, 0.95) 0 12%, transparent 13%),
    radial-gradient(circle at 28% 42%, rgba(255, 210, 110, 0.62) 0 10%, transparent 11%),
    radial-gradient(circle at 74% 44%, rgba(255, 141, 43, 0.55) 0 12%, transparent 13%),
    linear-gradient(180deg, #ffd75f 0%, #ff9418 38%, #f55b12 72%, #b92c10 100%);
  box-shadow:
    0 18px 36px rgba(245, 91, 18, 0.26),
    0 0 28px rgba(255, 153, 51, 0.24),
    inset 0 4px 0 rgba(255, 245, 196, 0.45),
    inset 0 -8px 18px rgba(142, 24, 7, 0.24);
}

.login-checkin__water::before {
  content: '';
  position: absolute;
  inset: 6px 16px 16px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 244, 191, 0.44) 0%, rgba(255, 173, 45, 0.08) 100%);
}

.login-checkin__water::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 8px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(255, 229, 144, 0.08) 0%,
    rgba(255, 229, 144, 0.48) 12%,
    rgba(255, 229, 144, 0.12) 24%,
    rgba(255, 229, 144, 0.52) 38%,
    rgba(255, 229, 144, 0.16) 50%,
    rgba(255, 229, 144, 0.48) 66%,
    rgba(255, 229, 144, 0.12) 78%,
    rgba(255, 229, 144, 0.44) 100%
  );
  opacity: 0.8;
}

.login-checkin__splash {
  position: absolute;
  bottom: 26px;
  width: 24px;
  height: 24px;
  border-radius: 999px 999px 999px 0;
  background: linear-gradient(180deg, rgba(255, 230, 125, 0.94) 0%, rgba(255, 104, 24, 0.88) 100%);
  box-shadow: 0 0 18px rgba(255, 140, 0, 0.22);
  animation: splash-bob 1.8s ease-in-out infinite;
}

.login-checkin__splash--left {
  left: 34px;
  transform: rotate(-28deg);
}

.login-checkin__splash--right {
  right: 34px;
  transform: scaleX(-1) rotate(-28deg);
  animation-delay: 0.24s;
}

.login-checkin__count {
  color: #ff9800;
  font-size: clamp(4rem, 7vw, 6.5rem);
  font-weight: 800;
  line-height: 1;
}

.login-checkin__label {
  color: #ff9800;
  font-size: clamp(1.5rem, 2.4vw, 2.1rem);
  font-weight: 800;
}

.login-checkin__week-card {
  width: min(100%, 580px);
  border: 2px solid #eef0f3;
  border-radius: 26px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(17, 24, 39, 0.08);
}

.login-checkin__week-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 14px;
  padding: 26px 24px 22px;
}

.login-checkin__day {
  display: grid;
  justify-items: center;
  gap: 12px;
}

.login-checkin__day-label {
  color: #b4bac3;
  font-size: 1.18rem;
  font-weight: 800;
}

.login-checkin__day-label--today {
  color: #ff9800;
}

.login-checkin__day-dot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #ffffff;
  font-size: 1.2rem;
}

.login-checkin__day-dot--checked {
  background: #ff9800;
}

.login-checkin__day-stamp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  line-height: 1;
  transform: translateY(1px);
  filter: grayscale(1) drop-shadow(0 1px 0 rgba(255, 255, 255, 0.18));
}

.login-checkin__day-dot--today {
  box-shadow: 0 0 0 5px rgba(255, 152, 0, 0.16);
}

.login-checkin__message {
  border-top: 1px solid #eef0f3;
  padding: 22px 28px 24px;
  color: #5e6673;
  font-size: 1.12rem;
  line-height: 1.7;
  text-align: center;
}

.login-checkin__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px 28px;
  border-top: 1px solid rgba(214, 176, 54, 0.2);
  background: linear-gradient(180deg, #fff9e8 0%, #fdf1bf 100%);
}

.login-checkin__brand {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.login-checkin__brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(214, 176, 54, 0.16);
  box-shadow: 0 10px 24px rgba(214, 176, 54, 0.1);
}

.login-checkin__brand-logo {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.login-checkin__brand-copy {
  display: grid;
  gap: 4px;
  color: rgba(107, 83, 13, 0.7);
}

.login-checkin__brand-copy strong {
  color: #6c5008;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.2;
}

.login-checkin__brand-copy span {
  font-size: 0.92rem;
  font-weight: 600;
}

.login-checkin__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.login-checkin__review,
.login-checkin__continue {
  min-width: 180px;
  min-height: 58px;
  border-radius: 18px;
  font-size: 1rem;
  font-weight: 800;
}

.login-checkin__continue {
  box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.08);
}

@keyframes dolphin-leap {
  0%,
  100% {
    transform: translateY(10px) rotate(-8deg) scale(0.985);
  }

  20% {
    transform: translateY(-18px) rotate(-13deg) scale(1.01);
  }

  50% {
    transform: translateY(-34px) rotate(-10deg) scale(1.04);
  }

  80% {
    transform: translateY(-10px) rotate(-7deg) scale(1);
  }
}

@keyframes splash-bob {
  0%,
  100% {
    opacity: 0.45;
    transform: translateY(0) scale(0.88) rotate(-28deg);
  }

  50% {
    opacity: 0.92;
    transform: translateY(-14px) scale(1.08) rotate(-20deg);
  }
}

@media (max-width: 640px) {
  .login-checkin__body {
    padding-top: 36px;
  }

  .login-checkin__mascot {
    width: 220px;
    height: 160px;
  }

  .login-checkin__mascot-jump {
    width: 180px;
  }

  .login-checkin__water {
    width: 206px;
    height: 40px;
  }

  .login-checkin__week-row {
    gap: 8px;
    padding-inline: 14px;
  }

  .login-checkin__day-dot {
    width: 42px;
    height: 42px;
  }

  .login-checkin__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .login-checkin__brand,
  .login-checkin__actions {
    width: 100%;
  }

  .login-checkin__actions {
    flex-direction: column-reverse;
  }

  .login-checkin__review,
  .login-checkin__continue {
    width: 100%;
  }
}
</style>
