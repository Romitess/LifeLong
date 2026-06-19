<template>
  <q-page class="finance-page finance-daily-report-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    />

    <section class="finance-shell finance-content">
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <!-- วันที่ใบเสร็จรับเงิน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.dailyReport.filters.receiptDate') }}
                <span class="text-negative">*</span>
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
                {{ $t('centralFinance.dailyReport.filters.toDate') }}
                <span class="text-negative">*</span>
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
                {{ $t('centralFinance.dailyReport.filters.department') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.department"
                  :options="departmentOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                  :loading="isFacultyLoading"
                />
              </div>
            </div>

            <!-- ชื่อโครงการ/อบรม/หลักสูตร -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
                {{ $t('centralFinance.dailyReport.filters.courseName') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.courseName"
                  outlined
                  dense
                  class="bg-white"
                  :placeholder="$t('centralFinance.dailyReport.filters.coursePlaceholder')"
                />
              </div>
            </div>

            <div class="row items-center">
              <div class="col-sm-4 gt-xs"></div>
              <div class="col-12 col-sm-8 filter-section__actions">
                <AppActionButton
                  variant="primary"
                  icon="search"
                  :label="$t('centralFinance.dailyReport.filters.searchBtn')"
                  @click="onSearch"
                />
                <AppActionButton
                  variant="secondary"
                  icon="restart_alt"
                  :label="$t('centralFinance.dailyReport.filters.clearBtn')"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <CentralFinanceSurfaceCard v-if="hasSearched" class="q-mt-md" card-class="q-pa-none">
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
            {{ getDepartmentLabel(activeFilters.department) }}
          </div>
          <div class="text-weight-medium text-caption text-grey-8">
            {{
              $t('centralFinance.dailyReport.table.dateLabel', {
                start: activeFilters.receiptDateStart || '-',
                end: activeFilters.receiptDateEnd || '-',
              })
            }}
          </div>
        </div>

        <div class="row justify-end items-center q-px-md q-pb-md report-search-bar">
          <q-input
            v-model="search"
            dense
            outlined
            :placeholder="$t('centralFinance.dailyReport.table.searchLabel')"
            class="report-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
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
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import ReportExportActions from 'components/common/ReportExportActions.vue';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import { api } from 'src/boot/axios';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

const $q = useQuasar();
const { t } = useI18n();
const search = ref('');
const hasSearched = ref(false);
const isLoading = ref(false);
const isFacultyLoading = ref(false);

const currentPage = ref(1);
const rowsPerPage = ref(25);

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

const filters = ref({
  receiptDateStart: '',
  receiptDateEnd: '',
  department: '',
  courseName: '',
});

const activeFilters = ref({
  receiptDateStart: '',
  receiptDateEnd: '',
  department: '',
  courseName: '',
});

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
    // ใช้ค่า default "ทั้งหมด" เมื่อโหลดไม่ได้
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
    const params: Record<string, string> = {
      receiptDateStart: activeFilters.value.receiptDateStart,
      receiptDateEnd: activeFilters.value.receiptDateEnd,
    };
    if (activeFilters.value.department) params.facName = activeFilters.value.department;
    if (activeFilters.value.courseName) params.courseName = activeFilters.value.courseName;

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

function onSearch(): void {
  if (!filters.value.receiptDateStart || !filters.value.receiptDateEnd) {
    $q.notify({
      type: 'warning',
      message: t('centralFinance.dailyReport.filters.dateRequired'),
      position: 'top',
      icon: 'warning',
    });
    return;
  }
  activeFilters.value = { ...filters.value };
  hasSearched.value = true;
  currentPage.value = 1;
  void fetchData();
}

function clearFilters(): void {
  filters.value = { receiptDateStart: '', receiptDateEnd: '', department: '', courseName: '' };
  activeFilters.value = {
    receiptDateStart: '',
    receiptDateEnd: '',
    department: '',
    courseName: '',
  };
  tableRows.value = [];
  hasSearched.value = false;
  search.value = '';
  currentPage.value = 1;
}

onMounted(() => {
  void fetchFacultyOptions();
});

// ── Helpers ──────────────────────────────────────────────────
function formatCurrency(val: number): string {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

// ── Export ───────────────────────────────────────────────────
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

  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(t('centralFinance.dailyReport.table.reportTitle'), pageWidth / 2, 35, {
    align: 'center',
  });
  doc.text(
    `${t('centralFinance.dailyReport.table.departmentLabel')}: ${getDepartmentLabel(activeFilters.value.department)}`,
    pageWidth / 2,
    50,
    { align: 'center' },
  );
  doc.text(
    t('centralFinance.dailyReport.table.dateLabel', {
      start: activeFilters.value.receiptDateStart,
      end: activeFilters.value.receiptDateEnd,
    }),
    pageWidth / 2,
    65,
    { align: 'center' },
  );

  const rows = tableRows.value.map((row) => [
    row.no,
    row.faculty,
    row.courseName,
    row.fundCode ?? '-',
    row.receiptDate ?? '-',
    row.receiptStatus,
    formatCurrency(row.amount),
  ]);

  autoTable(doc, {
    startY: 80,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
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
    body: rows,
    styles: {
      font: 'Sarabun',
      fontSize: 8,
      cellPadding: 4,
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
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 },
      1: { cellWidth: 100 },
      2: { cellWidth: 240 },
      3: { cellWidth: 140 },
      4: { halign: 'center', cellWidth: 70 },
      5: { halign: 'center', cellWidth: 55 },
      6: { halign: 'right', cellWidth: 70 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { top: 20, left: 15, right: 15 },
    tableWidth: 'auto',
  });

  doc.save('central-finance-daily-report.pdf');
}

function exportToExcel(): void {
  const header = [
    'ลำดับ',
    'คณะ/ส่วนงาน',
    'ชื่อโครงการ/หลักสูตร',
    'แหล่งเงิน',
    'วันที่รับเงิน',
    'สถานะ',
    'จำนวนเงิน',
  ];

  const rows = tableRows.value.map((row) => [
    row.no,
    row.faculty,
    row.courseName.replace(/\n/g, ' '),
    (row.fundCode ?? '-').replace(/\n/g, ' '),
    row.receiptDate ?? '-',
    row.receiptStatus,
    row.amount,
  ]);

  const title1 = t('centralFinance.dailyReport.table.reportTitle');
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')} ${getDepartmentLabel(activeFilters.value.department)}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: activeFilters.value.receiptDateStart,
    end: activeFilters.value.receiptDateEnd,
  });

  const wsData = [[title1], [title2], [title3], [], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
  ];
  ws['!cols'] = [
    { wch: 7 },
    { wch: 22 },
    { wch: 50 },
    { wch: 35 },
    { wch: 14 },
    { wch: 10 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
  XLSX.writeFile(wb, 'central-finance-daily-report.xlsx');
}
</script>

<style lang="scss" scoped>
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

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
