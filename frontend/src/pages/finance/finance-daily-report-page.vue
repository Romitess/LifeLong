<template>
  <q-page class="finance-page finance-daily-report-page">
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('finance.educationReport.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">
            {{ currentUserDepartment || $t('finance.educationReport.unknownFaculty') }}
          </div>
        </div>
      </template>
    </AppPageHero>

    <section class="finance-shell finance-content">
      <PeriodFilterBar
        v-model="period"
        :presets="datePresetOptions"
        @change="fetchData"
        @clear="selectedCourse = null"
      >
        <template #append>
          <div style="width: 350px; margin-left: 16px">
            <q-select
              v-model="selectedCourse"
              :options="filteredCourseOptions"
              option-label="name"
              option-value="id"
              use-input
              input-debounce="300"
              @filter="filterCourse"
              dense
              outlined
              bg-color="white"
              :label="$t('centralFinance.dailyReport.table.courseName')"
              clearable
              @update:model-value="fetchData"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-italic text-grey">{{
                    $t('centralFinance.dailyReport.filters.noCourseOption')
                  }}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </template>
      </PeriodFilterBar>

      <AppSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <div class="table-export-actions">
            <TableExportActions
              :pdf-config="pdfExportConfig"
              :csv-config="csvExportConfig"
              :pdf-label="$t('centralFinance.dailyReport.table.pdfBtn')"
              :csv-label="$t('centralFinance.dailyReport.table.csvBtn')"
            />
          </div>
        </template>

        <div class="text-center q-pt-lg q-pb-sm">
          <div class="text-weight-bold text-subtitle1">
            {{ $t('centralFinance.dailyReport.table.reportTitle') }}
          </div>
          <div class="text-weight-bold text-subtitle2">
            {{ $t('centralFinance.dailyReport.table.departmentLabel') }}:
            {{ currentUserDepartment }}
          </div>
          <div class="text-weight-medium text-caption text-grey-8">
            {{
              $t('centralFinance.dailyReport.table.dateLabel', {
                start: period.dateFrom || '-',
                end: period.dateTo || '-',
              })
            }}
          </div>
        </div>

        <div class="report-table-wrapper">
          <BaseTable
            :columns="columns"
            :rows="paginatedRows"
            :page="pagination.page"
            :total-pages="Math.max(1, Math.ceil(tableRows.length / pagination.rowsPerPage))"
            :rows-per-page="pagination.rowsPerPage"
            :loading="isLoading"
            show-index
            show-rows-per-page
            height-mode="auto"
            @page-change="pagination.page = $event"
            @rows-per-page-change="
              pagination.rowsPerPage = $event;
              pagination.page = 1;
            "
          >
            <template #cell-amount="{ row }">
              <div class="text-right">
                {{ formatCurrency(row.amount) }}
              </div>
            </template>

            <template #cell-courseName="{ row }">
              <div style="white-space: pre-wrap; word-break: break-word">{{ getCourseDisplayName(row as DailyReportItem) }}</div>
            </template>

            <template #cell-fundCode="{ row }">
              <div style="white-space: pre-wrap; word-break: break-word">{{ row.fundCode }}</div>
            </template>
          </BaseTable>
        </div>
      </AppSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';

import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { useAuthStore } from 'stores/auth-store';
import { api } from 'src/boot/axios';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';

const $q = useQuasar();
const { t, locale } = useI18n();
const authStore = useAuthStore();

interface CourseOption {
  id: string;
  name: string;
}

const selectedCourse = ref<CourseOption | null>(null);
const courseOptions = ref<CourseOption[]>([]);
const filteredCourseOptions = ref<CourseOption[]>([]);

async function fetchCourseOptions() {
  try {
    const params = { facId: authStore.user?.facId ?? undefined };
    const { data } = await api.get<CourseOption[]>(
      '/api/centralfinance/daily-report/course-options',
      { params },
    );
    courseOptions.value = data || [];
    filteredCourseOptions.value = courseOptions.value;
  } catch (error) {
    console.error('Fetch course options error:', error);
  }
}

function filterCourse(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredCourseOptions.value = courseOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredCourseOptions.value = courseOptions.value.filter((v) =>
      v.name.toLowerCase().includes(needle),
    );
  });
}

const currentUserDepartment = computed(
  () => authStore.user?.facName ?? authStore.user?.faculty ?? '',
);

const period = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });

const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

interface DailyReportItem {
  id: string | number;
  no: number;
  courseName: string;
  courseNameEn: string | null;
  fundCode: string;
  amount: number;
}

function getCourseDisplayName(row: DailyReportItem): string {
  if (locale.value !== 'th' && row.courseNameEn) return row.courseNameEn;
  return row.courseName;
}

const tableRows = ref<DailyReportItem[]>([]);

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return tableRows.value.slice(start, end);
});

