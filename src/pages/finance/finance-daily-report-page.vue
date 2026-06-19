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
          <ReportExportActions
            :pdf-label="$t('centralFinance.dailyReport.table.pdfBtn')"
            :excel-label="$t('centralFinance.dailyReport.table.excelBtn')"
            @export-pdf="exportToPdf"
            @export-excel="exportToExcel"
          />
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
            dense
            :loading="isLoading"
            class="report-table"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 25, 50, 100]"
            :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
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
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import ReportExportActions from 'components/common/ReportExportActions.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { useAuthStore } from 'stores/auth-store';
import { api } from 'src/boot/axios';
import type { QTableColumn } from 'quasar';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

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

async function exportToPdf(): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const response = await fetch(SarabunFontUrl);
  const blob = await response.blob();
  const base64Font = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] || '');
    };
    reader.readAsDataURL(blob);
  });

  doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
  doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');

  doc.setFontSize(13);
  const title1 = t('centralFinance.dailyReport.table.reportTitle');
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')}: ${currentUserDepartment.value}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: period.value.dateFrom || '-',
    end: period.value.dateTo || '-',
  });

  doc.text(title1, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
  doc.text(title2, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
  doc.text(title3, doc.internal.pageSize.getWidth() / 2, 65, { align: 'center' });

  const rows = tableRows.value.map((row) => [
    row.no,
    row.courseName,
    row.fundCode,
    formatCurrency(row.amount),
  ]);

  autoTable(doc, {
    startY: 80,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
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
      font: 'Sarabun',
      fontSize: 9,
      cellPadding: 5,
      valign: 'middle',
      lineColor: [180, 180, 180],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'Sarabun',
      fillColor: [226, 232, 240],
      textColor: [51, 65, 85],
      fontStyle: 'normal',
      fontSize: 9,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: { cellWidth: 350 },
      2: { cellWidth: 250 },
      3: { halign: 'right', cellWidth: 100 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { top: 20, left: 20, right: 20 },
    tableWidth: 'auto',
  });

  doc.save('daily-report.pdf');
}

function exportToExcel(): void {
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
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
  ];

  ws['!cols'] = [{ wch: 8 }, { wch: 60 }, { wch: 45 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, 'daily-report.xlsx');
}
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

  :deep(thead tr) {
    background: #e2e8f0;
  }

  :deep(th) {
    font-weight: 600;
    color: #334155;
    font-size: 0.75rem;
    white-space: pre-wrap;
    text-align: center !important;
    vertical-align: middle;
    line-height: 1.3;
    padding: 8px 6px;
  }

  :deep(tbody td) {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap;
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
