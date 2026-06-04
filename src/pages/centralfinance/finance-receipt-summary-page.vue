<template>
  <q-page class="finance-page finance-receipt-summary-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.receiptSummary.hero.title')"
      :description="$t('centralFinance.receiptSummary.hero.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('centralFinance.receiptSummary.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">
            {{ activeFacultyScopeLabel }}
          </div>
        </div>
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- Filter Card -->
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <!-- ส่วนงาน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('centralFinance.receiptSummary.filters.faculty') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.faculty"
                  :options="facultyOptions"
                  :loading="isFacultyLoading"
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
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.filters.receiptDate') }}
              </div>
              <div class="col-12 col-sm-8 row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.receiptDateStart"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.start')"
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
                <div class="col-6">
                  <q-input
                    v-model="filters.receiptDateEnd"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.end')"
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
            </div>

            <!-- วันที่ชำระเงินค่าลงทะเบียน (Effective Date) -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.filters.effectiveDate') }}
              </div>
              <div class="col-12 col-sm-8 row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.effectiveDateStart"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.start')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.effectiveDateStart"
                            mask="DD/MM/YYYY"
                            color="warning"
                            text-color="black"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-6">
                  <q-input
                    v-model="filters.effectiveDateEnd"
                    outlined
                    dense
                    :label="$t('finance.receiptSummary.filters.end')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.effectiveDateEnd"
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
            </div>

            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md" />
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('finance.receiptSummary.filters.searchBtn')"
                  unelevated
                  class="q-px-xl"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('finance.receiptSummary.filters.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <!-- Table Card -->
      <CentralFinanceSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <q-btn
            outline
            color="negative"
            icon="picture_as_pdf"
            :label="$t('finance.receiptSummary.exportPdf')"
            class="q-mr-sm"
            @click="exportToPdf"
          />
          <q-btn
            outline
            color="positive"
            icon="table_chart"
            :label="$t('finance.receiptSummary.exportExcel')"
            @click="exportToExcel"
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

        <div class="row justify-end items-center q-px-md q-pb-md">
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

        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          flat
          dense
          :filter="search"
          class="receipt-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
        >
          <template v-slot:body-cell-status="slotProps">
            <q-td :props="slotProps">
              <div v-if="slotProps.value === 'ยกเลิก'" class="text-negative text-center">
                {{ $t('finance.receiptSummary.statusCancelled') }}<br />
                <span class="text-caption text-grey-6">
                  {{ slotProps.row.cancelBy }}<br />{{ slotProps.row.cancelDate }}
                </span>
              </div>
              <div v-else class="text-center">
                {{ $t('finance.receiptSummary.statusActive') }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-printReceipt="slotProps">
            <q-td :props="slotProps" class="text-center">
              <span v-if="slotProps.row.status === 'ยกเลิก'" class="text-grey-6">
                {{ $t('finance.receiptSummary.statusCancelled') }}
              </span>
              <q-btn
                v-else
                flat
                round
                dense
                icon="download"
                color="warning"
                @click="downloadReceipt(slotProps.row)"
              >
                <q-tooltip>{{ $t('finance.receipts.printReceipt') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-courseName="slotProps">
            <q-td :props="slotProps">
              <div style="white-space: pre-wrap; word-break: break-word">
                {{ slotProps.value }}
              </div>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width justify-between items-center q-py-sm">
              <div class="row items-center q-gutter-sm">
                <span class="text-subtitle2 text-grey-8">
                  {{ $t('finance.receiptSummary.showEntries') }}
                </span>
                <q-select
                  v-model="pagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  outlined
                  dense
                  options-dense
                  style="width: 80px"
                  class="bg-white receipt-rows-select"
                />
                <span class="text-subtitle2 text-grey-8">
                  {{ $t('finance.receiptSummary.entries') }}
                </span>
              </div>
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-grey-8 q-mr-sm">
                  {{
                    filteredRows.length > 0
                      ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                      : 0
                  }}-{{
                    Math.min(
                      scope.pagination.page * scope.pagination.rowsPerPage,
                      filteredRows.length,
                    )
                  }}
                  of {{ filteredRows.length }}
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
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';
import { useFacultyList } from 'src/composables/use-faculty-list';
import type { ApiFaculty } from 'src/types/faculty';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';
import jsPDF from 'jspdf';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

interface ReceiptSummaryItem {
  id: number;
  no: number;
  faculty: string;
  receiptNo: string;
  customerName: string;
  amount: number;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  collector: string;
  status: string;
  cancelBy?: string | undefined;
  cancelDate?: string | undefined;
}

const { t } = useI18n();

const { isLoading: isFacultyLoading, fetchFaculties } = useFacultyList();
const faculties = ref<ApiFaculty[]>([]);

const search = ref('');
const showReceiptDialog = ref(false);
const selectedReceipt = ref<ReceiptSummaryItem | null>(null);
const receiptDialogRef = ref<InstanceType<typeof ReceiptCard> | null>(null);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const filters = ref({
  faculty: '',
  receiptDateStart: '',
  receiptDateEnd: '',
  effectiveDateStart: '',
  effectiveDateEnd: '',
});

const facultyOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' },
  ...faculties.value.map((f) => ({ label: f.name ?? '', value: f.name ?? '' })),
]);

const activeFacultyScopeLabel = computed<string>(() => {
  if (!filters.value.faculty) return t('centralFinance.receiptSummary.allFaculties');
  const option = facultyOptions.value.find((o) => o.value === filters.value.faculty);
  return option?.label ?? filters.value.faculty;
});

// Receipt computed for ReceiptCard
const receiptId = computed<string>(() => selectedReceipt.value?.receiptNo ?? '');
const issuedAt = computed<Date | null>(() =>
  selectedReceipt.value ? parseThaiDate(selectedReceipt.value.effectiveDate) : null,
);
const customerName = computed<string>(() => selectedReceipt.value?.customerName ?? '');
const customerTaxId = computed<string>(() => '0994000249357');
const customerAddress = computed<string>(
  () => '169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131',
);
const courseCode = computed<string>(() => {
  if (!selectedReceipt.value) return '';
  return selectedReceipt.value.courseName.split(':')[0] ?? '';
});
const courseTitle = computed<string>(() => {
  if (!selectedReceipt.value) return '';
  const parts = selectedReceipt.value.courseName.split(':');
  return parts.slice(1).join(':').replace(/\n/g, ' ') || selectedReceipt.value.courseName;
});
const amount = computed<number>(() => selectedReceipt.value?.amount ?? 0);

// Rows filtered by selected faculty
const filteredRows = computed<ReceiptSummaryItem[]>(() => {
  if (!filters.value.faculty) return mockData;
  return mockData.filter((row) => row.faculty === filters.value.faculty);
});

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'no',
    label: t('finance.receiptSummary.columns.no'),
    field: 'no',
    align: 'center',
    sortable: true,
  },
  {
    name: 'faculty',
    label: t('centralFinance.receiptSummary.columns.faculty'),
    field: 'faculty',
    align: 'center',
    sortable: true,
    style: 'white-space: pre-wrap; min-width: 120px;',
  },
  {
    name: 'receiptNo',
    label: t('finance.receiptSummary.columns.receiptNo'),
    field: 'receiptNo',
    align: 'center',
    sortable: true,
  },
  {
    name: 'customerName',
    label: t('finance.receiptSummary.columns.fullName'),
    field: 'customerName',
    align: 'center',
    sortable: true,
    style: 'white-space: nowrap;',
  },
  {
    name: 'amount',
    label: t('finance.receiptSummary.columns.amount'),
    field: 'amount',
    align: 'center',
    sortable: true,
  },
  {
    name: 'effectiveDate',
    label: t('finance.receiptSummary.columns.effectiveDate'),
    field: 'effectiveDate',
    align: 'center',
    sortable: true,
  },
  {
    name: 'learnerName',
    label: t('finance.receiptSummary.columns.learnerName'),
    field: 'learnerName',
    align: 'center',
    sortable: true,
    style: 'white-space: nowrap;',
  },
  {
    name: 'courseName',
    label: t('finance.receiptSummary.columns.courseName'),
    field: 'courseName',
    align: 'center',
    sortable: true,
    style: 'width: 220px',
    headerStyle: 'white-space: pre-wrap; width: 220px',
  },
  {
    name: 'collector',
    label: t('finance.receiptSummary.columns.collector'),
    field: 'collector',
    align: 'center',
    sortable: true,
    headerStyle: 'white-space: pre-wrap;',
  },
  {
    name: 'status',
    label: t('finance.receiptSummary.columns.status'),
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'printReceipt',
    label: t('finance.receiptSummary.columns.actions'),
    field: 'printReceipt',
    align: 'center',
  },
]);

function parseThaiDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    const cleanStr = dateStr.replace('\n', ' ').trim();
    const parts = cleanStr.split(' ');
    if (parts.length < 3) return null;
    const day = parseInt(parts[0] ?? '0', 10);
    const monthThai = parts[1] ?? '';
    const yearThai = parseInt(parts[2] ?? '0', 10);
    const months = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    const monthIndex = months.indexOf(monthThai);
    if (monthIndex === -1) return null;
    const year = yearThai - 543;
    let hour = 0,
      minute = 0,
      second = 0;
    if (parts[3]) {
      const timeParts = parts[3].split(':');
      hour = parseInt(timeParts[0] ?? '0', 10);
      minute = parseInt(timeParts[1] ?? '0', 10);
      second = parseInt(timeParts[2] ?? '0', 10);
    }
    return new Date(year, monthIndex, day, hour, minute, second);
  } catch {
    return null;
  }
}

async function downloadReceipt(row: ReceiptSummaryItem): Promise<void> {
  selectedReceipt.value = row;
  await nextTick();
  receiptDialogRef.value?.downloadReceiptPdf();
}

function clearFilters(): void {
  filters.value.faculty = '';
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.effectiveDateStart = '';
  filters.value.effectiveDateEnd = '';
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
  const title = t('centralFinance.receiptSummary.reportTitle');
  const subtitle = `${t('centralFinance.receiptSummary.filters.faculty')}: ${activeFacultyScopeLabel.value}`;
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
  doc.text(subtitle, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

  const rows = filteredRows.value.map((row) => [
    row.no,
    row.faculty,
    row.receiptNo,
    row.customerName,
    row.amount,
    row.effectiveDate,
    row.learnerName,
    row.courseName,
    row.collector,
    row.status === 'ยกเลิก' ? `ยกเลิก\n${row.cancelBy ?? ''}\n${row.cancelDate ?? ''}` : 'ใช้งาน',
  ]);

  autoTable(doc, {
    startY: 65,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    head: [
      [
        'ลำดับ',
        'ส่วนงาน',
        'เลขที่ใบเสร็จรับเงิน',
        'ชื่อ-สกุล ผู้ชำระเงิน\n(Customer Name)',
        'จำนวนเงิน',
        'วันที่ชำระเงิน\n(effective date)',
        'ชื่อ-สกุล ผู้เรียน',
        'ชื่อโครงการ/อบรม/\nหลักสูตร',
        'ผู้รับเงิน (Collector)\nวันที่ใบเสร็จรับเงิน',
        'สถานะ',
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
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell(data: CellHookData) {
      if (data.section === 'body' && data.column.index === 9) {
        const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
        if (val.startsWith('ยกเลิก')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { top: 20, left: 15, right: 15 },
    tableWidth: 'auto',
  });

  doc.save('central-finance-receipt-summary.pdf');
}

function exportToExcel(): void {
  const header = [
    'ลำดับ',
    'ส่วนงาน',
    'เลขที่ใบเสร็จรับเงิน',
    'ชื่อ-สกุล ผู้ชำระเงิน (Customer Name)',
    'จำนวนเงิน',
    'วันที่ชำระเงิน (effective date)',
    'ชื่อ-สกุล ผู้เรียน',
    'ชื่อโครงการ/อบรม/หลักสูตร',
    'ผู้รับเงิน (Collector) วันที่ใบเสร็จรับเงิน',
    'สถานะ',
  ];

  const rows = filteredRows.value.map((row) => [
    row.no,
    row.faculty,
    row.receiptNo,
    row.customerName,
    row.amount,
    row.effectiveDate.replace('\n', ' '),
    row.learnerName,
    row.courseName.replace(/\n/g, ' '),
    row.collector.replace('\n', ' '),
    row.status === 'ยกเลิก'
      ? `ยกเลิก ${row.cancelBy ?? ''} ${(row.cancelDate ?? '').replace('\n', ' ')}`
      : 'ใช้งาน',
  ]);

  const title = t('centralFinance.receiptSummary.reportTitle');
  const wsData = [[title], [], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
  ws['!cols'] = [
    { wch: 7 },
    { wch: 22 },
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 22 },
    { wch: 25 },
    { wch: 40 },
    { wch: 30 },
    { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
  XLSX.writeFile(wb, 'central-finance-receipt-summary.xlsx');
}

onMounted(async () => {
  faculties.value = await fetchFaculties();
});

// Mock data — multiple faculties
function generateMockData(): ReceiptSummaryItem[] {
  const faculties = [
    'สำนักคอมพิวเตอร์',
    'คณะวิทยาการสารสนเทศ',
    'คณะวิทยาศาสตร์',
    'คณะพยาบาลศาสตร์',
    'คณะบริหารธุรกิจ',
    'คณะวิศวกรรมศาสตร์',
  ];

  const coursesByFaculty: Record<string, string> = {
    สำนักคอมพิวเตอร์: 'C67052002:การพัฒนาเว็บแอปพลิเคชัน\nสำนักคอมพิวเตอร์',
    คณะวิทยาการสารสนเทศ: 'C66061004:Digital Product Design\nคณะวิทยาการสารสนเทศ',
    คณะวิทยาศาสตร์: 'C65091001:วิทยาศาสตร์ข้อมูลเบื้องต้น\nคณะวิทยาศาสตร์',
    คณะพยาบาลศาสตร์: 'C65082001:การดูแลผู้สูงอายุเบื้องต้น\nคณะพยาบาลศาสตร์',
    คณะบริหารธุรกิจ: 'C66021005:การตลาดดิจิทัลยุคใหม่\nคณะบริหารธุรกิจ',
    คณะวิศวกรรมศาสตร์: 'C66031002:ปัญญาประดิษฐ์ในอุตสาหกรรม\nคณะวิศวกรรมศาสตร์',
  };

  const collectors: Record<string, string> = {
    สำนักคอมพิวเตอร์: 'นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567',
    คณะวิทยาการสารสนเทศ: 'นายสมชาย ดีงาม\n21 มี.ค. 2567',
    คณะวิทยาศาสตร์: 'นางวิมล รัตนาพร\n22 มี.ค. 2567',
    คณะพยาบาลศาสตร์: 'นายอนันต์ ยอดเยี่ยม\n23 มี.ค. 2567',
    คณะบริหารธุรกิจ: 'นางสาวเกศรา พูนผล\n24 มี.ค. 2567',
    คณะวิศวกรรมศาสตร์: 'นายวิทยา มั่นคง\n25 มี.ค. 2567',
  };

  const names = [
    'นัธพร ยะโสวงษ์',
    'วิมลรัตน์ ดีเลิศ',
    'สมชาย รักเรียน',
    'อนันต์ ยอดเยี่ยม',
    'เกศรา พูนผล',
    'ธนพล สุขสันต์',
    'พิมพ์ใจ เจริญสุข',
    'ศิริพร ใจดี',
    'วีระชัย กล้าหาญ',
    'มนัสวี บุญช่วย',
  ];

  const data: ReceiptSummaryItem[] = [];
  let id = 1;

  for (const faculty of faculties) {
    for (let i = 0; i < 14; i++) {
      const isCancelled = i % 7 === 6;
      const name = names[(id + i) % names.length] ?? '';
      data.push({
        id,
        no: id,
        faculty,
        receiptNo: '256706' + String(id).padStart(6, '0'),
        customerName: name,
        amount: [1500, 2000, 2500, 3000, 3500, 4000][i % 6] ?? 1500,
        effectiveDate: `${(i % 28) + 1} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'][Math.floor(i / 5) % 6] ?? 'ม.ค.'} 2566\n${10 + (i % 12)}:${String(20 + (i % 40)).padStart(2, '0')}:00`,
        learnerName: name,
        courseName: coursesByFaculty[faculty] ?? '',
        collector: collectors[faculty] ?? '',
        status: isCancelled ? 'ยกเลิก' : 'ใช้งาน',
        cancelBy: isCancelled ? name : undefined,
        cancelDate: isCancelled ? '15/05/2567\nทดสอบยกเลิก' : undefined,
      });
      id++;
    }
  }

  return data;
}

const mockData = generateMockData();
</script>

<style lang="scss" scoped>
.receipt-search {
  width: 250px;
}

.receipt-table {
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

:deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
}

.faculty-scope-card {
  min-width: 260px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 6px;
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
</style>
