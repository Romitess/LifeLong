<template>
  <q-page class="finance-page finance-receipt-summary-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.receiptSummary.hero.title')"
      :description="$t('centralFinance.receiptSummary.hero.description')"
    >
      <template #aside>
        <CentralFinanceScopeCard :label="activeFacultyScopeLabel" />
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- Sticky-bar sentinel -->
      <div ref="sentinelRef" class="period-filter-sentinel" />

      <!-- Filter Bar -->
      <div class="period-filter-bar" :class="{ 'period-filter-bar--stuck': filterStuck }">
        <div class="period-filter-bar__row1">
          <span class="period-filter-bar__label q-mr-sm">
            <q-icon name="filter_alt" size="14px" class="q-mr-xs" />
            {{ $t('finance.filters.filterLabel') }}
          </span>

          <button
            v-for="opt in datePresetOptions"
            :key="opt.value"
            class="period-filter-bar__item"
            :class="{ 'period-filter-bar__item--active': datePreset === opt.value }"
            @click="applyDatePreset(opt.value)"
          >
            {{ opt.label }}
          </button>

          <div class="period-filter-bar__divider" />

          <div class="filter-faculty-wrap">
            <q-select
              v-model="filters.faculty"
              :options="facultyOptions"
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

          <q-btn
            flat
            dense
            round
            icon="filter_alt_off"
            color="negative"
            class="q-ml-sm"
            @click="clearDates"
          >
            <q-tooltip>{{ $t('finance.filters.clearLabel') }}</q-tooltip>
          </q-btn>
        </div>

        <div class="period-filter-bar__row2">
          <span class="period-filter-bar__sub-label q-mr-sm"
            >{{ $t('finance.receiptSummary.filters.receiptDate') }}:</span
          >
          <q-input
            v-model="receiptDateDisplay"
            readonly
            borderless
            dense
            :placeholder="$t('finance.receiptSummary.filters.selectPeriod')"
            class="period-filter-bar__input period-filter-bar__input--range q-mr-md"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="receiptDateModel" range mask="DD/MM/YYYY" color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        :label="$t('finance.receiptSummary.filters.ok')"
                        color="primary"
                        flat
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <span class="period-filter-bar__sub-label q-mr-sm"
            >{{ $t('finance.receiptSummary.filters.effectiveDate') }}:</span
          >
          <q-input
            v-model="effectiveDateDisplay"
            readonly
            borderless
            dense
            :placeholder="$t('finance.receiptSummary.filters.selectPeriod')"
            class="period-filter-bar__input period-filter-bar__input--range"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="effectiveDateModel" range mask="DD/MM/YYYY" color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn
                        :label="$t('finance.receiptSummary.filters.ok')"
                        color="primary"
                        flat
                        v-close-popup
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <!-- Table Card -->
      <CentralFinanceSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <TableExportActions
            :pdf-config="pdfExportConfig"
            :csv-config="csvExportConfig"
            :pdf-label="$t('finance.receiptSummary.exportPdf')"
            :csv-label="$t('finance.receiptSummary.exportExcel')"
          />
        </template>

        <div class="text-center q-pt-lg q-pb-sm">
          <div class="text-weight-bold text-subtitle1">
            {{ $t('centralFinance.receiptSummary.reportTitle') }}
          </div>
          <div class="text-weight-medium text-caption text-grey-8 q-mt-xs">
            {{ $t('centralFinance.receiptSummary.filters.faculty') }}:
            {{ activeFacultyScopeLabel }}
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
          :rows="pagedItems"
          :loading="isLoading"
          :page="currentPage"
          :total-pages="totalPages"
          :rows-per-page="rowsPerPage"
          show-rows-per-page
          :rows-per-page-options="[10, 25, 50, 100]"
          :on-page-change="onPageChange"
          :on-rows-per-page-change="onRowsPerPageChange"
          min-width="900px"
        >
          <template #cell-faculty="{ value }">
            {{ translateFaculty(value as string) }}
          </template>

          <template #cell-status="{ value, row }">
            <div v-if="value === 'ยกเลิก'" class="text-negative">
              {{ $t('finance.receiptSummary.statusCancelled') }}
              <div class="text-caption text-grey-6">
                <div>{{ (row as ReceiptSummaryItem).cancelBy }}</div>
                <div>{{ (row as ReceiptSummaryItem).cancelDate }}</div>
              </div>
            </div>
            <div v-else>{{ $t('finance.receiptSummary.statusActive') }}</div>
          </template>

          <template #cell-printReceipt="{ row }">
            <span v-if="(row as ReceiptSummaryItem).status === 'ยกเลิก'" class="text-grey-6">
              {{ $t('finance.receiptSummary.statusCancelled') }}
            </span>
            <q-btn
              v-else
              flat
              round
              dense
              icon="download"
              color="warning"
              @click="downloadReceipt(row as ReceiptSummaryItem)"
            >
              <q-tooltip>{{ $t('finance.receipts.printReceipt') }}</q-tooltip>
            </q-btn>
          </template>

          <template #cell-customerName="{ row }">
            <div style="white-space: pre-wrap; word-break: break-word">{{ getCustomerDisplayName(row as ReceiptSummaryItem) }}</div>
          </template>

          <template #cell-learnerName="{ row }">
            <div style="white-space: pre-wrap; word-break: break-word">{{ getCustomerDisplayName(row as ReceiptSummaryItem) }}</div>
          </template>

          <template #cell-courseName="{ row }">
            <div style="white-space: pre-wrap; word-break: break-word">
              {{ getCourseDisplayName(row as ReceiptSummaryItem) }}
            </div>
          </template>

          <template #cell-collector="{ row }">
            <div style="white-space: pre-wrap; word-break: break-word">{{ getCollectorDisplay(row as ReceiptSummaryItem) }}</div>
          </template>
        </BaseTable>
      </CentralFinanceSurfaceCard>
    </section>

    <ReceiptCard
      ref="receiptDialogRef"
      v-model="showReceiptDialog"
      :receipt-id="receiptId"
      :issued-at="issuedAt"
      :customer-name="customerName"
      :customer-tax-id="customerTaxId"
      :customer-address="customerAddress"
      :show-customer="true"
      :course-title="courseTitle"
      :course-code="courseCode"
      :amount="amount"
      :is-copy="true"
      :collector-name="collectorName"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { useFacultyList } from 'src/composables/use-faculty-list';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import { useReceiptSummaryReport } from 'src/composables/use-receipt-summary-report';
