<template>
  <q-page class="finance-page finance-receipt-usage-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt"
      :title="$t('centralFinance.receiptUsage.hero.title')"
      :description="$t('centralFinance.receiptUsage.hero.description')"
    >
      <template #aside>
        <CentralFinanceScopeCard :label="activeFacultyScopeLabel" />
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- Filter Bar -->
      <PeriodFilterBar
        v-model="period"
        :presets="datePresetOptions"
        @change="onPeriodChange"
        @clear="onClear"
      >
        <template #append>
          <div class="filter-faculty-wrap">
            <q-select
              v-model="filters.faculty"
              :options="facultyOptions"
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

      <!-- Table Card -->
      <CentralFinanceSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <TableExportActions
            :pdf-config="pdfExportConfig"
            :csv-config="csvExportConfig"
            :pdf-label="$t('finance.receiptSummary.exportPdf')"
            :csv-label="$t('centralFinance.receiptUsage.export.csvLabel')"
          />
        </template>

        <div class="text-center q-pt-lg q-pb-sm">
          <div class="text-weight-bold text-subtitle1">
            {{ $t('centralFinance.receiptUsage.reportTitle') }}
          </div>
          <div class="text-weight-medium text-caption text-grey-8 q-mt-xs">
            {{ $t('centralFinance.receiptSummary.filters.faculty') }}: {{ activeFacultyScopeLabel }}
          </div>
        </div>

        <div class="row justify-end items-center q-px-md q-pb-md receipt-search-bar">
          <AppSearchInput
            v-model="search"
            :placeholder="$t('finance.receiptSummary.searchLabel')"
            class="receipt-search"
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
          min-width="0"
        >
          <template #cell-faculty="{ row }">
            {{ getFacultyDisplayName(row as ReceiptUsageItem) }}
          </template>

          <template #cell-cancelDoc="{ row }">
            <div v-if="(row as ReceiptUsageItem).status === 'ยกเลิก'" class="text-negative">
              {{ $t('finance.receiptSummary.statusCancelled') }}
              <div class="text-caption text-grey-6">
                <div>{{ (row as ReceiptUsageItem).cancelBy }}</div>
                <div>{{ (row as ReceiptUsageItem).cancelDate }}</div>
              </div>
            </div>
          </template>

          <template #cell-customerName="{ row }">
            <div style="word-break: break-word">{{ getCustomerDisplayName(row as ReceiptUsageItem) }}</div>
          </template>

          <template #cell-courseName="{ row }">
            <div style="word-break: break-word">{{ getCourseDisplayName(row as ReceiptUsageItem) }}</div>
          </template>

          <template #cell-collector="{ row }">
            <div style="word-break: break-word">{{ getCollectorDisplayName(row as ReceiptUsageItem) }}</div>
          </template>
        </BaseTable>

        <div
          v-if="filteredRows.length > 0"
          class="row justify-end items-center q-px-lg q-py-md receipt-total-bar"
        >
          <span class="text-weight-medium text-grey-8"
            >{{ $t('centralFinance.receiptUsage.columns.total') }}:</span
          >
          <span class="text-weight-bold q-ml-sm">
            {{
              totalAmount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}
          </span>
        </div>
      </CentralFinanceSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar, date } from 'quasar';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceScopeCard from 'components/centralfinance/CentralFinanceScopeCard.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';
import { useReceiptUsageReport } from 'src/composables/use-receipt-usage-report';
import type { ReceiptUsageItem } from 'src/types/receipt-usage-report';

const { t, locale } = useI18n();

function getCourseDisplayName(row: ReceiptUsageItem): string {
  if (locale.value !== 'th' && row.courseNameEn) return row.courseNameEn;
  return row.courseName;
}

function getCustomerDisplayName(row: ReceiptUsageItem): string {
  if (locale.value !== 'th' && row.customerNameEn) return row.customerNameEn;
  return row.customerName;
}

function getCollectorDisplayName(row: ReceiptUsageItem): string {
  if (locale.value !== 'th' && row.collectorNameEn) return row.collectorNameEn;
  return row.collector;
}

