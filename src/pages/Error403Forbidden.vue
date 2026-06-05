<template>
  <div class="error-403 fullscreen flex flex-center">
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
          to="/main"
        />
        <q-btn
          flat
          color="white"
          label="ย้อนกลับ"
          icon="arrow_back"
          no-caps
          class="error-403__btn-back"
          @click="$router.back()"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-403 {
  background: linear-gradient(135deg, #1a237e 0%, #283593 40%, #3949ab 100%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  &__bg-shapes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .shape {
    position: absolute;
    border-radius: 50%;
    opacity: 0.08;
    background: #f5a623;
  }

  .shape--circle-1 {
    width: 500px;
    height: 500px;
    top: -120px;
    right: -100px;
  }

  .shape--circle-2 {
    width: 300px;
    height: 300px;
    bottom: -80px;
    left: -60px;
    background: #e65100;
    opacity: 0.1;
  }

  .shape--circle-3 {
    width: 180px;
    height: 180px;
    top: 50%;
    left: 8%;
    opacity: 0.06;
  }

  &__card {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 48px 40px;
    max-width: 480px;
    width: 90%;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 24px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  &__icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5a623 0%, #e65100 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    box-shadow: 0 8px 32px rgba(245, 166, 35, 0.4);
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
    background: linear-gradient(135deg, #f5a623 0%, #ffd97d 50%, #f5a623 100%);
    -webkit-background-clip: text;
    background-clip: text;
    letter-spacing: -4px;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 12px;
  }

  &__subtitle {
    font-size: 0.95rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.7;
    margin: 0 0 36px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  &__btn {
    width: 100%;
    max-width: 240px;
    border-radius: 12px;
    font-size: 0.95rem;
    padding: 10px 24px;
  }

  &__btn-back {
    color: rgba(255, 255, 255, 0.7) !important;
    font-size: 0.9rem;

    &:hover {
      color: #fff !important;
    }
  }
}
</style>