import type { ApiFaculty } from 'src/types/faculty';
import type { ReceiptSummaryItem } from 'src/types/receipt-summary-report';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceScopeCard from 'components/centralfinance/CentralFinanceScopeCard.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';

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

function getCourseDisplayName(row: ReceiptSummaryItem): string {
  if (locale.value !== 'th' && row.courseNameEn) return row.courseNameEn;
  return row.courseName;
}

function getCustomerDisplayName(row: ReceiptSummaryItem): string {
  if (locale.value !== 'th' && row.customerNameEn) return row.customerNameEn;
  return row.customerName;
}

function getCollectorDisplay(row: ReceiptSummaryItem): string {
  if (locale.value !== 'th' && row.collectorNameEn) {
    const parts = row.collector.split('\n');
    const datePart = parts.slice(1).join('\n');
    return datePart ? `${row.collectorNameEn}\n${datePart}` : row.collectorNameEn;
  }
  return row.collector;
}

const { isLoading: isFacultyLoading, fetchFaculties } = useFacultyList();
const { items, isLoading, filters, fetchData, clearFilters } = useReceiptSummaryReport();

// ── Sticky Filter Bar ────────────────────────────────────────
const filterStuck = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
let stickyObserver: IntersectionObserver | null = null;
const datePreset = ref('allTime');

const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

