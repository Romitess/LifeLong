<template>
  <q-page class="admin-page finance-receipt-summary-page">
    <AdminPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('finance.receiptSummary.title')"
      :description="$t('finance.receiptSummary.description')"
    />

    <section class="admin-shell admin-content">
      <AdminSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Filter section -->
          <div class="col-12 col-md-8 offset-md-2">
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.departmentLabel') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input v-model="filters.department" borderless dense readonly />
              </div>
            </div>

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
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
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
                  @click="clearDates"
                />
              </div>
            </div>
          </div>
        </div>
      </AdminSurfaceCard>

      <AdminSurfaceCard class="q-mt-md" card-class="q-pa-none">
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

        <div class="text-center q-pt-lg q-pb-sm text-weight-bold text-subtitle1">
          {{ $t('finance.receiptSummary.title') }}
        </div>

        <div class="row justify-between items-center q-px-md q-pb-md">
          <div class="row items-center q-gutter-sm">
            <span class="text-subtitle2 text-grey-8">{{
              $t('finance.receiptSummary.showEntries')
            }}</span>
            <q-select
              v-model="pagination.rowsPerPage"
              :options="[10, 25, 50, 100]"
              outlined
              dense
              options-dense
              style="width: 80px"
              class="bg-white"
            />
            <span class="text-subtitle2 text-grey-8">{{
              $t('finance.receiptSummary.entries')
            }}</span>
          </div>
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
          :rows="mockData"
          :columns="columns"
          row-key="id"
          flat
          dense
          :filter="search"
          class="receipt-table"
          v-model:pagination="pagination"
          :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <div v-if="props.value === 'ยกเลิก'" class="text-negative text-center">
                {{ $t('finance.receiptSummary.statusCancelled') }}<br />
                <span class="text-caption text-grey-6"
                  >{{ props.row.cancelBy }}<br />{{ props.row.cancelDate }}</span
                >
              </div>
              <div v-else class="text-center">
                {{ $t('finance.receiptSummary.statusActive') }}
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-printReceipt="props">
            <q-td :props="props" class="text-center">
              <span v-if="props.row.status === 'ยกเลิก'" class="text-grey-6">
                {{ $t('finance.receiptSummary.statusCancelled') }}
              </span>
              <q-btn
                v-else
                flat
                round
                dense
                icon="download"
                color="warning"
                @click="downloadReceipt(props.row)"
              >
                <q-tooltip>{{ $t('finance.receipts.printReceipt') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <template v-slot:body-cell-courseName="props">
            <q-td :props="props">
              <div style="white-space: pre-wrap; word-break: break-word">{{ props.value }}</div>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width justify-between items-center q-py-md">
              <div class="text-caption text-grey-8 text-weight-medium">
                {{
                  $t('finance.receiptSummary.showing', {
                    start: (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1,
                    end: Math.min(
                      scope.pagination.page * scope.pagination.rowsPerPage,
                      mockData.length,
                    ),
                    total: mockData.length,
                  })
                }}
              </div>
              <q-pagination
                v-model="pagination.page"
                :max="scope.pagesNumber"
                direction-links
                flat
                color="grey-8"
                active-color="warning"
                active-text-color="black"
                :max-pages="6"
                boundary-numbers
              />
            </div>
          </template>
        </q-table>
      </AdminSurfaceCard>
    </section>

    <CourseReceiptDialog
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
    />
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { ref, computed, nextTick } from 'vue';
import CourseReceiptDialog from 'components/receipt/CourseReceiptDialog.vue';
import type { QTableProps } from 'quasar';
import { useI18n } from 'vue-i18n';
import jsPDF from 'jspdf';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/Sarabun-Regular.ttf';
import * as XLSX from 'xlsx';

const { t } = useI18n();

const search = ref('');

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

const filters = ref({
  department: 'สำนักคอมพิวเตอร์ (82994)',
  receiptDateStart: '',
  receiptDateEnd: '',
  effectiveDateStart: '',
  effectiveDateEnd: '',
});

const receiptDialogRef = ref<InstanceType<typeof CourseReceiptDialog> | null>(null);
const showReceiptDialog = ref(false);
const selectedReceipt = ref<ReceiptSummaryItem | null>(null);

const receiptId = computed(() => selectedReceipt.value?.receiptNo || '');
const issuedAt = computed(() => {
  return selectedReceipt.value ? parseThaiDate(selectedReceipt.value.effectiveDate) : null;
});
const customerName = computed(() => selectedReceipt.value?.customerName || '');
const customerTaxId = computed(() => '0994000249357');
const customerAddress = computed(
  () => '169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131',
);

const courseCode = computed(() => {
  if (!selectedReceipt.value) return '';
  const parts = selectedReceipt.value.courseName.split(':');
  return parts[0] || '';
});

const courseTitle = computed(() => {
  if (!selectedReceipt.value) return '';
  const parts = selectedReceipt.value.courseName.split(':');
  return parts.slice(1).join(':').replace(/\n/g, ' ') || selectedReceipt.value.courseName;
});

const amount = computed(() => selectedReceipt.value?.amount ?? 0);

function parseThaiDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    const cleanStr = dateStr.replace('\n', ' ').trim();
    const parts = cleanStr.split(' ');
    if (parts.length < 3) return null;
    const day = parseInt(parts[0] || '0');
    const monthThai = parts[1] || '';
    const yearThai = parseInt(parts[2] || '0');

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
      hour = parseInt(timeParts[0] || '0');
      minute = parseInt(timeParts[1] || '0');
      second = parseInt(timeParts[2] || '0');
    }

    return new Date(year, monthIndex, day, hour, minute, second);
  } catch {
    return null;
  }
}