function getFacultyDisplayName(row: ReceiptUsageItem): string {
  if (locale.value !== 'th' && row.facultyEn) return row.facultyEn;
  return row.faculty;
}
const $q = useQuasar();
const {
  items,
  facultyOptions: apiFacultyOptions,
  isLoading,
  error,
  filters,
  fetchData,
  fetchFacultyOptions,
  clearFilters: clearComposableFilters,
} = useReceiptUsageReport();

watch(error, (msg) => {
  if (msg) $q.notify({ type: 'negative', message: msg, position: 'top' });
});

const period = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });
const search = ref('');
const currentPage = ref(1);
const rowsPerPage = ref(10);

const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

const facultyOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' },
  ...apiFacultyOptions.value.map((f) => ({
    label: locale.value === 'th' ? (f.name ?? '') : ((f.nameEn || f.name) ?? ''),
    value: f.name ?? '',
  })),
]);

const activeFacultyScopeLabel = computed<string>(() => {
  if (!filters.value.faculty) return t('centralFinance.receiptSummary.allFaculties');
  const option = facultyOptions.value.find((o) => o.value === filters.value.faculty);
  return option?.label ?? filters.value.faculty;
});

function onPeriodChange(): void {
  filters.value.receiptDateStart = period.value.dateFrom;
  filters.value.receiptDateEnd = period.value.dateTo;
  currentPage.value = 1;
  void fetchData();
}

function onFacultyChange(): void {
  currentPage.value = 1;
  void fetchData();
}

function onClear(): void {
  clearComposableFilters();
  period.value = { preset: 'allTime', dateFrom: '', dateTo: '' };
  search.value = '';
  currentPage.value = 1;
  void fetchData();
}

