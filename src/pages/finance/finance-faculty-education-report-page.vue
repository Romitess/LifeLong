<template>
  <q-page class="admin-page finance-faculty-education-report-page">
    <AdminPageHero
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
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <AdminRegistrationStatisticsReportManager
        :initial-faculty-id="currentFacultyId"
        :show-faculty-filter="false"
        :show-filters="false"
        :mock-data="mockRegistrationReportData"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminRegistrationStatisticsReportManager from 'components/admin/AdminRegistrationStatisticsReportManager.vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import type { AdminRegistrationStatisticsReportResponse } from 'src/types/admin-registration-statistics-report';

const { t } = useI18n();
const authStore = useAuthStore();

const currentFacultyId = computed(() => authStore.user?.facId ?? null);
const currentFacultyName = computed(
  () =>
    authStore.user?.facName ||
    authStore.user?.faculty ||
    t('finance.educationReport.unknownFaculty'),
);

const mockRegistrationReportData = computed<AdminRegistrationStatisticsReportResponse>(() => {
  const facultyId = authStore.user?.facId ?? 1;
  const facultyName = currentFacultyName.value;

  return {
    generatedAt: new Date().toISOString(),
    filterOptions: {
      faculties: [
        {
          id: facultyId,
          label: facultyName,
        },
      ],
      courseTypes: [
        { id: 1, label: 'ระยะสั้น' },
        { id: 2, label: 'อบรมเชิงปฏิบัติการ' },
      ],
    },
    summary: {
      totalCourses: 3,
      totalLearners: 48,
      totalRegistrationFees: 133600,
    },
    pagination: {
      page: 1,
      pageSize: 10,
      total: 3,
      totalPages: 1,
    },
    groups: [
      {
        facultyId,
        facultyName,
        totalCourses: 3,
        totalLearners: 48,
        totalRegistrationFees: 133600,
        items: [
          {
            rowNumber: 1,
            courseId: 101,
            courseCode: 'C-WS-001',
            courseName: 'การใช้งานระบบเศรษฐกิจดิจิทัลสำหรับเจ้าหน้าที่',
            responsibleName: 'นางสาวศิริลักษณ์ ชูใจ',
            startDate: '2026-06-01',
            endDate: '2026-06-15',
            learnerCount: 18,
            unitPrice: 2400,
            registrationFee: 43200,
          },
          {
            rowNumber: 2,
            courseId: 102,
            courseCode: 'C-WS-002',
            courseName: 'การพัฒนารูปแบบรายงานทางการเงินเบื้องต้น',
            responsibleName: 'นายกฤษฎา พงศ์ไพบูลย์',
            startDate: '2026-06-10',
            endDate: '2026-06-20',
            learnerCount: 14,
            unitPrice: 2800,
            registrationFee: 39200,
          },
          {
            rowNumber: 3,
            courseId: 103,
            courseCode: 'C-FAC-003',
            courseName: 'หลักสูตรการบริหารงบประมาณและตรวจสอบภายใน',
            responsibleName: 'ผู้ช่วยศาสตราจารย์ ดร.นภัสสรณ์ วุฒิพงศ์',
            startDate: '2026-06-18',
            endDate: '2026-06-28',
            learnerCount: 16,
            unitPrice: 3200,
            registrationFee: 51200,
          },
        ],
      },
    ],
  };
});
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