async function downloadReceipt(row: ReceiptSummaryItem) {
  selectedReceipt.value = row;
  await nextTick();
  if (receiptDialogRef.value) {
    receiptDialogRef.value.downloadReceiptPdf();
  }
}

function clearDates() {
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.effectiveDateStart = '';
  filters.value.effectiveDateEnd = '';
}

async function exportToPdf() {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // Fetch font and convert to base64
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

  // Embed Sarabun font
  doc.addFileToVFS('Sarabun-Regular.ttf', base64Font);
  doc.addFont('Sarabun-Regular.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');

  // Title
  doc.setFontSize(13);
  const title = 'รายงานสรุปการรับเงินค่าลงทะเบียน LifeLong Learning มหาวิทยาลัยบูรพา';
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

  const rows = mockData.map((row) => [
    row.no,
    row.receiptNo,
    row.customerName,
    row.amount,
    row.effectiveDate,
    row.learnerName,
    row.courseName,
    row.collector,
    row.status === 'ยกเลิก'
      ? 'ยกเลิก\n' + (row.cancelBy ?? '') + '\n' + (row.cancelDate ?? '')
      : 'ใช้งาน',
  ]);

  autoTable(doc, {
    startY: 55,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    head: [
      [
        'ลำดับ',
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
      font: 'Sarabun', // ← เปลี่ยนตรงนี้
      fontSize: 8,
      cellPadding: 4,
      valign: 'top',
      lineColor: [180, 180, 180],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'Sarabun', // ← และตรงนี้
      fillColor: [226, 232, 240],
      textColor: [51, 65, 85],
      fontStyle: 'normal', // ← bold ไม่มีใน Sarabun-Regular ให้ใช้ normal
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 28 },
      1: { halign: 'center', cellWidth: 80 },
      2: { cellWidth: 100 },
      3: { halign: 'center', cellWidth: 55 },
      4: { halign: 'center', cellWidth: 75 },
      5: { cellWidth: 100 },
      6: { cellWidth: 153 },
      7: { halign: 'center', cellWidth: 120 },
      8: { halign: 'center', cellWidth: 90 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    didParseCell(data: CellHookData) {
      if (data.section === 'body' && data.column.index === 8) {
        const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
        if (val.startsWith('ยกเลิก')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { top: 20, left: 20, right: 20 },
    tableWidth: 'auto',
  });

  doc.save('receipt-summary.pdf');
}

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'no',
    label: t('finance.receiptSummary.columns.no'),
    field: 'no',
    align: 'center',
    sortable: true,
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
    style: 'width: 250px',
    headerStyle: 'white-space: pre-wrap; width: 250px',
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

interface ReceiptSummaryItem {
  id: number;
  no: number;
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

const generateMockData = (): ReceiptSummaryItem[] => {
  const data: ReceiptSummaryItem[] = [];
  data.push({
    id: 1,
    no: 1,
    receiptNo: '256706000001',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567',
    status: 'ยกเลิก',
    cancelBy: 'นัธพร ยะโสวงษ์',
    cancelDate: '15/05/2567\nทดสอบใบเสร็จ',
  });
  data.push({
    id: 2,
    no: 2,
    receiptNo: '256706000002',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567',
    status: 'ใช้งาน',
  });
  data.push({
    id: 3,
    no: 3,
    receiptNo: '256706000003',
    customerName: 'นัธพร ยะโสวงษ์',
    amount: 1,
    effectiveDate: '30 พ.ย. 2566\n13:26:28',
    learnerName: 'นัธพร ยะโสวงษ์',
    courseName: 'C66061004:การถ่ายภาพโฆษณา',
    collector: 'นางสาวนัธพร ยะโสวงษ์\n22 มี.ค. 2567',
    status: 'ใช้งาน',
  });

  const names = [
    'นัธพร ยะโสวงษ์',
    'วิมลรัตน์ ดีเลิศ',
    'สมชาย รักเรียน',
    'อนันต์ ยอดเยี่ยม',
    'เกศรา พูนผล',
  ];
  const courses = [
    'C66061004:การถ่ายภาพโฆษณา\nคณะศิลปกรรมศาสตร์\n99999 สำหรับทดสอบ Direct link',
    'C67052002:การพัฒนาเว็บแอปพลิเคชัน\nสำนักคอมพิวเตอร์',
    'C65091001:ภาษาอังกฤษเพื่อการสื่อสาร\nคณะมนุษยศาสตร์',
  ];
  const collectors = ['นางสาวนัธพร ยะโสวงษ์\n20 มี.ค. 2567', 'นายสมชาย ดีงาม\n21 มี.ค. 2567'];

  for (let i = 4; i <= 85; i++) {
    const isCancelled = i % 15 === 0;
    data.push({
      id: i,
      no: i,
      receiptNo: '256706' + String(i).padStart(6, '0'),
      customerName: names[i % names.length] ?? '',
      amount: 1,
      effectiveDate: `30 พ.ย. 2566\n13:${20 + (i % 39)}:28`,
      learnerName: names[i % names.length] ?? '',
      courseName: courses[i % courses.length] ?? '',
      collector: collectors[i % collectors.length] ?? '',
      status: isCancelled ? 'ยกเลิก' : 'ใช้งาน',
      cancelBy: isCancelled ? 'นัธพร ยะโสวงษ์' : undefined,
      cancelDate: isCancelled ? '15/05/2567\nทดสอบยกเลิก' : undefined,
    });
  }
  return data;
};

const mockData = generateMockData();

function exportToExcel() {
  // สร้าง header row
  const header = [
    'ลำดับ',
    'เลขที่ใบเสร็จรับเงิน',
    'ชื่อ-สกุล ผู้ชำระเงิน (Customer Name)',
    'จำนวนเงิน',
    'วันที่ชำระเงิน (effective date)',
    'ชื่อ-สกุล ผู้เรียน',
    'ชื่อโครงการ/อบรม/หลักสูตร',
    'ผู้รับเงิน (Collector) วันที่ใบเสร็จรับเงิน',
    'สถานะ',
  ];

  // สร้าง data rows
  const rows = mockData.map((row) => [
    row.no,
    row.receiptNo,
    row.customerName,
    row.amount,
    row.effectiveDate.replace('\n', ' '),
    row.learnerName,
    row.courseName.replace(/\n/g, ' '),
    row.collector.replace('\n', ' '),
    row.status === 'ยกเลิก'
      ? `ยกเลิก ${row.cancelBy ?? ''} ${row.cancelDate?.replace('\n', ' ') ?? ''}`
      : 'ใช้งาน',
  ]);

  // สร้าง title row
  const title = 'รายงานสรุปการรับเงินค่าลงทะเบียน LifeLong Learning มหาวิทยาลัยบูรพา';

  // รวม worksheet data: title + blank row + header + rows
  const wsData = [[title], [], header, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge title across all columns (A1:I1)
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

  // กำหนดความกว้างคอลัมน์
  ws['!cols'] = [
    { wch: 8 }, // ลำดับ
    { wch: 18 }, // เลขที่ใบเสร็จ
    { wch: 25 }, // ชื่อผู้ชำระเงิน
    { wch: 12 }, // จำนวนเงิน
    { wch: 22 }, // วันที่ชำระเงิน
    { wch: 25 }, // ชื่อผู้เรียน
    { wch: 40 }, // ชื่อโครงการ
    { wch: 30 }, // ผู้รับเงิน
    { wch: 30 }, // สถานะ
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
  XLSX.writeFile(wb, 'receipt-summary.xlsx');
}
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
    background: #e2e8f0; // slightly darker for header as in screenshot
  }
  :deep(th) {
    font-weight: 600;
    color: #334155;
    font-size: 0.75rem;
    white-space: pre-wrap; // To allow \n in labels
    text-align: center;
    vertical-align: middle;
    line-height: 1.3;
    padding: 8px 6px;
  }
  :deep(tbody td) {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap; // To allow \n in content like dates
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