function formatDateInput(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const receiptDateModel = computed({
  get() {
    if (
      filters.value.receiptDateStart &&
      filters.value.receiptDateEnd &&
      filters.value.receiptDateStart !== filters.value.receiptDateEnd
    ) {
      return { from: filters.value.receiptDateStart, to: filters.value.receiptDateEnd };
    }
    return filters.value.receiptDateStart || null;
  },
  set(val: { from: string; to: string } | string | null) {
    if (val !== null && typeof val === 'object' && 'from' in val && 'to' in val) {
      filters.value.receiptDateStart = val.from;
      filters.value.receiptDateEnd = val.to;
    } else if (typeof val === 'string') {
      filters.value.receiptDateStart = val;
      filters.value.receiptDateEnd = val;
    } else {
      filters.value.receiptDateStart = '';
      filters.value.receiptDateEnd = '';
    }
    datePreset.value = 'custom';
    currentPage.value = 1;
    void fetchData();
  },
});

const receiptDateDisplay = computed(() => {
  if (
    filters.value.receiptDateStart &&
    filters.value.receiptDateEnd &&
    filters.value.receiptDateStart !== filters.value.receiptDateEnd
  ) {
    return `${filters.value.receiptDateStart} - ${filters.value.receiptDateEnd}`;
  }
  return filters.value.receiptDateStart || '';
});

const effectiveDateModel = computed({
  get() {
    if (
      filters.value.effectiveDateStart &&
      filters.value.effectiveDateEnd &&
      filters.value.effectiveDateStart !== filters.value.effectiveDateEnd
    ) {
      return { from: filters.value.effectiveDateStart, to: filters.value.effectiveDateEnd };
    }
    return filters.value.effectiveDateStart || null;
  },
  set(val: { from: string; to: string } | string | null) {
    if (val !== null && typeof val === 'object' && 'from' in val && 'to' in val) {
      filters.value.effectiveDateStart = val.from;
      filters.value.effectiveDateEnd = val.to;
    } else if (typeof val === 'string') {
      filters.value.effectiveDateStart = val;
      filters.value.effectiveDateEnd = val;
    } else {
      filters.value.effectiveDateStart = '';
      filters.value.effectiveDateEnd = '';
    }
    datePreset.value = 'custom';
    currentPage.value = 1;
    void fetchData();
  },
});

const effectiveDateDisplay = computed(() => {
  if (
    filters.value.effectiveDateStart &&
    filters.value.effectiveDateEnd &&
    filters.value.effectiveDateStart !== filters.value.effectiveDateEnd
  ) {
    return `${filters.value.effectiveDateStart} - ${filters.value.effectiveDateEnd}`;
  }
  return filters.value.effectiveDateStart || '';
});

function applyDatePreset(preset: string) {
  datePreset.value = preset;
  const now = new Date();
  let start = '';
  let end = '';
  if (preset === 'today') {
    start = end = formatDateInput(now);
  } else if (preset === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    start = formatDateInput(startOfWeek);
    end = formatDateInput(now);
  } else if (preset === 'thisMonth') {
    start = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    end = formatDateInput(now);
  } else if (preset === 'thisYear') {
    start = formatDateInput(new Date(now.getFullYear(), 0, 1));
    end = formatDateInput(now);
  }
  if (preset !== 'custom') {
    filters.value.receiptDateStart = start;
    filters.value.receiptDateEnd = end;
    filters.value.effectiveDateStart = '';
    filters.value.effectiveDateEnd = '';
    currentPage.value = 1;
    void fetchData();
  }
}

function clearDates() {
  datePreset.value = 'allTime';
  clearFilters();
  search.value = '';
  currentPage.value = 1;
  void fetchData();
}

function onFacultyChange(): void {
  currentPage.value = 1;
  void fetchData();
}

const todayStr = date.formatDate(new Date(), 'DDMMYYYY');

const pdfExportConfig = computed<PdfExportConfig | null>(() => {
  if (items.value.length === 0) return null;
  return {
    filename: `central-finance-receipt-summary_${todayStr}`,
    orientation: 'landscape',
    titles: [
      t('centralFinance.receiptSummary.reportTitle'),
      `${t('centralFinance.receiptSummary.filters.faculty')}: ${activeFacultyScopeLabel.value}`,
    ],
    titleStartY: 35,
    titleLineHeight: 15,
    startY: 65,
    head: [
      [
        t('centralFinance.receiptSummary.export.no'),
        t('centralFinance.receiptSummary.export.faculty'),
        t('centralFinance.receiptSummary.export.receiptNo'),
        t('centralFinance.receiptSummary.export.customerName'),
        t('centralFinance.receiptSummary.export.amount'),
        t('centralFinance.receiptSummary.export.effectiveDate'),
        t('centralFinance.receiptSummary.export.learnerName'),
        t('centralFinance.receiptSummary.export.courseName'),
        t('centralFinance.receiptSummary.export.collector'),
        t('centralFinance.receiptSummary.export.status'),
      ],
    ],
    body: items.value.map((row) => [
      row.no,
      translateFaculty(row.faculty ?? ''),
      row.receiptNo,
      getCustomerDisplayName(row) ?? '',
      row.amount,
      row.effectiveDate,
      getCustomerDisplayName(row) ?? '',
      getCourseDisplayName(row).replace(/\n/g, ' '),
      getCollectorDisplay(row).replace(/\n/g, ' '),
      row.status === 'ยกเลิก'
        ? `${t('centralFinance.receiptSummary.export.statusCancelled')} ${row.cancelBy ?? ''} ${(row.cancelDate ?? '').replace('\n', ' ')}`
        : t('centralFinance.receiptSummary.export.statusActive'),
    ]),
    styles: { fontSize: 7, cellPadding: 3, valign: 'top' },
    headStyles: { fontSize: 7 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 24 },
      1: { cellWidth: 80 },
      2: { halign: 'center', cellWidth: 75 },
      3: { cellWidth: 90 },
      4: { halign: 'center', cellWidth: 48 },
      5: { halign: 'center', cellWidth: 68 },
      6: { cellWidth: 90 },
      7: { cellWidth: 130 },
      8: { halign: 'center', cellWidth: 100 },
      9: { halign: 'center', cellWidth: 75 },
    },
  };
});