const columns = computed<BaseTableColumn[]>(() => [
  {
    key: 'courseName',
    label: t('centralFinance.dailyReport.table.courseName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'fundCode',
    label: t('centralFinance.dailyReport.table.fundCode'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'amount',
    label: t('centralFinance.dailyReport.table.amount'),
    align: 'right',
    sortable: true,
  },
]);

const isLoading = ref(false);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

async function fetchData() {
  isLoading.value = true;
  try {
    const params: Record<string, string | number | undefined> = {
      facId: authStore.user?.facId ?? undefined,
    };
    if (selectedCourse.value) {
      params.courseName = selectedCourse.value.name;
    }
    if (period.value.preset !== 'allTime') {
      params.receiptDateStart = period.value.dateFrom;
      params.receiptDateEnd = period.value.dateTo;
    }

    const { data } = await api.get('/api/centralfinance/daily-report', { params });

    if (data.success && data.data) {
      tableRows.value = data.data;
    } else {
      tableRows.value = [];
    }
  } catch (error) {
    console.error('Fetch daily report error:', error);
    const err = error as { response?: { status: number } };
    if (err.response && err.response.status === 404) {
      $q.notify({
        type: 'warning',
        message: t('centralFinance.dailyReport.notifications.apiNotFound'),
        position: 'top',
      });
      tableRows.value = [];
    } else {
      $q.notify({
        type: 'negative',
        message: t('centralFinance.dailyReport.notifications.fetchFailed'),
        position: 'top',
      });
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void fetchCourseOptions();
  void fetchData();
});

function formatCurrency(val: number): string {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

const pdfExportConfig = computed<PdfExportConfig | null>(() => {
  if (tableRows.value.length === 0) return null;

  const title1 = t('centralFinance.dailyReport.table.reportTitle');
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')}: ${currentUserDepartment.value}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: period.value.dateFrom || '-',
    end: period.value.dateTo || '-',
  });

  const rows = tableRows.value.map((row) => [
    row.no,
    getCourseDisplayName(row),
    row.fundCode,
    formatCurrency(row.amount),
  ]);

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = currentUserDepartment.value.replace(/\s+/g, '_') || 'All';
  const filename = `dailyreport_${facName}_${todayStr}`;

  return {
    filename,
    titles: [title1, title2, title3],
    titleStartY: 35,
    titleLineHeight: 15,
    startY: 80,
    head: [
      [
        t('centralFinance.dailyReport.table.no'),
        t('centralFinance.dailyReport.table.courseName'),
        t('centralFinance.dailyReport.table.fundCode'),
        t('centralFinance.dailyReport.table.amount'),
      ],
    ],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 5,
      valign: 'middle',
    },
    headStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: {},
      2: {},
      3: { halign: 'right', cellWidth: 100 },
    },
  };
});

const csvExportConfig = computed<CsvExportConfig | null>(() => {
  if (tableRows.value.length === 0) return null;

  const headers = [
    t('centralFinance.dailyReport.table.no'),
    t('centralFinance.dailyReport.table.courseName'),
    t('centralFinance.dailyReport.table.fundCode'),
    t('centralFinance.dailyReport.table.amount'),
  ];

  const rows = tableRows.value.map((row) => [
    row.no,
    getCourseDisplayName(row).replace(/\n/g, ' '),
    row.fundCode.replace(/\n/g, ' '),
    row.amount,
  ]);

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = currentUserDepartment.value.replace(/\s+/g, '_') || 'All';
  const filename = `dailyreport_${facName}_${todayStr}.csv`;

  return {
    filename,
    headers,
    data: rows,
  };
});
</script>

<style lang="scss" scoped>
.faculty-scope-card {
  min-width: 260px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 6px;

  @media (max-width: 599px) {
    min-width: 0;
    width: 100%;
    padding: 12px 14px;
  }
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

.filter-label {
  @media (min-width: 600px) {
    text-align: right;
    padding-right: 16px;
  }

  @media (max-width: 599px) {
    margin-bottom: 4px;
  }
}

.filter-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.table-export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.report-search-bar {
  @media (max-width: 599px) {
    justify-content: stretch;
    width: 100%;
  }
}

.report-search {
  width: 250px;

  @media (max-width: 599px) {
    width: 100%;
  }
}

.report-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  .report-table {
    min-width: 600px;
  }
}

.report-table {
  background: transparent;

  :deep(.q-table__card) {
    box-shadow: none;
  }

  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(.q-table thead tr th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
    font-weight: 800;
    font-size: 0.8125rem;
    color: #475569;
    letter-spacing: 0.02em;
  }

  :deep(.q-table tbody tr:nth-child(even)) {
    background: rgba(248, 246, 241, 0.55);
  }

  :deep(.q-table tbody td) {
    font-size: 0.9rem;
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap;
  }

  :deep(.q-table__bottom) {
    border-top: 1px solid var(--admin-line, #e2e8f0);
  }
}

.report-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;

  @media (max-width: 599px) {
    justify-content: center;
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
