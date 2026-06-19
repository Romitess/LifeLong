<template>
  <q-page class="finance-page finance-receipt-usage-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt"
      :title="$t('centralFinance.receiptUsage.hero.title')"
      :description="$t('centralFinance.receiptUsage.hero.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('centralFinance.receiptSummary.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">{{ activeFacultyScopeLabel }}</div>
        </div>
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- Filter Card -->
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <!-- ปีงบประมาณ -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.fiscalYear') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.fiscalYear"
                  :options="fiscalYearOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                />
              </div>
            </div>

            <!-- วันที่ใบเสร็จรับเงิน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.receiptDate') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.receiptDateStart"
                  outlined
                  dense
                  placeholder="วว/ดด/ปปปป"
                  mask="##/##/####"
                  class="bg-white"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="grey-7">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.receiptDateStart"
                          mask="DD/MM/YYYY"
                          color="primary"
                          text-color="white"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ถึงวันที่ -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.toDate') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.receiptDateEnd"
                  outlined
                  dense
                  placeholder="วว/ดด/ปปปป"
                  mask="##/##/####"
                  class="bg-white"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="grey-7">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.receiptDateEnd"
                          mask="DD/MM/YYYY"
                          color="primary"
                          text-color="white"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ส่วนงาน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptSummary.filters.faculty') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.faculty"
                  :options="facultyOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                />
              </div>
            </div>

            <!-- ชื่อโครงการ/อบรม/หลักสูตร -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.courseName') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.courseName"
                  outlined
                  dense
                  class="bg-white"
                  :placeholder="$t('centralFinance.receiptUsage.filters.courseNamePlaceholder')"
                />
              </div>
            </div>

            <!-- ชื่อผู้ชำระเงิน (Customer Name) -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.customerName') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.customerName"
                  outlined
                  dense
                  class="bg-white"
                  :placeholder="$t('centralFinance.receiptUsage.filters.customerNamePlaceholder')"
                />
              </div>
            </div>

            <!-- ผู้รับเงิน (Collector) -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.collector') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.collector"
                  outlined
                  dense
                  class="bg-white"
                  :placeholder="$t('centralFinance.receiptUsage.filters.collectorPlaceholder')"
                />
              </div>
            </div>

            <!-- เลขที่ใบเสร็จรับเงิน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.receiptNo') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.receiptNo"
                  outlined
                  dense
                  class="bg-white"
                  :placeholder="$t('centralFinance.receiptUsage.filters.receiptNoPlaceholder')"
                />
              </div>
            </div>

            <!-- สถานะ -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.receiptUsage.filters.status') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.status"
                  :options="statusOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                />
              </div>
            </div>

            <div class="row items-center">
              <div class="col-sm-4 gt-xs" />
              <div class="col-12 col-sm-8 filter-section__actions">
                <AppActionButton
                  variant="primary"
                  icon="search"
                  :label="$t('centralFinance.receiptUsage.filters.searchBtn')"
                  :loading="isLoading"
                  @click="onSearch"
                />
                <AppActionButton
                  variant="secondary"
                  icon="restart_alt"
                  :label="$t('centralFinance.receiptUsage.filters.clearBtn')"
                  :disable="isLoading"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <!-- Table Card -->
      <CentralFinanceSurfaceCard v-if="hasSearched" class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <ReportExportActions
            :pdf-label="$t('finance.receiptSummary.exportPdf')"
            :excel-label="$t('finance.receiptSummary.exportExcel')"
            @export-pdf="exportToPdf"
            @export-excel="exportToExcel"
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
          <q-input
            v-model="search"
            dense
            outlined
            :placeholder="$t('finance.receiptSummary.searchLabel')"
            class="receipt-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <BaseTable
          :columns="columns"
          :rows="pagedRows"
          :page="currentPage"
          :total-pages="totalPages"
          :rows-per-page="rowsPerPage"
          show-rows-per-page
          :rows-per-page-options="[10, 25, 50, 100]"
          :on-page-change="onPageChange"
          :on-rows-per-page-change="onRowsPerPageChange"
          min-width="900px"
        >
          <template #cell-cancelDoc="{ row }">
            <div v-if="(row as ReceiptUsageItem).status === 'ยกเลิก'" class="text-negative">
              {{ $t('finance.receiptSummary.statusCancelled') }}
              <div class="text-caption text-grey-6">
                <div>{{ (row as ReceiptUsageItem).cancelBy }}</div>
                <div>{{ (row as ReceiptUsageItem).cancelDate }}</div>
              </div>
            </div>
          </template>

          <template #cell-courseName="{ value }">
            <div style="white-space: pre-wrap; word-break: break-word">{{ value }}</div>
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
import { useQuasar } from 'quasar';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import ReportExportActions from 'components/common/ReportExportActions.vue';
import { useReceiptUsageReport } from 'src/composables/use-receipt-usage-report';
import type { ReceiptUsageItem } from 'src/types/receipt-usage-report';
import jsPDF from 'jspdf';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

const { t } = useI18n();
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

onMounted(() => {
  void fetchFacultyOptions();
});

const search = ref('');
const hasSearched = ref(false);

