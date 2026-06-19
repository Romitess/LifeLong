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
      <!-- Sticky sentinel — 1px div สำหรับ IntersectionObserver detect "stuck" -->
      <div ref="sentinelRef" class="admin-filter-sentinel" />

      <!-- Sticky Filter Bar -->
      <div class="admin-filter-bar" :class="{ 'admin-filter-bar--stuck': filterStuck }">
        <div class="admin-filter-bar__row1">
          <span class="admin-filter-bar__label q-mr-sm">
            <q-icon name="filter_alt" size="14px" class="q-mr-xs" /> ตัวกรอง
          </span>

          <button
            v-for="opt in datePresetOptions"
            :key="opt.value"
            class="admin-filter-bar__item"
            :class="{ 'admin-filter-bar__item--active': datePreset === opt.value }"
            @click="applyDatePreset(opt.value)"
          >
            {{ opt.label }}
          </button>

          <div class="admin-filter-bar__divider" />

          <q-btn
            flat
            dense
            round
            icon="filter_alt_off"
            color="negative"
            @click="clearDates"
            class="q-ml-sm"
          >
            <q-tooltip>ล้างตัวกรอง</q-tooltip>
          </q-btn>
        </div>

        <div class="admin-filter-bar__row2">
          <span class="admin-filter-bar__sub-label q-mr-sm">วันที่ใบเสร็จ:</span>
          <q-input
            v-model="receiptDateDisplay"
            readonly
            borderless
            dense
            placeholder="เลือกช่วงเวลา"
            class="admin-filter-bar__input admin-filter-bar__input--range q-mr-md"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="receiptDateModel" range mask="DD/MM/YYYY" color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="ตกลง" color="primary" flat v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <span class="admin-filter-bar__sub-label q-mr-sm">วันที่ชำระเงิน (Effective Date):</span>
          <q-input
            v-model="effectiveDateDisplay"
            readonly
            borderless
            dense
            placeholder="เลือกช่วงเวลา"
            class="admin-filter-bar__input admin-filter-bar__input--range"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="effectiveDateModel" range mask="DD/MM/YYYY" color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="ตกลง" color="primary" flat v-close-popup />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <AppSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <div class="row items-center">
            <TableExportActions
              :pdf-config="pdfExportConfig"
              :excel-config="excelExportConfig"
              :pdf-label="$t('finance.receiptSummary.exportPdf')"
              :excel-label="$t('finance.receiptSummary.exportExcel')"
            />
          </div>
        </template>

        <div class="receipt-table-head row items-center justify-between q-mb-md q-px-md">
          <div class="receipt-table-head__title text-weight-bold text-body1">
            {{ $t('finance.receiptSummary.title') }}
          </div>
          <div class="receipt-table-toolbar">
            <AppSearchInput
              v-model="search"
              :placeholder="$t('finance.receiptSummary.searchLabel')"
              class="receipt-search"
            />
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
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import type { PdfExportConfig, ExcelExportConfig } from 'src/types/export-types';
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ReceiptCard from 'components/receipt/receipt-card.vue';
import { Notify, date, type QTableProps } from 'quasar';
import { type CellHookData } from 'jspdf-autotable';
import { useAuthStore } from 'stores/auth-store';
import { api } from 'src/boot/axios';

const authStore = useAuthStore();
const { t } = useI18n();
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

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
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
    end = formatDateInput(new Date());
  } else if (preset === 'thisMonth') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    start = formatDateInput(startOfMonth);
    end = formatDateInput(new Date());
  } else if (preset === 'thisYear') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    start = formatDateInput(startOfYear);
    end = formatDateInput(new Date());
  }

  if (preset !== 'custom') {
    filters.value.receiptDateStart = start;
    filters.value.receiptDateEnd = end;
    filters.value.effectiveDateStart = '';
    filters.value.effectiveDateEnd = '';
    void fetchData();
  }
}

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
  datePreset.value = 'allTime';
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.effectiveDateStart = '';
  filters.value.effectiveDateEnd = '';
  void fetchData();
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

