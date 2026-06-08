<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

const homeRoute = computed(() => {
  switch (authStore.user?.role) {
    case 'admin':
      return '/admin/dashboard';
    case 'teach':
      return '/instructor/dashboard';
    case 'finance':
      return '/finance/dashboard';
    case 'central_finance':
      return '/central-finance/dashboard';
    case 'lifelong2':
      return '/lifelong2/dashboard';
    default:
      return '/main';
  }
});

function goBack() {
  // Go back 2 steps to skip both /403 and the page that triggered it.
  // Fall back to homeRoute if there isn't enough history.
  if (window.history.length > 2) {
    router.go(-2);
  } else {
    void router.push(homeRoute.value);
  }
}
</script>

<template>
  <div class="error-403 fullscreen flex flex-center">
    <!-- Ambient glowing shapes in the background -->
    <div class="error-403__bg-shapes" aria-hidden="true">
      <div class="shape shape--circle-1" />
      <div class="shape shape--circle-2" />
      <div class="shape shape--circle-3" />
    </div>

    <div class="error-403__card">
      <div class="error-403__icon-wrap">
        <q-icon name="lock" class="error-403__icon" />
      </div>

      <div class="error-403__code">403</div>

      <h1 class="error-403__title">ไม่มีสิทธิ์เข้าถึง</h1>
      <p class="error-403__subtitle">
        คุณไม่มีสิทธิ์เข้าถึงหน้านี้<br />
        กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
      </p>

      <div class="error-403__actions">
        <q-btn
          unelevated
          color="primary"
          text-color="white"
          label="กลับหน้าหลัก"
          icon="home"
          no-caps
          class="error-403__btn"
          @click="$router.push(homeRoute)"
        />
        <q-btn
          outline
          color="secondary"
          label="ย้อนกลับ"
          icon="arrow_back"
          no-caps
          class="error-403__btn-back"
          @click="goBack()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-403 {
  background:
    linear-gradient(
      110deg,
      rgba(248, 246, 241, 0.95) 0%,
      rgba(255, 250, 239, 0.9) 52%,
      rgba(248, 246, 241, 0.85) 100%
    ),
    url('../assets/login-bg.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  &__bg-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.6;
  }

  .shape--circle-1 {
    width: 450px;
    height: 450px;
    top: -100px;
    right: -100px;
    background: rgba($primary, 0.15); // soft gold glow
  }

  .shape--circle-2 {
    width: 550px;
    height: 550px;
    bottom: -120px;
    left: -120px;
    background: rgba($secondary, 0.12); // soft navy glow
  }

  .shape--circle-3 {
    width: 250px;
    height: 250px;
    top: 40%;
    left: 10%;
    background: rgba($accent, 0.08); // soft orange glow
  }

  &__card {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 48px 40px;
    max-width: 480px;
    width: 90%;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba($primary, 0.16);
    border-radius: 24px;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow:
      0 24px 72px rgba(17, 24, 39, 0.12),
      0 0 0 1px rgba($primary, 0.04);
  }

  &__icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, $primary 0%, $accent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 10px 24px rgba($primary, 0.35);
  }

  &__icon {
    font-size: 40px;
    color: #fff;
  }

  &__code {
    font-size: clamp(80px, 18vw, 120px);
    font-weight: 900;
    line-height: 1;
    color: transparent;
    background: linear-gradient(135deg, $secondary 0%, #283593 50%, $secondary 100%);
    -webkit-background-clip: text;
    background-clip: text;
    letter-spacing: -4px;
    margin-bottom: 16px;
  }

  &__title {
    font-size: 1.6rem;
    font-weight: 800;
    color: $secondary;
    margin: 0 0 12px;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: #4b5563; // Neutral text color for readability on white card
    line-height: 1.7;
    margin: 0 0 32px;
  }

  &__actions {
    display: flex;
    flex-direction: row;
    gap: 16px;
    justify-content: center;
    width: 100%;

    @media (max-width: 480px) {
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
  }

  &__btn,
  &__btn-back {
    width: 100%;
    max-width: 180px;
    font-size: 0.95rem;
    padding: 10px 24px;
    border-radius: 12px;
    font-weight: 600;

    @media (max-width: 480px) {
      max-width: 240px;
    }
  }

  &__btn {
    box-shadow: 0 6px 16px rgba($primary, 0.2) !important;
  }
}
</style>
