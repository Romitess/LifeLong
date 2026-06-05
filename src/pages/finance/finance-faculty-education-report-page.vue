<template>
  <q-page class="admin-page finance-faculty-education-report-page">
    <AppPageHero
      :eyebrow="$t('finance.educationReport.eyebrow')"
      eyebrow-icon="school"
      :title="$t('finance.educationReport.title')"
      :description="$t('finance.educationReport.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('finance.educationReport.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">{{ currentFacultyName }}</div>
        </div>
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <AdminRegistrationStatisticsReportManager
        :initial-faculty-id="currentFacultyId"
        :show-faculty-filter="false"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/admin/AppPageHero.vue';
import AdminRegistrationStatisticsReportManager from 'components/admin/AdminRegistrationStatisticsReportManager.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();

const currentFacultyId = computed(() => authStore.user?.facId ?? null);
const currentFacultyName = computed(
  () =>
    authStore.user?.facName ||
    authStore.user?.faculty ||
    t('finance.educationReport.unknownFaculty'),
);
</script>

<style lang="scss" scoped>
.finance-faculty-education-report-page {
  background: #f8fafc;
  min-height: 100vh;
}

.faculty-scope-card {
  min-width: 260px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 6px;
}

.faculty-scope-card__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.faculty-scope-card__faculty {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 900;
}

.faculty-scope-card__helper {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
}
</style>