const pdfExportConfig = computed<PdfExportConfig | null>(() => {
  if (tableData.value.length === 0) return null;

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

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = userFacName.value === 'ไม่ระบุ' ? 'All' : userFacName.value.replace(/\s+/g, '_');
  const filename = `reportpayment_${facName}_${todayStr}`;

  return {
    filename,
    titles: ['รายงานสรุปการรับเงินค่าลงทะเบียน LifeLong Learning มหาวิทยาลัยบูรพา'],
    titleStartY: 40,
    startY: 55,
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
      fontSize: 8,
      cellPadding: 4,
      valign: 'top',
    },
    headStyles: {
      fontSize: 8,
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
    didParseCell(data: CellHookData) {
      if (data.section === 'body' && data.column.index === 8) {
        const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
        if (val.startsWith('ยกเลิก')) {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
  };
});

const excelExportConfig = computed<ExcelExportConfig | null>(() => {
  if (tableData.value.length === 0) return null;

  const header = [
    'ลำดับ',
    'เลขที่ใบเสร็จรับเงิน',
    'ชื่อ-สกุล ผู้ชำระเงิน (Customer Name)',
    'จำนวนเงิน',
    'วันที่ชำระเงิน (effective date)',
    'ชื่อ-สกุล ผู้เรียน',
    'ชื่อโครงการ/อบรม/หลักสูตร',
    'ผู้รับเงิน (Collector) / วันที่ใบเสร็จรับเงิน',
    'สถานะ',
  ];

  const data = tableData.value.map((row) => [
    row.no,
    row.receiptNo,
    row.customerName,
    row.amount,
    formatEffectiveDate(row.effectiveDate),
    row.learnerName,
    row.courseName,
    formatCollectorDate(row.collector).replace(/\n/g, ' '),
    row.status === 'ยกเลิก'
      ? 'ยกเลิก ' + (row.cancelBy ?? '') + ' ' + (row.cancelDate ?? '')
      : 'ใช้งาน',
  ]);

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facName = userFacName.value === 'ไม่ระบุ' ? 'All' : userFacName.value.replace(/\s+/g, '_');
  const filename = `reportpayment_${facName}_${todayStr}`;

  return {
    filename,
    sheetName: 'Receipt Summary',
    header,
    data,
  };
});

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
  if (sentinelRef.value) {
    stickyObserver = new IntersectionObserver(
      ([entry]) => {
        filterStuck.value = !(entry?.isIntersecting ?? true);
      },
      { threshold: 0, rootMargin: '-73px 0px 0px 0px' },
    );
    stickyObserver.observe(sentinelRef.value);
  }

  void fetchData();
});

onUnmounted(() => {
  stickyObserver?.disconnect();
});
</script>

<style lang="scss" scoped>
// ─── Sticky Filter Bar ───────────────────────────────────────
.admin-filter-sentinel {
  height: 1px;
}

.admin-filter-bar {
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

.admin-filter-bar__row1,
.admin-filter-bar__row2 {
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

.admin-filter-bar__row1 {
  padding: 8px 8px 4px;
  min-height: 52px;
}

.admin-filter-bar__row2 {
  padding: 4px 8px 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
}

.admin-filter-bar__label,
.admin-filter-bar__sub-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--admin-navy, #10233f);
  padding-left: 8px;
  white-space: nowrap;
}

.admin-filter-bar__sub-label {
  font-size: 0.76rem;
  color: #64748b;
}

.admin-filter-bar__item {
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

.admin-filter-bar__divider {
  width: 1px;
  height: 24px;
  background: rgba(17, 24, 39, 0.08);
  margin: 0 10px;
  flex: 0 0 auto;
}

.admin-filter-bar__input {
  width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;
}
.admin-filter-bar__input--range {
  width: 220px;
}
.admin-filter-bar__input:focus-within {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
}

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

    .receipt-search {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.receipt-search {
  flex: 1 1 280px;
  min-width: 200px;
  max-width: 520px;

  :deep(.q-field__control),
  :deep(.q-field__marginal) {
    height: 52px;
  }

  :deep(.q-field__native) {
    font-size: 1rem;
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
