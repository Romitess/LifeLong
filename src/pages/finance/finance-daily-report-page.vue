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
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ currentUserDepartment || 'ไม่ระบุคณะ' }}</div>
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
                  <q-item-section class="text-italic text-grey">ไม่พบข้อมูลหลักสูตร</q-item-section>
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
              :excel-config="excelExportConfig"
              :pdf-label="$t('centralFinance.dailyReport.table.pdfBtn')"
              :excel-label="$t('centralFinance.dailyReport.table.excelBtn')"
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
          <q-table
            :rows="tableRows"
            :columns="columns"
            row-key="id"
            flat
            :loading="isLoading"
            class="report-table"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 25, 50, 100]"
          >
            <template v-slot:body-cell-amount="props">
              <q-td :props="props" class="text-right">
                {{ formatCurrency(props.value) }}
              </q-td>
            </template>

            <template v-slot:bottom="scope">
              <div class="report-pagination q-py-sm">
                <div class="row items-center q-gutter-sm">
                  <span class="text-subtitle2 text-grey-8">
                    {{ $t('centralFinance.dailyReport.table.showLabel') }}
                  </span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="[10, 25, 50, 100]"
                    outlined
                    dense
                    options-dense
                    style="width: 80px"
                    class="bg-white report-rows-select"
                  />
                  <span class="text-subtitle2 text-grey-8">
                    {{ $t('centralFinance.dailyReport.table.entriesLabel') }}
                  </span>
                </div>
                <div class="row items-center q-gutter-sm">
                  <span class="text-caption text-grey-8 q-mr-sm">
                    {{
                      tableRows.length > 0
                        ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                        : 0
                    }}-{{
                      Math.min(
                        scope.pagination.page * scope.pagination.rowsPerPage,
                        tableRows.length,
                      )
                    }}
                    of {{ tableRows.length }}
                  </span>
                  <q-btn
                    icon="first_page"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.firstPage"
                  />
                  <q-btn
                    icon="chevron_left"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.prevPage"
                  />
                  <q-btn
                    icon="chevron_right"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.nextPage"
                  />
                  <q-btn
                    icon="last_page"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.lastPage"
                  />
                </div>
              </div>
            </template>
          </q-table>
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
import type { QTableColumn } from 'quasar';
import TableExportActions from 'components/common/TableExportActions.vue';
import type { PdfExportConfig, ExcelExportConfig } from 'src/types/export-types';

const $q = useQuasar();
const { t } = useI18n();
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
  fundCode: string;
  amount: number;
}

const tableRows = ref<DailyReportItem[]>([]);

const columns = computed<QTableColumn[]>(() => [
  {
    name: 'no',
    label: t('centralFinance.dailyReport.table.no'),
    field: 'no',
    align: 'center',
    sortable: true,
  },
  {
    name: 'courseName',
    label: t('centralFinance.dailyReport.table.courseName'),
    field: 'courseName',
    align: 'center',
    sortable: true,
    style: 'white-space: pre-wrap; word-break: break-word;',
  },
  {
    name: 'fundCode',
    label: t('centralFinance.dailyReport.table.fundCode'),
    field: 'fundCode',
    align: 'center',
    sortable: true,
    style: 'white-space: pre-wrap; word-break: break-word;',
  },
  {
    name: 'amount',
    label: t('centralFinance.dailyReport.table.amount'),
    field: 'amount',
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
        message: 'ไม่พบ API /api/centralfinance/daily-report กรุณาตรวจสอบ Backend',
        position: 'top',
      });
      tableRows.value = [];
    } else {
      $q.notify({
        type: 'negative',
        message: 'ไม่สามารถดึงข้อมูลรายงานประจำวันได้',
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
    row.courseName,
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

const excelExportConfig = computed<ExcelExportConfig | null>(() => {
  if (tableRows.value.length === 0) return null;

  const header = [
    t('centralFinance.dailyReport.table.no'),
    t('centralFinance.dailyReport.table.courseName'),
    t('centralFinance.dailyReport.table.fundCode'),
    t('centralFinance.dailyReport.table.amount'),
  ];

  const rows = tableRows.value.map((row) => [
    row.no,
    row.courseName.replace(/\n/g, ' '),
    row.fundCode.replace(/\n/g, ' '),
    row.amount,
  ]);

  const title1 = t('centralFinance.dailyReport.table.reportTitle');
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')} ${currentUserDepartment.value}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: period.value.dateFrom || '-',
    end: period.value.dateTo || '-',
  });

  const wsData = [[title1], [title2], [title3], [], header, ...rows];
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
  ];

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = currentUserDepartment.value.replace(/\s+/g, '_') || 'All';
  const filename = `dailyreport_${facName}_${todayStr}`;

  return {
    filename,
    sheetName: 'Daily Report',
    rawWsData: wsData,
    merges,
    cols: [{ wch: 8 }, { wch: 60 }, { wch: 45 }, { wch: 15 }],
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
