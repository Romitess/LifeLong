<template>
  <q-page class="forgot-page">
    <header class="top-header">
      <div class="header-inner">
        <img src="~assets/brand/buu-lll-logo.png" class="logo" alt="BUU LLL" />

        <div class="header-actions">
          <LanguageToggle />
          <q-btn
            class="header-auth-btn header-auth-btn--login"
            color="primary"
            text-color="white"
            :label="$t('auth.forgot.login')"
            icon-right="login"
            no-caps
            unelevated
            to="/login"
          />
          <q-btn
            class="header-auth-btn header-auth-btn--register"
            :label="$t('auth.forgot.register')"
            icon-right="person_add"
            no-caps
            unelevated
            to="/register"
          />
        </div>
      </div>
    </header>

    <main class="content-wrapper">
      <div class="page-accent page-accent--one"></div>
      <div class="page-accent page-accent--two"></div>

      <div class="content-grid">
        <section class="info-panel">
          <div class="info-panel__eyebrow">
            <q-icon name="lock_reset" />
            <span>{{ $t('auth.forgot.title') }}</span>
          </div>

          <h1 class="page-title">{{ $t('auth.forgot.pageTitle') }}</h1>

          <p class="hero-copy">
            {{ $t('auth.forgot.generalDesc') }}
          </p>

          <div class="info-list">
            <article class="info-item">
              <div class="info-item__icon">
                <q-icon name="alternate_email" />
              </div>
              <div>
                <h2>{{ $t('auth.forgot.generalUser') }}</h2>
                <p>{{ $t('auth.forgot.generalDesc') }}</p>
              </div>
            </article>

            <article class="info-item">
              <div class="info-item__icon info-item__icon--blue">
                <q-icon name="school" />
              </div>
              <div>
                <h2>{{ $t('auth.forgot.buuUser') }}</h2>
                <p>{{ $t('auth.forgot.buuDesc') }}</p>
              </div>
            </article>
          </div>

          <q-btn
            class="myid-btn"
            unelevated
            icon-right="open_in_new"
            href="https://myid.buu.ac.th"
            target="_blank"
            rel="noopener noreferrer"
            no-caps
          >
            <span>{{ $t('auth.forgot.myId') }}</span>
          </q-btn>
        </section>

        <section class="form-card">
          <template v-if="!submitted">
            <div class="form-card__header">
              <div class="form-card__icon">
                <q-icon name="mark_email_unread" />
              </div>
              <div>
                <h2>{{ $t('auth.forgot.title') }}</h2>
                <p>{{ $t('auth.forgot.generalUser') }}</p>
              </div>
            </div>

            <q-form class="forgot-form" @submit.prevent="submitEmail">
              <q-input
                v-model="email"
                outlined
                dense
                bg-color="white"
                type="email"
                autocomplete="email"
                class="email-input"
                :label="$t('auth.forgot.emailLabel')"
                :disable="isLoading"
              >
                <template #prepend>
                  <q-icon name="alternate_email" />
                </template>
              </q-input>

              <div v-if="error" class="error-msg">{{ error }}</div>

              <q-btn
                class="submit-btn"
                color="primary"
                text-color="white"
                icon-right="send"
                :label="isLoading ? $t('auth.forgot.submitting') : $t('auth.forgot.submit')"
                type="submit"
                unelevated
                no-caps
                :loading="isLoading"
              />
            </q-form>

            <div class="related-links">
              <h3>{{ $t('auth.forgot.relatedLinks') }}</h3>
              <div class="related-link">
                <q-icon name="support_agent" />
                <span>{{ $t('auth.forgot.staffLink') }}</span>
              </div>
              <div class="related-link">
                <q-icon name="menu_book" />
                <span>{{ $t('auth.forgot.courseLink') }}</span>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="success-state">
              <div class="success-state__icon">
                <q-icon name="mark_email_read" />
              </div>
              <h2>{{ $t('auth.forgot.successTitle') }}</h2>
              <p>{{ $t('auth.forgot.successDesc') }}</p>
              <q-btn
                class="submit-btn"
                color="primary"
                text-color="white"
                icon-right="login"
                :label="$t('auth.forgot.backToLogin')"
                unelevated
                no-caps
                to="/login"
              />
            </div>
          </template>
        </section>
      </div>
    </main>
  </q-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import LanguageToggle from 'components/navigation/language-toggle.vue';