const csvExportConfig = computed<CsvExportConfig | null>(() => {
  if (items.value.length === 0) return null;
  return {
    filename: `central-finance-receipt-summary_${todayStr}.csv`,
    headers: [
      t('centralFinance.receiptSummary.export.no'),
      t('centralFinance.receiptSummary.export.faculty'),
      t('centralFinance.receiptSummary.export.receiptNo'),
      t('centralFinance.receiptSummary.export.customerName'),
      t('centralFinance.receiptSummary.export.amount'),
      t('centralFinance.receiptSummary.export.effectiveDate'),
      t('centralFinance.receiptSummary.export.learnerName'),
      t('centralFinance.receiptSummary.export.courseName'),
      t('centralFinance.receiptSummary.export.collector'),
      t('centralFinance.receiptSummary.export.status'),
    ],
    data: items.value.map((row) => [
      row.no,
      translateFaculty(row.faculty ?? ''),
      row.receiptNo,
      getCustomerDisplayName(row) ?? '',
      row.amount,
      row.effectiveDate,
      getCustomerDisplayName(row) ?? '',
      getCourseDisplayName(row).replace(/\n/g, ' '),
      getCollectorDisplay(row).replace(/\n/g, ' '),
      row.status === 'ยกเลิก'
        ? `${t('centralFinance.receiptSummary.export.statusCancelled')} ${row.cancelBy ?? ''} ${(row.cancelDate ?? '').replace('\n', ' ')}`
        : t('centralFinance.receiptSummary.export.statusActive'),
    ]),
  };
});

const faculties = ref<ApiFaculty[]>([]);
const search = ref('');
const showReceiptDialog = ref(false);
const selectedReceipt = ref<ReceiptSummaryItem | null>(null);
const receiptDialogRef = ref<InstanceType<typeof ReceiptCard> | null>(null);

const currentPage = ref(1);
const rowsPerPage = ref(10);

const facultyOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' },
  ...faculties.value.map((f) => ({ label: f.name ?? '', value: f.name ?? '' })),
]);

const activeFacultyScopeLabel = computed<string>(() => {
  if (!filters.value.faculty) return t('centralFinance.receiptSummary.allFaculties');
  const option = facultyOptions.value.find((o) => o.value === filters.value.faculty);
  return option?.label ?? filters.value.faculty;
});

// Computed props for ReceiptCard dialog
const receiptId = computed<string>(() => selectedReceipt.value?.receiptNo ?? '');
const issuedAt = computed<Date | null>(() => {
  const dateStr = selectedReceipt.value?.effectiveDate;
  if (!dateStr || dateStr === '-') return null;
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
});
const customerName = computed<string>(() => selectedReceipt.value?.customerName ?? '');
const customerTaxId = computed<string>(() => '0994000249357');
const customerAddress = computed<string>(
  () => '169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131',
);
const courseCode = computed<string>(() => selectedReceipt.value?.courseName.split(':')[0] ?? '');
const courseTitle = computed<string>(() => {
  if (!selectedReceipt.value) return '';
  const parts = selectedReceipt.value.courseName.split(':');
  return parts.slice(1).join(':').replace(/\n/g, ' ') || selectedReceipt.value.courseName;
});
const amount = computed<number>(() => {
  const val = selectedReceipt.value?.amount;
  return typeof val === 'number' ? val : 0;
});
const collectorName = computed<string>(() => {
  if (!selectedReceipt.value?.collector) return '';
  const lines = selectedReceipt.value.collector.split('\n');
  return lines[0]?.trim() || '';
});

