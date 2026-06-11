<template>
  <AuthPageShell
    variant="register"
    :switching-to="switchingTo"
    :eyebrow="$t('auth.register.eyebrow')"
    :title="$t('auth.register.title')"
    panel-icon="person_add"
    :panel-title="$t('auth.register.cardTitle')"
    :panel-subtitle="$t('auth.register.cardSubtitle')"
    :visual-items="visualItems"
  >
    <q-form class="auth-form auth-form--register" @submit.prevent="onRegister">
      <div class="register-stepper" aria-label="register steps">
        <button
          type="button"
          class="register-stepper__item"
          :class="{ 'register-stepper__item--active': registerStep === 1 }"
          @click="registerStep = 1"
        >
          <span>1</span>
          <strong>{{ $t('auth.register.personalSection') }}</strong>
        </button>
        <div class="register-stepper__line" />
        <button
          type="button"
          class="register-stepper__item"
          :class="{ 'register-stepper__item--active': registerStep === 2 }"
          @click="goToAccountStep"
        >
          <span>2</span>
          <strong>{{ $t('auth.register.accountSection') }}</strong>
        </button>
      </div>

      <div v-if="registerStep === 1" class="form-section form-section--personal">
        <div class="form-section__title">
          <q-icon name="badge" />
          <span>{{ $t('auth.register.personalSection') }}</span>
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.firstNameTh"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.firstNameTh')"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.lastNameTh"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.lastNameTh')"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.firstNameEn"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.firstNameEn')"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.lastNameEn"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.lastNameEn')"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            />
          </div>
          <div class="col-12">
            <q-input
              v-model="registerForm.phone"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.phone')"
              autocomplete="tel"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            >
              <template #prepend>
                <q-icon name="phone" />
              </template>
            </q-input>
          </div>
          <div class="col-12">
            <q-input
              v-model="registerForm.citizenId"
              outlined
              dense
              bg-color="white"
              :label="$t('auth.register.citizenId')"
              maxlength="13"
              inputmode="numeric"
              lazy-rules
              hide-bottom-space
              :hint="$t('auth.register.citizenIdHint')"
              :rules="[citizenIdRequiredRule]"
            >
              <template #prepend>
                <q-icon name="badge" />
              </template>
            </q-input>
          </div>
        </div>

        <BaseButton
          class="register-step-action"
          color="primary"
          text-color="white"
          icon-right="arrow_forward"
          label="ถัดไป"
          type="button"
          no-caps
          @click="goToAccountStep"
        />
      </div>

      <div v-else class="form-section form-section--account">
        <div class="form-section__title">
          <q-icon name="lock" />
          <span>{{ $t('auth.register.accountSection') }}</span>
        </div>

        <q-input
          v-model="registerForm.email"
          outlined
          dense
          bg-color="white"
          :label="$t('auth.register.email')"
          type="email"
          autocomplete="email"
          lazy-rules
          hide-bottom-space
          :rules="[requiredRule, emailRule]"
        >
          <template #prepend>
            <q-icon name="alternate_email" />
          </template>
        </q-input>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.password"
              outlined
              dense
              bg-color="white"
              :type="isPasswordVisible ? 'text' : 'password'"
              :label="$t('auth.register.password')"
              autocomplete="new-password"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule, passwordRule]"
            >
              <template #append>
                <q-icon
                  :name="isPasswordVisible ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6">
            <q-input
              v-model="registerForm.confirmPassword"
              outlined
              dense
              bg-color="white"
              :type="isPasswordVisible ? 'text' : 'password'"
              :label="$t('auth.register.confirmPassword')"
              autocomplete="new-password"
              lazy-rules
              hide-bottom-space
              :rules="[requiredRule]"
            />
          </div>
        </div>

        <div class="password-hint">{{ $t('auth.register.passwordHint') }}</div>

        <div class="privacy-notice privacy-notice--register">
          <q-icon name="privacy_tip" />
          <span>{{ $t('auth.register.privacyNotice') }}</span>
          <a
            href="https://lifelong.buu.ac.th/document/PrivacyNoticeLifelong.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('auth.register.privacyLink') }}
          </a>
        </div>

        <q-checkbox
          v-model="registerForm.acceptTerms"
          color="primary"
          dense
          class="auth-terms auth-terms--register"
          :label="$t('auth.register.acceptTerms')"
        />

        <div class="register-step-actions">
          <BaseButton
            outline
            color="primary"
            icon="arrow_back"
            label="ย้อนกลับ"
            type="button"
            no-caps
            @click="registerStep = 1"
          />
          <BaseButton
            class="auth-submit auth-submit--register"
            color="primary"
            text-color="white"
            icon-right="person_add"
            :label="$t('auth.register.submit')"
            type="submit"
            :loading="isLoading"
            no-caps
          />
        </div>
      </div>
    </q-form>

    <div class="auth-switch">
      <span>{{ $t('auth.register.loginPrompt') }}</span>
      <BaseButton
        flat
        color="primary"
        :label="$t('auth.register.loginCta')"
        no-caps
        tag="a"
        :href="resolveFullUrl('/login')"
        @click="onLoginClick"
      />
    </div>
  </AuthPageShell>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AuthPageShell, { type AuthVisualItem } from 'components/auth/AuthPageShell.vue';
