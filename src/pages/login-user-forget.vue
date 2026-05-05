<template>
  <q-page class="forgot-page">
    <!-- Header -->
    <header class="top-header">
      <div class="header-inner">
        <img src="~assets/brand/buu-lll-logo.png" class="logo" />

        <div class="header-actions">
          <LanguageToggle />
          <q-btn
            class="header-auth-btn header-auth-btn--login"
            color="amber-6"
            text-color="white"
            :label="$t('auth.forgot.login')"
            icon-right="login"
            no-caps
            unelevated
            to="/login"
          />
          <q-btn
            class="header-auth-btn header-auth-btn--register"
            outline
            color="grey-4"
            text-color="blue-grey-8"
            :label="$t('auth.forgot.register')"
            icon-right="person_add"
            no-caps
            to="/register"
          />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="content-wrapper">
      <div class="content-grid">
        <!-- Left Card -->
        <q-card flat bordered class="info-card">
          <q-card-section>
            <h2 class="left-title">{{ $t('auth.forgot.title') }}</h2>

            <p class="orange-text">{{ $t('auth.forgot.generalUser') }}</p>

            <p class="description">
              {{ $t('auth.forgot.generalDesc') }}
            </p>

            <p class="orange-text">{{ $t('auth.forgot.buuUser') }}</p>

            <p class="description">{{ $t('auth.forgot.buuDesc') }}</p>

            <q-btn
              class="myid-btn"
              unelevated
              href="https://myid.buu.ac.th"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span class="myid-text">{{ $t('auth.forgot.myId') }}</span>
            </q-btn>
          </q-card-section>
        </q-card>

        <!-- Right Form -->
        <section class="form-section">
          <h1 class="page-title">{{ $t('auth.forgot.pageTitle') }}</h1>

          <div class="form-group">
            <label class="input-label">{{ $t('auth.forgot.emailLabel') }}</label>

            <q-input v-model="email" outlined dense class="email-input">
              <template #prepend>
                <q-icon name="person" />
              </template>
            </q-input>
          </div>

          <q-btn
            class="submit-btn"
            color="amber-6"
            text-color="white"
            :label="$t('auth.forgot.submit')"
            unelevated
            @click="submitEmail"
          />
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div>
          <h3>{{ $t('auth.forgot.relatedLinks') }}</h3>
          <ul>
            <li>{{ $t('auth.forgot.staffLink') }}</li>
            <li>{{ $t('auth.forgot.courseLink') }}</li>
          </ul>
        </div>

        <div class="footer-logo-box">
          <img src="~assets/brand/buu-lll-logo.png" class="footer-logo" />
          <p>© 2022 Lifelong Learning Burapha University</p>
          <p>Crafted by Computer Center Burapha University</p>
        </div>
      </div>
    </footer>
  </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LanguageToggle from 'components/navigation/language-toggle.vue';

export default defineComponent({
  name: 'ForgotPasswordPage',
  components: {
    LanguageToggle,
  },

  data() {
    return {
      email: '',
    };
  },

  methods: {
    submitEmail() {
      console.log('Email:', this.email);
    },
  },
});
</script>

<style scoped>
.forgot-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.top-header {
  height: 70px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.header-inner {
  max-width: 1280px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  height: 48px;
  object-fit: contain;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-auth-btn {
  justify-content: center;
  border-radius: 8px;
  white-space: nowrap;
}

.header-auth-btn--login {
  min-width: 104px;
}

.header-auth-btn--register {
  min-width: 144px;
}

.content-wrapper {
  flex: 1;
  padding: 75px 24px 120px;
}

.content-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
}

.info-card {
  min-height: 430px;
  padding: 28px 34px;
}

.left-title {
  font-size: 22px;
  font-weight: 500;
  margin: 0 0 52px;
  color: #263238;
}

.orange-text {
  color: #f59f00;
  font-weight: 600;
  margin: 28px 0;
}

.description {
  font-size: 16px;
  color: #333;
  line-height: 1.8;
  margin: 0;
}

.myid-btn {
  margin-top: 18px;
  width: 190px;
  height: 64px;
  background: #12b6d0;
  color: black;
}

.myid-text {
  font-size: 28px;
  letter-spacing: 1px;
}

.form-section {
  padding: 8px 0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 32px;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 34px;
}

.input-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.input-label span {
  font-weight: 400;
  color: #555;
}

.email-input {
  max-width: 620px;
}

.submit-btn {
  width: 620px;
  height: 44px;
  font-size: 16px;
}

.footer {
  /* background: linear-gradient(90deg, #fff86b, #ffc107);
  color: #1f2937; */
  display: none;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer h3 {
  font-size: 16px;
  margin: 0 0 8px;
}

.footer ul {
  margin: 0;
  padding-left: 24px;
}

.footer li {
  color: #ffc107;
  margin: 6px 0;
}

.footer-logo-box {
  text-align: center;
}

.footer-logo {
  height: 60px;
  margin-bottom: 6px;
}

.footer-logo-box p {
  margin: 4px 0;
  color: #ddd;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .submit-btn,
  .email-input {
    width: 100%;
    max-width: 100%;
  }

  .footer-inner {
    flex-direction: column;
    gap: 20px;
  }
}
</style>
