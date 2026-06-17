<template>
  <q-page class="admin-page finance-receipt-summary-page">
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('finance.receiptSummary.title')"
      :description="$t('finance.receiptSummary.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ userFacName || 'ไม่ระบุคณะ' }}</div>
        </div>
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <AppSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <!-- Filter section -->
          <div class="col-12 col-md-8 offset-md-2">
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.receiptSummary.departmentLabel') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-input :model-value="userFacName" borderless dense readonly />
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
                  :loading="isLoading"
                  @click="fetchData"
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
      </AppSurfaceCard>

      <AppSurfaceCard class="q-mt-md" card-class="q-pa-none">
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

        <div class="receipt-table-head row items-center justify-between q-mb-md q-px-md">
          <div class="receipt-table-head__title text-weight-bold text-body1">
            {{ $t('finance.receiptSummary.title') }}
          </div>
          <div class="receipt-table-toolbar">
            <q-input
              v-model="search"
              outlined
              clearable
              debounce="200"
              :placeholder="$t('finance.receiptSummary.searchLabel')"
              bg-color="white"
              class="receipt-search-input-main"
            >
              <template #prepend>
                <q-icon name="search" color="grey-5" />
              </template>
            </q-input>
          </div>
        </div>

        <q-table
          :rows="tableData"
          :columns="columns"
          row-key="id"
          flat
          dense
          wrap-cells
          :filter="search"
          :loading="isLoading"
          class="receipt-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :header-style="{ fontSize: '0.72rem', whiteSpace: 'normal', lineHeight: '1.3' }"
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

          <template v-slot:body-cell-collector="props">
            <q-td :props="props">
              <div style="white-space: pre-wrap; word-break: break-word">
                {{ formatCollectorDate(props.value) }}
              </div>
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width justify-between items-center q-py-sm">
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
                  class="bg-white receipt-rows-select"
                />
                <span class="text-subtitle2 text-grey-8">{{
                  $t('finance.receiptSummary.entries')
                }}</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-grey-8 q-mr-sm">
                  {{
                    tableData.length > 0
                      ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                      : 0
                  }}-{{
                    Math.min(scope.pagination.page * scope.pagination.rowsPerPage, tableData.length)
                  }}
                  of {{ tableData.length }}
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
      </AppSurfaceCard>
    </section>

    <ReceiptCard
      ref="receiptDialogRef"
      v-model="showReceiptDialog"
      :receipt-id="receiptId"
      :issued-at="issuedAtDate"
      :customer-name="customerName"
      :customer-tax-id="customerTaxId"
      :customer-address="customerAddress"
      :show-customer="true"
      :course-title="courseTitle"
      :course-code="courseCode"
      :amount="amount"
      :receipt-filename="selectedReceipt?.receiptFilename ?? ''"
      :receipt-type="selectedReceipt?.receiptType ?? 'D'"
      :is-copy="selectedReceipt?.receiptType === 'D'"
    />
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/admin/AppPageHero.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import { ref, computed, nextTick, onMounted } from 'vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';
import { Notify, type QTableProps } from 'quasar';
import jsPDF from 'jspdf';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';
import { useAuthStore } from 'stores/auth-store';
import { api } from 'src/boot/axios';

const authStore = useAuthStore();
const userFacName = computed(() => authStore.user?.facName || authStore.user?.faculty || 'ไม่ระบุ');

const search = ref('');
const tableData = ref<ReceiptSummaryItem[]>([]);
const isLoading = ref(false);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const filters = ref({
  receiptDateStart: '',
  receiptDateEnd: '',
  effectiveDateStart: '',
  effectiveDateEnd: '',
});

const receiptDialogRef = ref<InstanceType<typeof ReceiptCard> | null>(null);
const showReceiptDialog = ref(false);
const selectedReceipt = ref<ReceiptSummaryItem | null>(null);

const receiptId = computed(() => selectedReceipt.value?.receiptNo || '');
const issuedAtDate = ref<string | null>(null);
const customerName = ref('');
const customerTaxId = ref('');
const customerAddress = ref('');

const courseCode = ref('');
const courseTitle = ref('');

const amount = computed(() => {
  const numericAmount = Number(selectedReceipt.value?.amount ?? 0);
  return Number.isNaN(numericAmount) ? 0 : numericAmount;
});

