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
      <div class="form-section form-section--personal">
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
        </div>
      </div>

      <div class="form-section form-section--account">
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
      </div>

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
    </q-form>

    <div class="auth-switch">
      <span>{{ $t('auth.register.loginPrompt') }}</span>
      <BaseButton
        flat
        color="primary"
        :label="$t('auth.register.loginCta')"
        no-caps
        @click="goToLogin"
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

interface RegisterForm {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
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
const switchingTo = ref<'login' | null>(null);

const registerForm = reactive<RegisterForm>({
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  phone: '',
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
  return value.trim().length >= 6 || t('auth.register.passwordTooShort');
}

function isRequiredFormComplete(): boolean {
  return Boolean(
    registerForm.firstNameTh.trim() &&
    registerForm.lastNameTh.trim() &&
    registerForm.firstNameEn.trim() &&
    registerForm.lastNameEn.trim() &&
    registerForm.phone.trim() &&
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

  if (passwordRule(registerForm.password) !== true) {
    $q.notify({
      type: 'negative',
      message: t('auth.register.passwordTooShort'),
      position: 'top',
    });
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
    const result = authStore.registerLearner({
      firstNameTh: registerForm.firstNameTh,
      lastNameTh: registerForm.lastNameTh,
      firstNameEn: registerForm.firstNameEn,
      lastNameEn: registerForm.lastNameEn,
      phone: registerForm.phone,
      email: registerForm.email,
      password: registerForm.password,
    });

    if (!result.success) {
      $q.notify({
        type: 'negative',
        message:
          result.reason === 'duplicate-email'
            ? t('auth.register.duplicate')
            : t('auth.register.failed'),
        position: 'top',
      });
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

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #667085;
}

@media (max-width: 520px) {
  .auth-switch {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
