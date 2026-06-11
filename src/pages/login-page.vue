<template>
  <AuthPageShell
    variant="login"
    :switching-to="switchingTo"
    :eyebrow="$t('auth.login.eyebrow')"
    :title="$t('auth.login.title')"
    :subtitle="$t('auth.login.subtitle')"
    panel-icon="login"
    :panel-title="$t('auth.login.cardTitle')"
    :panel-subtitle="$t('auth.login.cardSubtitle')"
    :visual-items="visualItems"
  >
    <q-form class="auth-form" @submit.prevent="onLogin">
      <q-input
        v-model="loginForm.username"
        outlined
        dense
        bg-color="white"
        :label="$t('auth.login.identifierLabel')"
        :placeholder="$t('auth.login.identifierPlaceholder')"
        autocomplete="username"
        lazy-rules
        hide-bottom-space
        :rules="[requiredRule]"
      >
        <template #prepend>
          <q-icon name="alternate_email" />
        </template>
      </q-input>

      <q-input
        v-model="loginForm.password"
        outlined
        dense
        bg-color="white"
        :type="isPasswordVisible ? 'text' : 'password'"
        :label="$t('auth.login.passwordLabel')"
        :placeholder="$t('auth.login.passwordPlaceholder')"
        autocomplete="current-password"
        lazy-rules
        hide-bottom-space
        :rules="[requiredRule]"
      >
        <template #prepend>
          <q-icon name="lock" />
        </template>
        <template #append>
          <q-icon
            :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPasswordVisible = !isPasswordVisible"
          />
        </template>
      </q-input>

      <div class="auth-form__meta">
        <q-checkbox
          v-model="loginForm.remember"
          dense
          color="primary"
          :label="$t('auth.login.remember')"
        />
        <a
          class="auth-text-button"
          :href="resolveFullUrl('/login-forget')"
          @click="onForgotPasswordClick"
        >
          {{ $t('auth.login.forgot') }}
        </a>
      </div>

      <BaseButton
        class="auth-submit"
        color="primary"
        text-color="white"
        icon-right="login"
        :label="$t('auth.login.submit')"
        type="submit"
        :loading="isLoading"
        no-caps
      />

      <BaseButton class="auth-thaid" type="button" no-caps @click="onThaiIdLogin">
        <span class="auth-thaid__content">
          <span>{{ $t('auth.login.thaid') }}</span>
          <img src="~assets/brand/thaid-logo.png" alt="" class="auth-thaid__logo" />
        </span>
      </BaseButton>
    </q-form>

    <div class="auth-demo">
      <div class="auth-demo__title">Test Accounts</div>
      <div v-for="acc in TEST_ACCOUNTS" :key="acc.username" class="auth-demo__row">
        <span class="auth-demo__text">{{ acc.username }} / {{ acc.password }}</span>
        <q-btn
          flat
          dense
          no-caps
          size="sm"
          color="primary"
          label="use"
          class="auth-demo__btn"
          @click="loadTestAccount(acc)"
        />
      </div>
    </div>

    <div class="auth-switch">
      <span>{{ $t('auth.login.registerPrompt') }}</span>
      <BaseButton
        flat
        color="primary"
        :label="$t('auth.login.registerCta')"
        no-caps
        tag="a"
        :href="resolveFullUrl('/register')"
        @click="onRegisterClick"
      />
    </div>
  </AuthPageShell>

  <BaseSpinner
    v-if="showForgotLoading"
    class="auth-forgot-loading"
    full
    :message="$t('auth.forgot.loading')"
  />

  <BaseSpinner
    v-if="isLoading"
    class="auth-login-loading"
    full
    :message="$t('auth.login.loading')"
  />

  <LoginCheckInDialog
    v-if="ENABLE_LOGIN_CHECK_IN_DIALOG"
    v-model="showCheckInDialog"
    :days="checkInDays"
    :streak-days="checkInStreakDays"
    :streak-label="checkInStreakLabel"
    :description="checkInDescription"
    :continue-label="checkInContinueLabel"
    :secondary-label="checkInSecondaryLabel"
    @continue="handleCheckInContinue"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import AuthPageShell, { type AuthVisualItem } from 'components/auth/AuthPageShell.vue';