import BaseButton from 'components/base/BaseButton.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

interface RegisterForm {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  citizenId: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

const $q = useQuasar();
const { t } = useI18n({ useScope: 'global' });
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const isPasswordVisible = ref(false);
const registerStep = ref<1 | 2>(1);
const switchingTo = ref<'login' | null>(null);

const registerForm = reactive<RegisterForm>({
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  phone: '',
  citizenId: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
});

const visualItems = computed<AuthVisualItem[]>(() => [
  {
    icon: 'how_to_reg',
    text: t('auth.register.benefitOne'),
  },
  {
    icon: 'bookmark',
    text: t('auth.register.benefitTwo'),
  },
  {
    icon: 'receipt_long',
    text: t('auth.register.benefitThree'),
  },
]);

function requiredRule(value: string): true | string {
  return Boolean(value.trim()) || t('auth.validation.required');
}

function emailRule(value: string): true | string {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || t('auth.validation.email');
}

function passwordRule(value: string): true | string {
  const v = value.trim();
  if (v.length < 8) return t('auth.register.passwordTooShort');
  const hasUpper = /[A-Z]/.test(v);
  const hasLower = /[a-z]/.test(v);
  const hasDigit = /[0-9]/.test(v);
  const score = [hasUpper, hasLower, hasDigit].filter(Boolean).length;
  return score >= 2 || t('auth.register.passwordTooShort');
}

function citizenIdRequiredRule(value: string): true | string {
  if (!value.trim()) return t('auth.register.citizenIdRequired');
  return /^\d{13}$/.test(value.trim()) || t('auth.register.citizenIdInvalid');
}

function isPersonalStepComplete(): boolean {
  return Boolean(
    registerForm.firstNameTh.trim() &&
    registerForm.lastNameTh.trim() &&
    registerForm.firstNameEn.trim() &&
    registerForm.lastNameEn.trim() &&
    registerForm.phone.trim() &&
    registerForm.citizenId.trim(),
  );
}

function isRequiredFormComplete(): boolean {
  return Boolean(
    registerForm.firstNameTh.trim() &&
    registerForm.lastNameTh.trim() &&
    registerForm.firstNameEn.trim() &&
    registerForm.lastNameEn.trim() &&
    registerForm.phone.trim() &&
    registerForm.citizenId.trim() &&
    registerForm.email.trim() &&
    registerForm.password.trim() &&
    registerForm.confirmPassword.trim(),
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function goToLogin(): Promise<void> {
  if (switchingTo.value) {
    return;
  }

  switchingTo.value = 'login';
  await wait(560);
  void router.push('/login');
}

function onLoginClick(event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void goToLogin();
}

function goToAccountStep(): void {
  if (!isPersonalStepComplete()) {
    $q.notify({
      type: 'negative',
      message: t('auth.register.fillRequired'),
      position: 'top',
    });
    return;
  }

  const citizenIdError = citizenIdRequiredRule(registerForm.citizenId);
  if (citizenIdError !== true) {
    $q.notify({ type: 'negative', message: citizenIdError, position: 'top' });
    return;
  }

  registerStep.value = 2;
}

async function onRegister(): Promise<void> {
  if (!isRequiredFormComplete()) {
    $q.notify({
      type: 'negative',
      message: t('auth.register.fillRequired'),
      position: 'top',
    });
    return;
  }

  if (emailRule(registerForm.email) !== true) {
    $q.notify({
      type: 'negative',
      message: t('auth.validation.email'),
      position: 'top',
    });
    return;
  }

  const passwordError = passwordRule(registerForm.password);
  if (passwordError !== true) {
    $q.notify({ type: 'negative', message: passwordError, position: 'top' });
    return;
  }

  if (registerForm.password !== registerForm.confirmPassword) {
    $q.notify({
      type: 'negative',
      message: t('auth.register.passwordMismatch'),
      position: 'top',
    });
    return;
  }

  if (!registerForm.acceptTerms) {
    $q.notify({
      type: 'negative',
      message: t('auth.validation.terms'),
      position: 'top',
    });
    return;
  }

  isLoading.value = true;
  $q.loading.show({ message: t('auth.register.loading') });

  try {
    await wait(700);
    const result = await authStore.registerLearner({
      firstNameTh: registerForm.firstNameTh,
      lastNameTh: registerForm.lastNameTh,
      firstNameEn: registerForm.firstNameEn,
      lastNameEn: registerForm.lastNameEn,
      phone: registerForm.phone,
      ...(registerForm.citizenId.trim() ? { citizenId: registerForm.citizenId.trim() } : {}),
      email: registerForm.email,
      password: registerForm.password,
    });

    if (!result.success) {
      const msg =
        result.reason === 'duplicate-email'
          ? t('auth.register.duplicate')
          : result.reason === 'duplicate-citizen-id'
            ? t('auth.register.duplicateCitizenId')
            : t('auth.register.failed');
      $q.notify({ type: 'negative', message: msg, position: 'top' });
      return;
    }

    $q.notify({
      type: 'positive',
      message: t('auth.register.success'),
      position: 'top',
    });

    void router.push({
      path: '/login',
      query: { email: registerForm.email.trim().toLowerCase() },
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: t('auth.register.failed'),
      position: 'top',
    });
  } finally {
    isLoading.value = false;
    $q.loading.hide();
  }
}
</script>

<style lang="scss" scoped>
.auth-form {
  display: grid;
  gap: 12px;
}

.auth-form--register {
  align-items: stretch;
}

.register-stepper {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 16px;
  background: #f8fafc;
}

.register-stepper__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 0;
  min-height: 36px;
  padding: 4px 8px;
  border: 0;
  border-radius: 12px;
  color: #667085;
  background: transparent;
  font: inherit;
  cursor: pointer;

  span {
    display: grid;
    place-items: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    border-radius: 999px;
    background: #e5e7eb;
    color: #475467;
    font-size: 0.78rem;
    font-weight: 900;
  }

  strong {
    min-width: 0;
    overflow: hidden;
    font-size: 0.82rem;
    font-weight: 900;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.register-stepper__item--active {
  color: #3d2600;
  background: rgba(245, 166, 35, 0.14);

  span {
    color: #ffffff;
    background: $secondary;
  }
}

.register-stepper__line {
  height: 2px;
  border-radius: 999px;
  background: #e5e7eb;
}

.form-section {
  display: grid;
  gap: 12px;
  padding: 0;
  background: transparent;
  border: none;
}

.form-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b7791f;
  font-weight: 800;
  font-size: 0.9rem;
  margin-top: 4px;

  .q-icon {
    color: $secondary;
    font-size: 20px;
  }
}

.password-hint {
  margin-top: -4px;
  color: #667085;
  font-size: 0.8rem;
}

.privacy-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #344054;
  background: #f8fafc;
  border: 1px solid rgba(17, 24, 39, 0.08);
  font-size: 0.8rem;
  line-height: 1.55;

  .q-icon {
    flex: 0 0 auto;
    margin-top: 2px;
    color: #b7791f;
    font-size: 18px;
  }

  a {
    flex: 0 0 auto;
    color: #b7791f;
    font-weight: 800;
    text-decoration: none;
  }
}

.auth-terms {
  color: #475467;
  font-size: 0.88rem;
}

.auth-submit {
  width: 100%;
  min-height: 46px;
}

.register-step-action {
  width: 100%;
  min-height: 46px;
  margin-top: 2px;
}

.register-step-actions {
  display: grid;
  grid-template-columns: minmax(128px, 0.44fr) minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #667085;
}

@media (max-width: 520px) {
  .register-stepper {
    grid-template-columns: 1fr;
  }

  .register-stepper__line {
    display: none;
  }

  .register-step-actions {
    grid-template-columns: 1fr;
  }

  .auth-switch {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