const currentPage = ref(1);
const rowsPerPage = ref(10);

const currentYear = new Date().getFullYear();

const fiscalYearOptions = computed(() => [
  { label: '---- เลือก ----', value: '' },
  ...Array.from({ length: 5 }, (_, i) => {
    const year = currentYear - i;
    return { label: String(year), value: String(year) };
  }),
]);

const facultyOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' },
  ...apiFacultyOptions.value.map((f) => ({ label: f.name, value: f.name })),
]);

const statusOptions = computed(() => [
  { label: t('centralFinance.receiptUsage.filters.statusAll'), value: '' },
  { label: t('finance.receiptSummary.statusActive'), value: 'Y' },
  { label: t('finance.receiptSummary.statusCancelled'), value: 'C' },
]);

const activeFacultyScopeLabel = computed<string>(() => {
  if (!filters.value.faculty) return t('centralFinance.receiptSummary.allFaculties');
  const option = facultyOptions.value.find((o) => o.value === filters.value.faculty);
  return option?.label ?? filters.value.faculty;
});

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
    width: '220px',
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

async function onSearch(): Promise<void> {
  hasSearched.value = true;
  currentPage.value = 1;
  await fetchData();
}

async function clearFilters(): Promise<void> {
  clearComposableFilters();
  search.value = '';
  currentPage.value = 1;
  if (hasSearched.value) {
    await fetchData();
  }
}

async function loadSarabunFont(): Promise<string> {
  const response = await fetch(SarabunFontUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] ?? '');
    };
    reader.readAsDataURL(blob);
  });
}

async function exportToPdf(): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const base64Font = await loadSarabunFont();
  doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
  doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');

  doc.setFontSize(13);
  const title = t('centralFinance.receiptUsage.reportTitle');
  const subtitle = `${t('centralFinance.receiptSummary.filters.faculty')}: ${activeFacultyScopeLabel.value}`;
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
  doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

  const rows = filteredRows.value.map((row) => [
    row.no,
    row.departmentCode,
    row.faculty,
    row.receiptNo,
    row.status === 'ยกเลิก' ? `ยกเลิก\n${row.cancelBy ?? ''}\n${row.cancelDate ?? ''}` : '',
    row.effectiveDate,
    row.fiscalYear,
    row.amount,
    row.courseName,
    row.customerName,
    row.collector,
  ]);

  autoTable(doc, {
    startY: 65,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    head: [
      [
        'ลำดับ',
        'รหัส\nหน่วยงาน',
        'ชื่อหน่วยงาน',
        'เลขที่ใบเสร็จ\nรับเงิน',
        'ยกเลิกเอกสาร',
        'วันที่ใบเสร็จ\nรับเงิน',
        'ปีเอกสาร',
        'จำนวนเงิน',
        'ชื่อโครงการ/อบรม/หลักสูตร',
        'ชื่อผู้ชำระเงิน',
        'ชื่อผู้รับเงิน',
      ],
    ],
    body: rows,
    styles: {
      font: 'Sarabun',
      fontSize: 7,
      cellPadding: 3,
      valign: 'top',
      lineColor: [180, 180, 180],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'Sarabun',
      fillColor: [226, 232, 240],
      textColor: [51, 65, 85],
      fontStyle: 'normal',
      fontSize: 7,
      halign: 'center',
      valign: 'middle',
    },
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
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell(data: CellHookData) {
      if (data.section === 'body' && data.column.index === 4) {
        const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
        if (val.startsWith('ยกเลิก')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { top: 20, left: 15, right: 15 },
    tableWidth: 'auto',
  });

  doc.save('central-finance-receipt-usage.pdf');
}

function exportToExcel(): void {
  const header = [
    'ลำดับ',
    'รหัสหน่วยงาน',
    'ชื่อหน่วยงาน',
    'เลขที่ใบเสร็จรับเงิน',
    'ยกเลิกเอกสาร',
    'วันที่ใบเสร็จรับเงิน',
    'ปีเอกสาร',
    'จำนวนเงิน',
    'ชื่อโครงการ/อบรม/หลักสูตร',
    'ชื่อผู้ชำระเงิน',
    'ชื่อผู้รับเงิน',
  ];

  const rows = filteredRows.value.map((row) => [
    row.no,
    row.departmentCode,
    row.faculty,
    row.receiptNo,
    row.status === 'ยกเลิก' ? `ยกเลิก | ${row.cancelBy ?? ''} | ${row.cancelDate ?? ''}` : '',
    row.effectiveDate,
    row.fiscalYear,
    row.amount,
    row.courseName,
    row.customerName,
    row.collector,
  ]);

  const title = t('centralFinance.receiptUsage.reportTitle');
  const wsData = [[title], [], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 10 } }];
  ws['!cols'] = [
    { wch: 7 },
    { wch: 14 },
    { wch: 25 },
    { wch: 20 },
    { wch: 30 },
    { wch: 20 },
    { wch: 10 },
    { wch: 12 },
    { wch: 45 },
    { wch: 25 },
    { wch: 25 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
  XLSX.writeFile(wb, 'central-finance-receipt-usage.xlsx');
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

:deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
}
</style>