import { useForgotPassword } from 'src/composables/use-forgot-password';

defineOptions({ name: 'ForgotPasswordPage' });

const email = ref('');
const submitted = ref(false);
const { isLoading, error, requestReset } = useForgotPassword();

async function submitEmail() {
  const ok = await requestReset(email.value);
  if (ok) submitted.value = true;
}
</script>

<style scoped>
.forgot-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #111827;
  background:
    linear-gradient(115deg, rgba(248, 246, 241, 0.96) 0%, rgba(255, 250, 239, 0.95) 52%, #fff 100%),
    url('../assets/login-bg.png');
  background-size: cover;
  background-position: center;
}

.top-header {
  position: relative;
  z-index: 2;
  min-height: 72px;
  background: rgb(247, 208, 70);
}

.header-inner {
  max-width: 1280px;
  min-height: 72px;
  margin: 0 auto;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.logo {
  display: block;
  width: 148px;
  height: auto;
  max-height: 43px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-auth-btn {
  min-height: 36px;
  justify-content: center;
  border: 0 !important;
  border-radius: 10px !important;
  white-space: nowrap;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    background-color 0.22s ease !important;
}

.header-auth-btn--login {
  min-width: 118px;
  box-shadow: 0 2px 8px rgba(245, 166, 35, 0.28) !important;
}

.header-auth-btn--login:hover {
  transform: translateY(-2px) !important;
  box-shadow:
    0 0 0 3px rgba(245, 166, 35, 0.18),
    0 10px 24px rgba(245, 166, 35, 0.34) !important;
}

.header-auth-btn--register {
  min-width: 158px;
  color: #5c3d00 !important;
  background: rgba(255, 255, 255, 0.72) !important;
}

.header-auth-btn--register:hover {
  transform: translateY(-2px) !important;
  background: #ffffff !important;
  box-shadow:
    0 0 0 3px rgba(255, 255, 255, 0.38),
    0 10px 24px rgba(92, 61, 0, 0.16) !important;
}

.content-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  display: flex;
  align-items: center;
  padding: 24px;
}

.content-grid {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: clamp(20px, 3vw, 34px);
  align-items: center;
}

.page-accent {
  position: absolute;
  pointer-events: none;
  opacity: 0.72;
}

.page-accent--one {
  top: 52px;
  left: max(24px, calc((100vw - 1180px) / 2));
  width: 130px;
  height: 130px;
  border: 22px solid rgba(245, 166, 35, 0.14);
  border-radius: 28px;
  transform: rotate(14deg);
}

.page-accent--two {
  right: max(24px, calc((100vw - 1180px) / 2));
  bottom: 54px;
  width: 220px;
  height: 92px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.08), rgba(245, 166, 35, 0.16));
  transform: rotate(-8deg);
}

.info-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.info-panel__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 7px 12px;
  border-radius: 999px;
  color: #8a5a11;
  background: #ffffff;
  border: 1px solid rgba(245, 166, 35, 0.26);
  box-shadow: 0 8px 24px rgba(17, 24, 39, 0.06);
  font-size: 0.84rem;
  font-weight: 800;
}

.info-panel__eyebrow .q-icon {
  font-size: 19px;
}

.page-title {
  max-width: 620px;
  margin: 0;
  color: #111827;
  font-size: clamp(1.9rem, 3.7vw, 3.25rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0;
}

.hero-copy {
  max-width: 660px;
  margin: 0;
  color: #475467;
  font-size: 0.96rem;
  font-weight: 600;
  line-height: 1.62;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.info-list {
  display: grid;
  gap: 10px;
  max-width: 690px;
}

.info-item {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
  padding: 13px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 14px 34px rgba(17, 24, 39, 0.07);
  backdrop-filter: blur(8px);
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.info-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.1);
}

.info-item__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #d88b0a);
  box-shadow: 0 8px 18px rgba(245, 166, 35, 0.24);
  font-size: 21px;
}