function formatEffectiveDate(value: string | undefined): string {
  if (!value) return '';
  const cleanStr = String(value).replace(/"/g, '').trim();
  if (!cleanStr) return '';
  const d = new Date(cleanStr);
  if (isNaN(d.getTime())) return cleanStr;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatCollectorDate(value: string | undefined): string {
  if (!value) return '';
  const lines = value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return '';

  const name = lines[0];
  const dateLine = lines.slice(1).join(' ');
  const dateOnly = dateLine.replace(/\s*\d{1,2}:\d{2}(:\d{2})?\s*$/, '').trim();

  return [name, dateOnly].filter(Boolean).join('\n');
}

async function downloadReceipt(row: ReceiptSummaryItem) {
  try {
    const { data } = await api.get(`/api/lltenrollreceipt/${row.id}/full-receipt-data`);
    const receipt = data.copyReceipt || data.realReceipt;

    selectedReceipt.value = {
      ...row,
      receiptFilename: receipt?.filename ?? row.receiptFilename ?? row.receiptNo ?? '',
      receiptType: 'D',
    };

    customerTaxId.value = data.enrollData?.taxId || '';
    customerAddress.value = data.enrollData?.address || '';
    customerName.value = data.enrollData?.receivedFrom || row.customerName || '';

    courseCode.value = data.enrollData?.coseCode || row.courseName.split(':')[0] || '';
    courseTitle.value =
      data.enrollData?.coseNameTh ||
      row.courseName.split(':').slice(1).join(':').trim() ||
      row.courseName;

    // Use the exact date format from backend which is compatible with ReceiptCard's Date parsing
    issuedAtDate.value =
      data.enrollData?.date ||
      (data.enrollData?.effectiveDate
        ? new Date(data.enrollData.effectiveDate).toISOString()
        : null) ||
      null;

    await nextTick();
    receiptDialogRef.value?.downloadReceiptPdf();
  } catch (error) {
    console.error('Failed to load full receipt data:', error);
    Notify.create({
      type: 'negative',
      message: 'ไม่สามารถดึงข้อมูลรายละเอียดใบเสร็จได้',
      position: 'top',
    });
  }
}

function clearDates() {
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.effectiveDateStart = '';
  filters.value.effectiveDateEnd = '';
}
async function fetchData() {
  isLoading.value = true;
  try {
    const params = Object.fromEntries(
      Object.entries(filters.value).filter(([, value]) => value.trim() !== ''),
    );
    const { data } = await api.get<ReceiptSummaryResponse>(
      '/api/lltenrollreceipt/receipt-summary',
      { params },
    );
    tableData.value = data.data;
    pagination.value.page = 1;
  } catch (error: unknown) {
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      'ไม่สามารถดึงข้อมูลรายงานใบเสร็จได้';
    console.error('Receipt summary fetch failed:', error);
    Notify.create({
      type: 'negative',
      message,
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
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
  doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
  doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');

  // Title
  doc.setFontSize(13);
  const title = 'รายงานสรุปการรับเงินค่าลงทะเบียน LifeLong Learning มหาวิทยาลัยบูรพา';
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

  const rows = tableData.value.map((row) => [
    row.no,
    row.receiptNo,
    row.customerName,
    row.amount,
    formatEffectiveDate(row.effectiveDate),
    row.learnerName,
    row.courseName,
    formatCollectorDate(row.collector),
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
    label: 'ลำดับ',
    field: 'no',
    align: 'center',
    sortable: true,
    style: 'width: 60px; min-width: 60px;',
    headerStyle: 'white-space: nowrap; width: 60px;',
  },
  {
    name: 'receiptNo',
    label: 'เลขที่ใบเสร็จรับเงิน',
    field: 'receiptNo',
    align: 'center',
    sortable: true,
    style: 'width: 110px; min-width: 110px;',
    headerStyle: 'white-space: normal; width: 110px;',
  },
  {
    name: 'customerName',
    label: 'ชื่อ-สกุล ผู้ชำระเงิน (Customer Name)',
    field: 'customerName',
    align: 'center',
    sortable: true,
    style: 'width: 150px; min-width: 120px; white-space: normal;',
    headerStyle: 'white-space: normal; width: 150px;',
  },
  {
    name: 'amount',
    label: 'จำนวนเงิน',
    field: 'amount',
    align: 'center',
    sortable: true,
    style: 'width: 90px; min-width: 90px;',
    headerStyle: 'white-space: nowrap; width: 90px;',
  },
  {
    name: 'effectiveDate',
    label: 'วันที่ชำระเงิน (effective date)',
    field: 'effectiveDate',
    align: 'center',
    sortable: true,
    format: (val: string) => formatEffectiveDate(val),
    style: 'width: 120px; min-width: 100px; white-space: normal;',
    headerStyle: 'white-space: normal; width: 120px;',
  },
  {
    name: 'learnerName',
    label: 'ชื่อ-สกุล ผู้เรียน',
    field: 'learnerName',
    align: 'center',
    sortable: true,
    style: 'width: 120px; min-width: 100px; white-space: normal;',
    headerStyle: 'white-space: normal; width: 120px;',
  },
  {
    name: 'courseName',
    label: 'ชื่อโครงการ/อบรม/หลักสูตร',
    field: 'courseName',
    align: 'center',
    sortable: true,
    style: 'width: 180px; min-width: 140px; white-space: normal;',
    headerStyle: 'white-space: normal; width: 180px;',
  },
  {
    name: 'collector',
    label: 'ผู้รับเงิน (Collector)\nวันที่ใบเสร็จรับเงิน',
    field: 'collector',
    align: 'center',
    sortable: true,
    style: 'width: 200px; min-width: 150px; white-space: normal;',
    headerStyle: 'white-space: normal; width: 200px;',
  },
  {
    name: 'status',
    label: 'สถานะ',
    field: 'status',
    align: 'center',
    sortable: true,
    style: 'width: 90px; min-width: 90px;',
    headerStyle: 'white-space: nowrap; width: 90px;',
  },
  {
    name: 'printReceipt',
    label: 'พิมพ์สำเนาใบเสร็จรับเงิน',
    field: 'printReceipt',
    align: 'center',
    style: 'width: 90px; min-width: 90px;',
    headerStyle: 'white-space: normal; width: 90px;',
  },
]);

interface ReceiptSummaryItem {
  id: number | string;
  no: number;
  receiptNo: string;
  receiptFilename?: string;
  receiptType?: 'R' | 'D';
  customerName: string;
  amount: number | string;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  collector: string;
  status: string;
  cancelBy?: string | undefined;
  cancelDate?: string | undefined;
}

interface ReceiptSummaryResponse {
  success: boolean;
  total: number;
  data: ReceiptSummaryItem[];
}

onMounted(() => {
  void fetchData();
});

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
  const rows = tableData.value.map((row) => [
    row.no,
    row.receiptNo,
    row.customerName,
    row.amount,
    formatEffectiveDate(row.effectiveDate),
    row.learnerName,
    row.courseName.replace(/\n/g, ' '),
    formatCollectorDate(row.collector).replace(/\n/g, ' '),
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
.receipt-table-head {
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch !important;
  }
}

.receipt-table-head__title {
  color: var(--admin-navy, #10233f);
}

.receipt-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
  flex: 1 1 320px;

  @media (max-width: 600px) {
    flex: 1 1 100%;
    justify-content: stretch;

    .receipt-search-input-main {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.receipt-search-input-main {
  flex: 1 1 280px;
  min-width: 200px;
  max-width: 520px;

  :deep(.q-field__control) {
    height: 52px;
    padding: 0 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 2px solid #edf2f7;
    border-radius: 26px !important;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    background: #fff !important;

    &:hover {
      border-color: rgba(245, 166, 35, 0.35);
    }

    &.q-field__control--focused {
      border-color: #f5a623;
      box-shadow: 0 12px 28px rgba(245, 166, 35, 0.12);
    }

    &::before,
    &::after {
      display: none;
    }
  }

  :deep(.q-field__native) {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
  }

  :deep(.q-field__native::placeholder) {
    color: #9e9e9e;
    opacity: 1;
  }

  :deep(.q-field__marginal) {
    height: 52px;
  }
}

.receipt-filter-button {
  min-width: 40px;
  height: 40px;
}

.receipt-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(.q-table thead tr th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
    font-weight: 800;
    font-size: 0.78rem;
    color: #475569;
    letter-spacing: 0.02em;
    padding: 8px 10px;
  }

  :deep(.q-table tbody tr:nth-child(even)) {
    background: rgba(248, 246, 241, 0.55);
  }

  :deep(.q-table tbody td) {
    font-size: 0.86rem;
    vertical-align: middle;
    padding: 6px 8px;
    line-height: 1.3;
    word-break: break-word;
  }

  :deep(.q-table tbody tr) {
    min-height: 34px;
  }

  :deep(.q-table__bottom) {
    border-top: 1px solid var(--admin-line, #e2e8f0);
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
