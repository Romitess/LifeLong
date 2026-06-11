<template>
  <q-page class="reset-page">
    <header class="top-header">
      <div class="header-inner">
        <img src="~assets/brand/buu-lll-logo.png" class="logo" alt="BUU LLL" />

        <div class="header-actions">
          <LanguageToggle />
          <q-btn
            class="header-auth-btn header-auth-btn--login"
            color="primary"
            text-color="white"
            :label="$t('auth.resetPassword.login')"
            icon-right="login"
            no-caps
            unelevated
            to="/login"
          />
          <q-btn
            class="header-auth-btn header-auth-btn--register"
            :label="$t('auth.resetPassword.register')"
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

      <div class="card-center">
        <div class="form-card">
          <q-spinner v-if="verifying" size="40px" color="primary" />

          <template v-else-if="keyInvalid">
            <div class="state-block">
              <div class="state-block__icon state-block__icon--error">
                <q-icon name="link_off" />
              </div>
              <h2>{{ $t('auth.resetPassword.invalidTitle') }}</h2>
              <p>{{ $t('auth.resetPassword.invalidDesc') }}</p>
              <q-btn
                class="action-btn"
                color="primary"
                text-color="white"
                icon-right="refresh"
                :label="$t('auth.resetPassword.requestAgain')"
                unelevated
                no-caps
                to="/login-forget"
              />
            </div>
          </template>

          <template v-else-if="success">
            <div class="state-block">
              <div class="state-block__icon state-block__icon--success">
                <q-icon name="check_circle" />
              </div>
              <h2>{{ $t('auth.resetPassword.successTitle') }}</h2>
              <p>{{ $t('auth.resetPassword.successDesc') }}</p>
              <q-btn
                class="action-btn"
                color="primary"
                text-color="white"
                icon-right="login"
                :label="$t('auth.resetPassword.backToLogin')"
                unelevated
                no-caps
                to="/login"
              />
            </div>
          </template>

          <template v-else>
            <div class="form-card__header">
              <div class="form-card__icon">
                <q-icon name="lock_reset" />
              </div>
              <div>
                <h2>{{ $t('auth.resetPassword.cardTitle') }}</h2>
                <p>{{ $t('auth.resetPassword.cardSubtitle') }}</p>
              </div>
            </div>

            <q-form class="reset-form" @submit.prevent="submit">
              <q-input
                v-model="newPassword"
                outlined
                dense
                bg-color="white"
                :type="showNew ? 'text' : 'password'"
                autocomplete="new-password"
                class="pw-input"
                :label="$t('auth.resetPassword.newPasswordLabel')"
                :disable="isLoading"
              >
                <template #prepend>
                  <q-icon name="lock" />
                </template>
                <template #append>
                  <q-icon
                    :name="showNew ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showNew = !showNew"
                  />
                </template>
              </q-input>

              <q-input
                v-model="confirmPassword"
                outlined
                dense
                bg-color="white"
                :type="showConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                class="pw-input"
                :label="$t('auth.resetPassword.confirmPasswordLabel')"
                :disable="isLoading"
              >
                <template #prepend>
                  <q-icon name="lock_outline" />
                </template>
                <template #append>
                  <q-icon
                    :name="showConfirm ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showConfirm = !showConfirm"
                  />
                </template>
              </q-input>

              <div v-if="formError" class="error-msg">{{ formError }}</div>

              <q-btn
                class="action-btn"
                color="primary"
                text-color="white"
                icon-right="check"
                :label="
                  isLoading ? $t('auth.resetPassword.submitting') : $t('auth.resetPassword.submit')
                "
                type="submit"
                unelevated
                no-caps
                :loading="isLoading"
              />
            </q-form>
          </template>
        </div>
      </div>
    </main>
  </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import LanguageToggle from 'components/navigation/language-toggle.vue';
import { useForgotPassword } from 'src/composables/use-forgot-password';

defineOptions({ name: 'ResetPasswordPage' });

const route = useRoute();
const { t } = useI18n();
const { isLoading, resetPassword, verifyKey } = useForgotPassword();

const key = ref('');
const verifying = ref(true);
const keyInvalid = ref(false);
const success = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const showNew = ref(false);
const showConfirm = ref(false);
const formError = ref<string | null>(null);

onMounted(async () => {
  key.value = (route.query['key'] as string) ?? '';
  if (!key.value) {
    keyInvalid.value = true;
    verifying.value = false;
    return;
  }
  const result = await verifyKey(key.value);
  keyInvalid.value = !result.valid;
  verifying.value = false;
});

async function submit() {
  formError.value = null;

  if (newPassword.value.length < 8) {
    formError.value = t('auth.resetPassword.passwordMinLength');
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    formError.value = t('auth.resetPassword.passwordMismatch');
    return;
  }

  const ok = await resetPassword(key.value, newPassword.value);
  if (ok) {
    success.value = true;
  } else {
    formError.value = t('auth.resetPassword.invalidDesc');
  }
}
</script>

<style scoped>
.reset-page {
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
  justify-content: center;
  padding: 24px;
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

.card-center {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
}

.form-card {
  position: relative;
  overflow: hidden;
  padding: clamp(24px, 3vw, 32px);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(245, 166, 35, 0.14);
  box-shadow:
    0 28px 80px rgba(17, 24, 39, 0.14),
    0 0 0 1px rgba(245, 166, 35, 0.06);
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: stretch;
  min-height: 120px;
  justify-content: center;
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

.reset-form {
  display: grid;
  gap: 12px;
}

.pw-input :deep(.q-field__control) {
  min-height: 44px;
  border-radius: 12px;
}

.pw-input :deep(.q-field__prepend),
.pw-input :deep(.q-field__append) {
  color: #667085;
}

.error-msg {
  color: #dc2626;
  font-size: 0.84rem;
  font-weight: 600;
}

.action-btn {
  width: 100%;
  min-height: 44px;
  border: 0 !important;
  box-shadow: 0 12px 26px rgba(245, 166, 35, 0.24) !important;
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    filter 0.22s ease !important;
}

.action-btn:hover {
  transform: translateY(-3px) !important;
  filter: brightness(1.04);
  box-shadow:
    0 0 0 4px rgba(245, 166, 35, 0.16),
    0 18px 34px rgba(245, 166, 35, 0.34) !important;
}

.state-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
  padding: 8px 0;
}

.state-block__icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 28px;
}

.state-block__icon--success {
  color: #16a34a;
  background: rgba(22, 163, 74, 0.1);
}

.state-block__icon--error {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.state-block h2 {
  margin: 0;
  color: #111827;
  font-size: 1.22rem;
  font-weight: 800;
}

.state-block p {
  margin: 0;
  color: #475467;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.6;
  max-width: 340px;
}

@media (max-width: 640px) {
  .reset-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .content-wrapper {
    align-items: flex-start;
    padding: 32px 16px 54px;
  }

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

  .page-accent {
    display: none;
  }
}
</style>