// ── Table ─────────────────────────────────────────────────────
const columns = computed<BaseTableColumn[]>(() => [
  { key: 'no', label: t('finance.receiptSummary.columns.no'), align: 'center', sortable: true },
  {
    key: 'departmentCode',
    label: t('centralFinance.receiptUsage.columns.departmentCode'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'faculty',
    label: t('centralFinance.receiptUsage.columns.departmentName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'receiptNo',
    label: t('finance.receiptSummary.columns.receiptNo'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'cancelDoc',
    label: t('centralFinance.receiptUsage.columns.cancelDoc'),
    align: 'center',
    sortable: true,
    sortKey: 'status',
  },
  {
    key: 'effectiveDate',
    label: t('centralFinance.receiptUsage.columns.receiptCompletedDate'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'fiscalYear',
    label: t('centralFinance.receiptUsage.columns.fiscalYear'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'amount',
    label: t('finance.receiptSummary.columns.amount'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'courseName',
    label: t('centralFinance.receiptUsage.columns.courseName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'customerName',
    label: t('centralFinance.receiptUsage.columns.customerName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'collector',
    label: t('centralFinance.receiptUsage.columns.cashierName'),
    align: 'center',
    sortable: true,
  },
]);

const filteredRows = computed(() => {
  if (!search.value) return items.value;
  const q = search.value.toLowerCase();
  return items.value.filter((row) =>
    [row.faculty, row.receiptNo, row.customerName, row.courseName, row.departmentCode].some((v) =>
      String(v ?? '')
        .toLowerCase()
        .includes(q),
    ),
  );
});

const totalAmount = computed(() =>
  filteredRows.value.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / rowsPerPage.value)),
);

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredRows.value.slice(start, start + rowsPerPage.value);
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

// ── Export Configs ───────────────────────────────────────────
const todayStr = date.formatDate(new Date(), 'DDMMYYYY');

const pdfExportConfig = computed<PdfExportConfig | null>(() => {
  if (filteredRows.value.length === 0) return null;
  return {
    filename: `central-finance-receipt-usage_${todayStr}`,
    orientation: 'landscape',
    titles: [
      t('centralFinance.receiptUsage.reportTitle'),
      `${t('centralFinance.receiptSummary.filters.faculty')}: ${activeFacultyScopeLabel.value}`,
    ],
    titleStartY: 35,
    titleLineHeight: 15,
    startY: 65,
    head: [
      [
        t('centralFinance.receiptUsage.export.no'),
        t('centralFinance.receiptUsage.export.departmentCode'),
        t('centralFinance.receiptUsage.export.departmentName'),
        t('centralFinance.receiptUsage.export.receiptNo'),
        t('centralFinance.receiptUsage.export.cancelDoc'),
        t('centralFinance.receiptUsage.export.receiptDate'),
        t('centralFinance.receiptUsage.export.fiscalYear'),
        t('centralFinance.receiptUsage.export.amount'),
        t('centralFinance.receiptUsage.export.courseName'),
        t('centralFinance.receiptUsage.export.customerName'),
        t('centralFinance.receiptUsage.export.cashierName'),
      ],
    ],
    body: filteredRows.value.map((row) => [
      row.no,
      row.departmentCode,
      getFacultyDisplayName(row),
      row.receiptNo,
      row.status === 'ยกเลิก'
        ? `${t('centralFinance.receiptUsage.export.statusCancelled')}\n${row.cancelBy ?? ''}\n${row.cancelDate ?? ''}`
        : '',
      row.effectiveDate,
      row.fiscalYear,
      row.amount,
      getCourseDisplayName(row),
      getCustomerDisplayName(row),
      getCollectorDisplayName(row),
    ]),
    styles: { fontSize: 7, cellPadding: 3, valign: 'top' },
    headStyles: { fontSize: 7 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22 },
      1: { halign: 'center', cellWidth: 30 },
      2: { cellWidth: 75 },
      3: { halign: 'center', cellWidth: 65 },
      4: { cellWidth: 70 },
      5: { halign: 'center', cellWidth: 60 },
      6: { halign: 'center', cellWidth: 32 },
      7: { halign: 'center', cellWidth: 45 },
      8: { cellWidth: 120 },
      9: { cellWidth: 80 },
      10: { cellWidth: 80 },
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
        if (val.startsWith('ยกเลิก')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  };
});

const csvExportConfig = computed<CsvExportConfig | null>(() => {
  if (filteredRows.value.length === 0) return null;
  return {
    filename: `central-finance-receipt-usage_${todayStr}.csv`,
    headers: [
      t('centralFinance.receiptUsage.export.no'),
      t('centralFinance.receiptUsage.export.departmentCode').replace('\n', ''),
      t('centralFinance.receiptUsage.export.departmentName'),
      t('centralFinance.receiptUsage.export.receiptNo').replace('\n', ''),
      t('centralFinance.receiptUsage.export.cancelDoc'),
      t('centralFinance.receiptUsage.export.receiptDate').replace('\n', ''),
      t('centralFinance.receiptUsage.export.fiscalYear'),
      t('centralFinance.receiptUsage.export.amount'),
      t('centralFinance.receiptUsage.export.courseName'),
      t('centralFinance.receiptUsage.export.customerName'),
      t('centralFinance.receiptUsage.export.cashierName'),
    ],
    data: filteredRows.value.map((row) => [
      row.no,
      row.departmentCode,
      getFacultyDisplayName(row),
      row.receiptNo,
      row.status === 'ยกเลิก'
        ? `${t('centralFinance.receiptUsage.export.statusCancelled')} | ${row.cancelBy ?? ''} | ${row.cancelDate ?? ''}`
        : '',
      row.effectiveDate,
      row.fiscalYear,
      row.amount,
      getCourseDisplayName(row),
      getCustomerDisplayName(row),
      getCollectorDisplayName(row),
    ]),
  };
});

onMounted(() => {
  void fetchFacultyOptions();
  void fetchData();
});
</script>

<style lang="scss" scoped>
.filter-faculty-wrap {
  margin-left: 12px;
  flex-shrink: 0;
}

.receipt-search-bar {
  @media (max-width: 599px) {
    justify-content: stretch;
    width: 100%;
  }
}

.receipt-search {
  width: 250px;

  @media (max-width: 599px) {
    width: 100%;
  }
}
</style>