.info-item__icon--blue {
  background: linear-gradient(135deg, #1a237e, #3151b7);
  box-shadow: 0 8px 18px rgba(26, 35, 126, 0.18);
}

.info-item h2,
.info-item p {
  margin: 0;
}

.info-item h2 {
  color: #111827;
  font-size: 1rem;
  font-weight: 800;
}

.info-item p {
  margin-top: 4px;
  color: #667085;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.52;
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.myid-btn {
  align-self: flex-start;
  min-width: 168px;
  min-height: 42px;
  color: #ffffff !important;
  background: linear-gradient(135deg, #1a237e, #263fa2) !important;
  border: 0 !important;
  box-shadow: 0 12px 26px rgba(26, 35, 126, 0.2) !important;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease !important;
}

.myid-btn:hover {
  transform: translateY(-3px) !important;
  filter: brightness(1.05);
  box-shadow:
    0 0 0 4px rgba(26, 35, 126, 0.12),
    0 16px 34px rgba(26, 35, 126, 0.3) !important;
}

.form-card {
  position: relative;
  overflow: hidden;
  padding: clamp(20px, 2.5vw, 26px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(245, 166, 35, 0.14);
  box-shadow:
    0 28px 80px rgba(17, 24, 39, 0.14),
    0 0 0 1px rgba(245, 166, 35, 0.06);
}

.form-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 6px;
  background: linear-gradient(90deg, #f5a623, #1a237e);
}

.form-card__header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}

.form-card__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #f5a623, #d88b0a);
  box-shadow: 0 8px 18px rgba(245, 166, 35, 0.25);
  font-size: 22px;
}

.form-card__header h2,
.form-card__header p {
  margin: 0;
}

.form-card__header h2 {
  color: #111827;
  font-size: 1.22rem;
  font-weight: 800;
}

.form-card__header p {
  color: #667085;
  font-size: 0.9rem;
  font-weight: 700;
}

.forgot-form {
  display: grid;
  gap: 12px;
}

.email-input :deep(.q-field__control) {
  min-height: 44px;
  border-radius: 12px;
}

.email-input :deep(.q-field__prepend) {
  color: #667085;
}

.email-input.q-field--focused :deep(.q-field__prepend) {
  color: #1a237e;
}

.submit-btn {
  width: 100%;
  min-height: 44px;
  border: 0 !important;
  box-shadow: 0 12px 26px rgba(245, 166, 35, 0.24) !important;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease !important;
}

.submit-btn:hover {
  transform: translateY(-3px) !important;
  filter: brightness(1.04);
  box-shadow:
    0 0 0 4px rgba(245, 166, 35, 0.16),
    0 18px 34px rgba(245, 166, 35, 0.34) !important;
}

.related-links {
  display: grid;
  gap: 8px;
  margin-top: 18px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(17, 24, 39, 0.08);
}

.related-links h3 {
  margin: 0;
  color: #8a5a11;
  font-size: 0.92rem;
  font-weight: 800;
}

.related-link {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  color: #475467;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.38;
}

.related-link .q-icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: #1a237e;
  background: rgba(26, 35, 126, 0.08);
  font-size: 17px;
}

@media (max-width: 900px) {
  .forgot-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .content-wrapper {
    align-items: flex-start;
    padding: 32px 24px 54px;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    max-width: 620px;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .header-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-auth-btn--login,
  .header-auth-btn--register {
    flex: 1 1 132px;
    min-width: 0;
  }

  .content-wrapper {
    padding: 32px 16px 54px;
  }

  .info-item,
  .form-card__header {
    grid-template-columns: 1fr;
  }

  .page-accent {
    display: none;
  }
}

.error-msg {
  color: #dc2626;
  font-size: 0.84rem;
  font-weight: 600;
}

.success-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 12px 0;
}

.success-state__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.1);
  font-size: 28px;
}

.success-state h2 {
  margin: 0;
  color: #111827;
  font-size: 1.22rem;
  font-weight: 800;
}

.success-state p {
  margin: 0;
  color: #475467;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
  max-width: 340px;
}
</style>
