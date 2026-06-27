<template>
  <q-page class="finance-page finance-daily-report-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    >
      <template #aside>
        <CentralFinanceScopeCard :label="activeFacultyLabel" />
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <PeriodFilterBar
        v-model="period"
        :presets="datePresetOptions"
        @change="onPeriodChange"
        @clear="clearFilters"
      >
        <template #append>
          <div class="filter-faculty-wrap">
            <q-select
              v-model="selectedFaculty"
              :options="departmentOptions"
              :loading="isFacultyLoading"
              emit-value
              map-options
              outlined
              dense
              bg-color="white"
              style="min-width: 200px"
              @update:model-value="onFacultyChange"
            />
          </div>
        </template>
      </PeriodFilterBar>

      <CentralFinanceSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <TableExportActions
            :pdf-config="pdfExportConfig"
            :csv-config="csvExportConfig"
            :pdf-label="$t('centralFinance.dailyReport.table.pdfBtn')"
            :csv-label="$t('centralFinance.dailyReport.table.excelBtn')"
          />
        </template>

        <div class="text-center q-pt-lg q-pb-sm">
          <div class="text-weight-bold text-subtitle1">
            {{ $t('centralFinance.dailyReport.table.reportTitle') }}
          </div>
          <div class="text-weight-bold text-subtitle2">
            {{ $t('centralFinance.dailyReport.table.departmentLabel') }}:
            {{ getDepartmentLabel(selectedFaculty) }}
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

        <div class="row justify-end items-center q-px-md q-pb-md report-search-bar">
          <AppSearchInput
            v-model="search"
            :placeholder="$t('centralFinance.dailyReport.table.searchLabel')"
            class="report-search"
          />
        </div>

        <BaseTable
          :columns="columns"
          :rows="pagedRows"
          :loading="isLoading"
          :page="currentPage"
          :total-pages="totalPages"
          :rows-per-page="rowsPerPage"
          show-rows-per-page
          :rows-per-page-options="[10, 25, 50, 100]"
          :on-page-change="onPageChange"
          :on-rows-per-page-change="onRowsPerPageChange"
          min-width="800px"
        >
          <template #cell-faculty="{ value }">
            {{ translateFaculty(value as string) }}
          </template>

          <template #cell-courseName="{ row }">
            <div style="word-break: break-word">
              {{ getCourseDisplayName(row as DailyReportItem) }}
            </div>
          </template>

          <template #cell-amount="{ value }">
            {{ formatCurrency(value as number) }}
          </template>
        </BaseTable>
      </CentralFinanceSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { useI18n } from 'vue-i18n';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceScopeCard from 'components/centralfinance/CentralFinanceScopeCard.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const { t, locale } = useI18n();

const FACULTY_I18N_MAP: Record<string, string> = {
  คณะวิทยาการสารสนเทศ: 'informatics',
  คณะวิทยาศาสตร์: 'science',
  คณะพยาบาลศาสตร์: 'nursing',
  คณะบริหารธุรกิจ: 'business',
  คณะวิศวกรรมศาสตร์: 'engineering',
  สำนักคอมพิวเตอร์: 'computerCenter',
  คณะมนุษยศาสตร์และสังคมศาสตร์: 'humanities',
};

function translateFaculty(name: string): string {
  const key = FACULTY_I18N_MAP[name];
  return key ? t(`common.faculties.${key}`) : name;
}

function getCourseDisplayName(row: DailyReportItem): string {
  if (locale.value !== 'th' && row.courseNameEn) return row.courseNameEn;
  return row.courseName;
}
const search = ref('');
const isLoading = ref(false);
const isFacultyLoading = ref(false);

const currentPage = ref(1);
const rowsPerPage = ref(25);

const period = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });
const selectedFaculty = ref('');

const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

interface DailyReportItem {
  id: number;
  no: number;
  faculty: string;
  courseName: string;
  courseNameEn: string | null;
  fundCode: string | null;
  amount: number;
  receiptDate: string | null;
  receiptStatus: string;
}

const tableRows = ref<DailyReportItem[]>([]);

// ── Faculty Options ──────────────────────────────────────────
const rawFacultyData = ref<{ id: number; name: string; nameEn: string | null }[]>([]);

const departmentOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' },
  ...rawFacultyData.value.map((f) => ({
    label: locale.value === 'th' ? (f.name ?? '') : ((f.nameEn || f.name) ?? ''),
    value: f.name ?? '',
  })),
]);

async function fetchFacultyOptions(): Promise<void> {
  isFacultyLoading.value = true;
  try {
    const { data } = await api.get<{ id: number; name: string; nameEn: string | null }[]>(
      '/api/centralfinance/daily-report/faculty-options',
    );
    rawFacultyData.value = data;
  } catch {
    // use default when load fails
  } finally {
    isFacultyLoading.value = false;
  }
}
const activeFacultyLabel = computed<string>(() => {
  if (!selectedFaculty.value) return t('centralFinance.receiptSummary.allFaculties');
  return translateFaculty(selectedFaculty.value);
});

function getDepartmentLabel(val: string): string {
  if (!val) return t('centralFinance.receiptSummary.allFaculties');
  return translateFaculty(val);
}

