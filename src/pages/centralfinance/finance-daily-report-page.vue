<template>
  <q-page class="finance-page finance-daily-report-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    />

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
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const { t } = useI18n();
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
  fundCode: string | null;
  amount: number;
  receiptDate: string | null;
  receiptStatus: string;
}

const tableRows = ref<DailyReportItem[]>([]);

// ── Faculty Options ──────────────────────────────────────────
const departmentOptions = ref<{ label: string; value: string }[]>([
  { label: 'ทุกคณะ/ส่วนงาน', value: '' },
]);

async function fetchFacultyOptions(): Promise<void> {
  isFacultyLoading.value = true;
  try {
    const { data } = await api.get<{ id: number; name: string }[]>(
      '/api/centralfinance/daily-report/faculty-options',
    );
    departmentOptions.value = [
      { label: 'ทุกคณะ/ส่วนงาน', value: '' },
      ...data.map((f) => ({ label: f.name, value: f.name })),
    ];
  } catch {
    // ใช้ค่า default เมื่อโหลดไม่ได้
  } finally {
    isFacultyLoading.value = false;
  }
}

function getDepartmentLabel(val: string): string {
  if (!val) return 'ทุกคณะ/ส่วนงาน';
  return val;
}

// ── Columns ──────────────────────────────────────────────────
const columns = computed<BaseTableColumn[]>(() => [
  { key: 'no', label: t('centralFinance.dailyReport.table.no'), align: 'center', sortable: true },
  { key: 'faculty', label: 'คณะ/ส่วนงาน', align: 'left', sortable: true },
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
      message: 'ไม่สามารถดึงข้อมูลรายงานประจำวันได้',
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
        'ลำดับ',
        'คณะ/ส่วนงาน',
        'ชื่อโครงการ/หลักสูตร',
        'แหล่งเงิน',
        'วันที่รับเงิน',
        'สถานะ',
        'จำนวนเงิน',
      ],
    ],
    body: tableRows.value.map((row) => [
      row.no,
      row.faculty,
      row.courseName,
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
      'ลำดับ',
      'คณะ/ส่วนงาน',
      'ชื่อโครงการ/หลักสูตร',
      'แหล่งเงิน',
      'วันที่รับเงิน',
      'สถานะ',
      'จำนวนเงิน',
    ],
    data: tableRows.value.map((row) => [
      row.no,
      row.faculty,
      row.courseName.replace(/\n/g, ' '),
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