const columns = computed<BaseTableColumn[]>(() => [
  { key: 'no', label: t('finance.receiptSummary.columns.no'), align: 'center', sortable: true },
  {
    key: 'faculty',
    label: t('centralFinance.receiptSummary.columns.faculty'),
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
    key: 'customerName',
    label: t('finance.receiptSummary.columns.fullName'),
    align: 'center',
    sortable: true,
    width: '220px',
  },
  {
    key: 'amount',
    label: t('finance.receiptSummary.columns.amount'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'effectiveDate',
    label: t('finance.receiptSummary.columns.effectiveDate'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'learnerName',
    label: t('finance.receiptSummary.columns.learnerName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'courseName',
    label: t('finance.receiptSummary.columns.courseName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'collector',
    label: t('finance.receiptSummary.columns.collector'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'status',
    label: t('finance.receiptSummary.columns.status'),
    align: 'center',
    sortable: true,
  },
  { key: 'printReceipt', label: t('finance.receiptSummary.columns.actions'), align: 'center' },
]);

const filteredItems = computed(() => {
  if (!search.value) return items.value;
  const q = search.value.toLowerCase();
  return items.value.filter((row) =>
    [
      row.faculty ?? '',
      row.receiptNo,
      row.customerName ?? '',
      row.learnerName ?? '',
      row.courseName ?? '',
    ].some((v) => v.toLowerCase().includes(q)),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / rowsPerPage.value)),
);

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return filteredItems.value.slice(start, start + rowsPerPage.value);
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

async function downloadReceipt(row: ReceiptSummaryItem): Promise<void> {
  selectedReceipt.value = row;
  await nextTick();
  receiptDialogRef.value?.downloadReceiptPdf();
}

onMounted(async () => {
  if (sentinelRef.value) {
    stickyObserver = new IntersectionObserver(
      ([entry]) => {
        filterStuck.value = !(entry?.isIntersecting ?? true);
      },
      { threshold: 0, rootMargin: '-73px 0px 0px 0px' },
    );
    stickyObserver.observe(sentinelRef.value);
  }
  faculties.value = await fetchFaculties();
  await fetchData();
});

onUnmounted(() => {
  stickyObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
// ─── Sticky Filter Bar ───────────────────────────────────────
.period-filter-sentinel {
  height: 1px;
}

.period-filter-bar {
  position: sticky;
  top: 80px;
  z-index: 9;
  margin-bottom: 16px;
  border-radius: var(--admin-radius-lg, 16px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px) saturate(1.8);
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
  border: 1px solid rgba(17, 24, 39, 0.08);
  transition: box-shadow 0.2s ease;
  overflow: clip;

  &--stuck {
    box-shadow:
      0 6px 28px rgba(17, 24, 39, 0.1),
      0 1px 4px rgba(17, 24, 39, 0.05);
  }
}

.period-filter-bar__row1,
.period-filter-bar__row2 {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.period-filter-bar__row1 {
  padding: 8px 8px 4px;
  min-height: 52px;
}

.period-filter-bar__row2 {
  padding: 4px 8px 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
}

.period-filter-bar__label,
.period-filter-bar__sub-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--admin-navy, #10233f);
  padding-left: 8px;
  white-space: nowrap;
}

.period-filter-bar__sub-label {
  font-size: 0.76rem;
  color: #64748b;
}

.period-filter-bar__item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: 10px;
  min-height: 40px;
  padding: 0 14px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 700;
  color: var(--admin-muted, #64748b);
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primary, 0.04);
    color: var(--admin-navy, #10233f);
  }

  &--active {
    background: rgba($primary, 0.08) !important;
    box-shadow: inset 4px 0 0 $primary;
    color: var(--admin-navy, #10233f);
  }
}

.period-filter-bar__divider {
  width: 1px;
  height: 24px;
  background: rgba(17, 24, 39, 0.08);
  margin: 0 10px;
  flex: 0 0 auto;
}

.period-filter-bar__input {
  width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &--range {
    width: 220px;
  }

  &:focus-within {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
  }
}

// ─── Filter ───────────────────────────────────────────────────
.filter-faculty-wrap {
  margin-left: 4px;
  flex-shrink: 0;
}

// ─── Table ────────────────────────────────────────────────────
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

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