// ── Columns ──────────────────────────────────────────────────
const columns = computed<BaseTableColumn[]>(() => [
  { key: 'no', label: t('centralFinance.dailyReport.table.no'), align: 'center', sortable: true },
  {
    key: 'faculty',
    label: t('centralFinance.dailyReport.table.faculty'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'courseName',
    label: t('centralFinance.dailyReport.table.courseName'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'fundCode',
    label: t('centralFinance.dailyReport.table.fundCode'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'amount',
    label: t('centralFinance.dailyReport.table.amount'),
    align: 'right',
    sortable: true,
  },
]);

const filteredTableRows = computed(() => {
  if (!search.value) return tableRows.value;
  const q = search.value.toLowerCase();
  return tableRows.value.filter((row) =>
    [row.faculty, row.courseName, row.fundCode ?? '', String(row.no)].some((v) =>
      v.toLowerCase().includes(q),
    ),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTableRows.value.length / rowsPerPage.value)),
);

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredTableRows.value.slice(start, start + rowsPerPage.value);
});

watch(search, () => {
  currentPage.value = 1;
});

function onPageChange(page: number): void {
  currentPage.value = page;
}

function onRowsPerPageChange(rpp: number): void {
  rowsPerPage.value = rpp;
  currentPage.value = 1;
}

// ── Fetch Data ───────────────────────────────────────────────
async function fetchData(): Promise<void> {
  isLoading.value = true;
  try {
    const params: Record<string, string> = {};
    if (period.value.dateFrom) params.receiptDateStart = period.value.dateFrom;
    if (period.value.dateTo) params.receiptDateEnd = period.value.dateTo;
    if (selectedFaculty.value) params.facName = selectedFaculty.value;

    const { data } = await api.get<{ success: boolean; data: DailyReportItem[] }>(
      '/api/centralfinance/daily-report',
      { params },
    );
    tableRows.value = data.success ? data.data : [];
  } catch {
    tableRows.value = [];
    $q.notify({
      type: 'negative',
      message: t('centralFinance.dailyReport.notifications.fetchFailed'),
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
}

function onPeriodChange(): void {
  currentPage.value = 1;
  void fetchData();
}

function onFacultyChange(): void {
  currentPage.value = 1;
  void fetchData();
}

function clearFilters(): void {
  selectedFaculty.value = '';
  tableRows.value = [];
  search.value = '';
  currentPage.value = 1;
}

onMounted(() => {
  void fetchFacultyOptions();
  void fetchData();
});

// ── Helpers ──────────────────────────────────────────────────
function formatCurrency(val: number): string {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

// ── Export Configs ───────────────────────────────────────────
const pdfExportConfig = computed<PdfExportConfig | null>(() => {
  if (tableRows.value.length === 0) return null;
  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = getDepartmentLabel(selectedFaculty.value).replace(/\s+/g, '_');
  return {
    filename: `central-finance-daily-report_${facName}_${todayStr}`,
    orientation: 'landscape',
    titles: [
      t('centralFinance.dailyReport.table.reportTitle'),
      `${t('centralFinance.dailyReport.table.departmentLabel')}: ${getDepartmentLabel(selectedFaculty.value)}`,
      t('centralFinance.dailyReport.table.dateLabel', {
        start: period.value.dateFrom || '-',
        end: period.value.dateTo || '-',
      }),
    ],
    titleStartY: 35,
    titleLineHeight: 15,
    startY: 80,
    head: [
      [
        t('centralFinance.dailyReport.export.no'),
        t('centralFinance.dailyReport.export.faculty'),
        t('centralFinance.dailyReport.export.courseName'),
        t('centralFinance.dailyReport.export.fundCode'),
        t('centralFinance.dailyReport.export.receiptDate'),
        t('centralFinance.dailyReport.export.status'),
        t('centralFinance.dailyReport.export.amount'),
      ],
    ],
    body: tableRows.value.map((row) => [
      row.no,
      translateFaculty(row.faculty),
      getCourseDisplayName(row),
      row.fundCode ?? '-',
      row.receiptDate ?? '-',
      row.receiptStatus,
      formatCurrency(row.amount),
    ]),
    styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
    headStyles: { fontSize: 8 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 },
      1: { cellWidth: 100 },
      2: { cellWidth: 240 },
      3: { cellWidth: 140 },
      4: { halign: 'center', cellWidth: 70 },
      5: { halign: 'center', cellWidth: 55 },
      6: { halign: 'right', cellWidth: 70 },
    },
  };
});

const csvExportConfig = computed<CsvExportConfig | null>(() => {
  if (tableRows.value.length === 0) return null;
  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = getDepartmentLabel(selectedFaculty.value).replace(/\s+/g, '_') || 'All';
  return {
    filename: `central-finance-daily-report_${facName}_${todayStr}.csv`,
    headers: [
      t('centralFinance.dailyReport.export.no'),
      t('centralFinance.dailyReport.export.faculty'),
      t('centralFinance.dailyReport.export.courseName'),
      t('centralFinance.dailyReport.export.fundCode'),
      t('centralFinance.dailyReport.export.receiptDate'),
      t('centralFinance.dailyReport.export.status'),
      t('centralFinance.dailyReport.export.amount'),
    ],
    data: tableRows.value.map((row) => [
      row.no,
      translateFaculty(row.faculty),
      getCourseDisplayName(row).replace(/\n/g, ' '),
      (row.fundCode ?? '-').replace(/\n/g, ' '),
      row.receiptDate ?? '-',
      row.receiptStatus,
      row.amount,
    ]),
  };
});
</script>

<style lang="scss" scoped>
.filter-faculty-wrap {
  margin-left: 12px;
  flex-shrink: 0;
}

.report-search-bar {
  @media (max-width: 599px) {
    justify-content: stretch;
    width: 100%;
  }
}

.report-search {
  width: 260px;

  @media (max-width: 599px) {
    width: 100%;
  }
}
</style>
