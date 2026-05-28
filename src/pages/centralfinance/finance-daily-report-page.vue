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
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
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
                          color="warning"
                          text-color="black"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ถึงวันที่ -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
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
                          color="warning"
                          text-color="black"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ส่วนงาน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
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
                  :disable="!isCentralFinanceRole"
                />
              </div>
            </div>

            <!-- ชื่อโครงการ/อบรม/หลักสูตร -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
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
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('centralFinance.dailyReport.filters.searchBtn')"
                  unelevated
                  class="q-px-xl"
                  @click="onSearch"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('centralFinance.dailyReport.filters.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <CentralFinanceSurfaceCard v-if="hasSearched" class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <q-btn
            outline
            color="negative"
            icon="picture_as_pdf"
            :label="$t('centralFinance.dailyReport.table.pdfBtn')"
            class="q-mr-sm"
            @click="exportToPdf"
          />
          <q-btn
            outline
            color="positive"
            icon="table_chart"
            :label="$t('centralFinance.dailyReport.table.excelBtn')"
            @click="exportToExcel"
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

        <div class="row justify-end items-center q-px-md q-pb-md">
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

        <q-table
          :rows="tableRows"
          :columns="columns"
          row-key="id"
          flat
          dense
          :filter="search"
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
            <div class="row full-width justify-between items-center q-py-sm">
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
                    Math.min(scope.pagination.page * scope.pagination.rowsPerPage, tableRows.length)
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
      </CentralFinanceSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import { useAuthStore } from 'stores/auth-store';
import type { Transaction } from 'src/stores/central-finance-store';
import type { QTableColumn } from 'quasar';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

const $q = useQuasar();
const { t } = useI18n();
const authStore = useAuthStore();
const financeStore = useCentralFinanceStore();
const search = ref('');

const isCentralFinanceRole = computed(() => authStore.user?.role === 'central_finance');
const currentUserDepartment = computed(
  () => authStore.user?.facName ?? authStore.user?.faculty ?? '',
);
const hasSearched = ref(false);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// ตัวกรองข้อมูล
const filters = ref({
  receiptDateStart: '27/05/2569',
  receiptDateEnd: '30/05/2569',
  department: isCentralFinanceRole.value ? 'สำนักคอมพิวเตอร์' : currentUserDepartment.value,
  courseName: '',
});

watchEffect(() => {
  if (!isCentralFinanceRole.value && currentUserDepartment.value) {
    filters.value.department = currentUserDepartment.value;
  }
});

// เก็บสถานะฟิลเตอร์หลังจากกดค้นหาเพื่อให้แสดงใน Title ของตารางได้อย่างถูกต้อง
const activeFilters = ref({
  receiptDateStart: '27/05/2569',
  receiptDateEnd: '30/05/2569',
  department: filters.value.department,
  courseName: '',
});

// รายการส่วนงานทั้งหมดแบบแปลภาษาได้
const departmentOptions = computed(() => [
  { label: t('centralFinance.dailyReport.departments.computerCenter'), value: 'สำนักคอมพิวเตอร์' },
  { label: t('centralFinance.dailyReport.departments.informatics'), value: 'คณะวิทยาการสารสนเทศ' },
  { label: t('centralFinance.dailyReport.departments.science'), value: 'คณะวิทยาศาสตร์' },
  { label: t('centralFinance.dailyReport.departments.nursing'), value: 'คณะพยาบาลศาสตร์' },
  { label: t('centralFinance.dailyReport.departments.business'), value: 'คณะบริหารธุรกิจ' },
  { label: t('centralFinance.dailyReport.departments.engineering'), value: 'คณะวิศวกรรมศาสตร์' },
]);

// ดึงฉลากส่วนงานที่เลือกตามภาษาปัจจุบัน
function getDepartmentLabel(val: string): string {
  if (!val) return '-';
  const option = departmentOptions.value.find((opt) => opt.value === val);
  return option ? option.label : val;
}

function getCourseNameForTx(tx: Transaction): string {
  if (tx.faculty === 'สำนักคอมพิวเตอร์')
    return 'C67052002: การพัฒนาเว็บแอปพลิเคชัน สำนักคอมพิวเตอร์';
  else if (tx.faculty === 'คณะวิทยาการสารสนเทศ')
    return 'C66061004: Digital Product Design คณะวิทยาการสารสนเทศ';
  else if (tx.faculty === 'คณะวิทยาศาสตร์')
    return 'C65091001: วิทยาศาสตร์ข้อมูลเบื้องต้น คณะวิทยาศาสตร์';
  else if (tx.faculty === 'คณะพยาบาลศาสตร์')
    return 'C65082001: การดูแลผู้สูงอายุเบื้องต้น คณะพยาบาลศาสตร์';
  else if (tx.faculty === 'คณะบริหารธุรกิจ')
    return 'C66021005: การตลาดดิจิทัลยุคใหม่ คณะบริหารธุรกิจ';
  else if (tx.faculty === 'คณะวิศวกรรมศาสตร์')
    return 'C66031002: ปัญญาประดิษฐ์ในอุตสาหกรรม คณะวิศวกรรมศาสตร์';
  return 'C66099999: หลักสูตรระยะสั้นเพื่อการเรียนรู้ตลอดชีวิต';
}

function getFundName(fundCode: string): string {
  const source = financeStore.fundSources.find((s) => s.fundCode === fundCode);
  if (source) return `${fundCode}: ${source.nameTh}`;
  if (fundCode.startsWith('BG')) return `${fundCode}: เงินงบประมาณแดิน`;
  else if (fundCode.startsWith('RV')) return `${fundCode}: เงินรายได้มหาวิทยาลัย`;
  else if (fundCode.startsWith('DN')) return `${fundCode}: เงินบริจาคเพื่อการศึกษา`;
  else if (fundCode.startsWith('OT')) return `${fundCode}: เงินกองทุนพัฒนาวิชาการ`;
  return fundCode;
}

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter((tx) => {
    // 1. กรองตามส่วนงาน
    if (activeFilters.value.department) {
      if (tx.faculty !== activeFilters.value.department) {
        return false;
      }
    }

    // 2. กรองตามชื่อหลักสูตร/อบรม
    if (activeFilters.value.courseName) {
      const course = getCourseNameForTx(tx);
      if (!course.toLowerCase().includes(activeFilters.value.courseName.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
});

const tableRows = computed(() => {
  return filteredTransactions.value.map((tx, index) => ({
    id: tx.id,
    no: index + 1,
    courseName: getCourseNameForTx(tx),
    fundCode: getFundName(tx.fundCode),
    amount: tx.amount,
  }));
});

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
    align: 'left',
    sortable: true,
    style: 'white-space: pre-wrap; word-break: break-word;',
  },
  {
    name: 'fundCode',
    label: t('centralFinance.dailyReport.table.fundCode'),
    field: 'fundCode',
    align: 'left',
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

  activeFilters.value = {
    receiptDateStart: filters.value.receiptDateStart,
    receiptDateEnd: filters.value.receiptDateEnd,
    department: filters.value.department,
    courseName: filters.value.courseName,
  };

  hasSearched.value = true;
}

function clearFilters(): void {
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.department = isCentralFinanceRole.value
    ? 'สำนักคอมพิวเตอร์'
    : currentUserDepartment.value;
  filters.value.courseName = '';

  activeFilters.value = {
    receiptDateStart: '',
    receiptDateEnd: '',
    department: filters.value.department,
    courseName: '',
  };

  hasSearched.value = false;
}

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
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')}: ${getDepartmentLabel(activeFilters.value.department)}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: activeFilters.value.receiptDateStart,
    end: activeFilters.value.receiptDateEnd,
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
  const title2 = `${t('centralFinance.dailyReport.table.departmentLabel')} ${getDepartmentLabel(activeFilters.value.department)}`;
  const title3 = t('centralFinance.dailyReport.table.dateLabel', {
    start: activeFilters.value.receiptDateStart,
    end: activeFilters.value.receiptDateEnd,
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
.report-search {
  width: 250px;
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

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