import LoginCheckInDialog from 'components/auth/LoginCheckInDialog.vue';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import {
  recordLoginCheckIn,
  type LoginCheckInDay,
  type LoginCheckInSnapshot,
} from 'src/composables/use-login-check-in';
import { useAuthStore } from 'src/stores/auth-store';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

const $q = useQuasar();
const { locale, t } = useI18n({ useScope: 'global' });
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const ENABLE_LOGIN_CHECK_IN_DIALOG = false;

const TEST_ACCOUNTS = [
  { username: 'admin_test', password: 'P@ssword123!' },
  { username: 'instructor_test', password: 'P@ssword123!' },
  { username: 'student_test', password: 'P@ssword123!' },
  { username: 'finance_test', password: 'P@ssword123!' },
  { username: 'central_finance_test', password: 'P@ssword123!' },
];

const isLoading = ref(false);
const isPasswordVisible = ref(false);
const showForgotLoading = ref(false);
const showCheckInDialog = ref(false);
const switchingTo = ref<'register' | null>(null);
const pendingPostLoginPath = ref('');
const checkInSnapshot = ref<LoginCheckInSnapshot | null>(null);

const loginForm = reactive<LoginForm>({
  username: typeof route.query.email === 'string' ? route.query.email : '',
  password: '',
  remember: false,
});

const visualItems = computed<AuthVisualItem[]>(() => [
  {
    icon: 'school',
    title: t('auth.login.memberTitle'),
    text: t('auth.login.memberDesc'),
  },
  {
    icon: 'support_agent',
    title: t('contact'),
    text: t('auth.login.support'),
  },
]);

const checkInDays = computed<LoginCheckInDay[]>(() => checkInSnapshot.value?.days ?? []);
const checkInStreakDays = computed<number>(() => checkInSnapshot.value?.streakDays ?? 0);
const checkInStreakLabel = computed<string>(() => {
  if (locale.value === 'th') {
    return 'วันต่อเนื่อง';
  }

  return checkInStreakDays.value === 1 ? 'day streak' : 'days streak';
});
const checkInDescription = computed<string>(() => {
  if (locale.value === 'th') {
    if (checkInSnapshot.value?.isNewCheckIn) {
      return 'เช็กอินวันนี้สำเร็จแล้ว พรุ่งนี้กลับมาอีกเพื่อรักษา streak ของคุณนะ';
    }

    return 'วันนี้คุณเช็กอินแล้ว พรุ่งนี้กลับมาอีกเพื่อไม่ให้ streak หลุด';
  }

  if (checkInSnapshot.value?.isNewCheckIn) {
    return 'You checked in today. Come back tomorrow to keep your streak glowing.';
  }

  return "You're already checked in for today. Come back tomorrow to keep your streak going.";
});
const checkInContinueLabel = computed<string>(() => (locale.value === 'th' ? 'ไปต่อ' : 'CONTINUE'));
const checkInSecondaryLabel = computed<string>(() =>
  locale.value === 'th' ? 'ดูอีกครั้ง' : 'REVIEW STREAK',
);

function requiredRule(value: string): true | string {
  return Boolean(value.trim()) || t('auth.validation.required');
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function onThaiIdLogin(): void {
  // Reserved for future ThaiD integration.
}

async function goToRegister(): Promise<void> {
  if (switchingTo.value) {
    return;
  }

  switchingTo.value = 'register';
  await wait(560);
  void router.push('/register');
}

async function goToForgotPassword(): Promise<void> {
  if (showForgotLoading.value) {
    return;
  }

  showForgotLoading.value = true;
  await wait(360);
  void router.push('/login-forget');
}

function onRegisterClick(event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void goToRegister();
}

function onForgotPasswordClick(event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void goToForgotPassword();
}

function getPostLoginPath(): string {
  const rolePathMap = {
    admin: '/admin/dashboard',
    instructor: '/instructor/dashboard',
    teach: '/instructor/dashboard',
    finance: '/finance/dashboard',
    central_finance: '/central-finance/dashboard',
    student: '/main',
  } as const;

  // ดำเนินการเก็บ redirect parameter จาก query หรือ localStorage
  if (typeof route.query.redirect === 'string' && route.query.redirect.trim()) {
    return route.query.redirect;
  }

  // ลองดึง redirect จาก sessionStorage (ถ้าเซ็ตไว้ก่อนหน้า)
  const storedRedirect =
    typeof window !== 'undefined' ? sessionStorage.getItem('loginRedirect') : null;
  if (storedRedirect) {
    sessionStorage.removeItem('loginRedirect');
    return storedRedirect;
  }

  const role = authStore.user?.role;
  if (role && role in rolePathMap) {
    return rolePathMap[role as keyof typeof rolePathMap];
  }

  return '/main';
}

function handleCheckInContinue(): void {
  showCheckInDialog.value = false;
  const nextPath = pendingPostLoginPath.value || '/main';
  pendingPostLoginPath.value = '';
  void router.push(nextPath);
}

function loadTestAccount(account: { username: string; password: string }): void {
  loginForm.username = account.username;
  loginForm.password = account.password;
}

async function onLogin(): Promise<void> {
  if (!loginForm.username.trim() || !loginForm.password.trim()) {
    $q.notify({
      type: 'negative',
      message: t('auth.login.fillRequired'),
      position: 'top',
    });
    return;
  }

  isLoading.value = true;

  try {
    await wait(600);
    const result = await authStore.login(loginForm.username, loginForm.password);

    if (!result.success) {
      let message = t('auth.login.invalid');
      if (result.errorType === 'account-locked') {
        message = t('auth.login.accountLocked');
      } else if (result.errorType === 'rate-limit') {
        message = t('auth.login.tooManyRequests');
      } else if (result.errorType === 'other') {
        message = t('auth.login.failed');
      }
      $q.notify({
        type: 'negative',
        message,
        position: 'top',
      });
      return;
    }

    $q.notify({
      type: 'positive',
      message: t('auth.login.success'),
      position: 'top',
    });

    const targetPath = getPostLoginPath();
    console.log(
      '[Login] Login success. User role:',
      authStore.user?.role,
      'Redirecting to:',
      targetPath,
    );

    if (!authStore.user) {
      void router.push(targetPath);
      return;
    }

    if (authStore.user.role === 'student') {
      const snapshot = recordLoginCheckIn(authStore.user);

      if (ENABLE_LOGIN_CHECK_IN_DIALOG) {
        pendingPostLoginPath.value = targetPath;
        checkInSnapshot.value = snapshot;
        showCheckInDialog.value = true;
        return;
      }
    }

    void router.push(targetPath);
  } catch {
    $q.notify({
      type: 'negative',
      message: t('auth.login.failed'),
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.auth-form {
  display: grid;
  gap: 13px;

  :deep(.q-field--outlined .q-field__control) {
    border-radius: 12px;
    background: #ffffff;
  }

  :deep(.q-field__prepend),
  :deep(.q-field__append) {
    color: #6b7280;
  }

  :deep(.q-field--focused .q-field__prepend),
  :deep(.q-field--focused .q-field__append) {
    color: $secondary;
  }
}

.auth-form__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #475467;
  font-size: 0.88rem;
}

.auth-text-button {
  padding: 0;
  border: 0;
  color: #b7791f;
  background: transparent;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s ease;

  text-decoration: none;

  &:hover {
    color: #8a5a11;
  }
}

.auth-submit,
.auth-thaid {
  width: 100%;
  min-height: 46px;
}

.auth-submit {
  box-shadow: 0 10px 22px rgba($primary, 0.22) !important;
}

.auth-thaid {
  color: #ffffff !important;
  background: linear-gradient(135deg, #080a5f 0%, #16228b 100%) !important;
  border-color: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 10px 22px rgba(8, 10, 95, 0.18) !important;

  :deep(.q-focus-helper) {
    background: rgba(255, 255, 255, 0.16);
  }
}

.auth-thaid__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 0;
}

.auth-thaid__logo {
  display: block;
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.auth-demo {
  padding: 12px 14px;
  border-radius: 12px;
  color: #344054;
  background: #f8fafc;
  border: 1px solid rgba(17, 24, 39, 0.08);
  font-size: 0.8rem;
  line-height: 1.55;
}

.auth-demo__title {
  color: #b7791f;
  font-weight: 800;
  margin-bottom: 4px;
}

.auth-demo__row {
  display: flex;
  gap: 8px;
}

.auth-demo__role {
  min-width: 110px;
  font-weight: 600;
  color: #475467;
}

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding-top: 2px;
  color: #667085;
}

.auth-forgot-loading,
.auth-login-loading {
  z-index: 10020;
}

@media (max-width: 520px) {
  .auth-form__meta,
  .auth-switch {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
