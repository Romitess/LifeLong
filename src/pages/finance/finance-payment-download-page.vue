<template>
  <q-page
    class="admin-page finance-payment-download-page finance-payment-download-page--static-cards"
  >
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="download"
      :title="$t('finance.paymentDownload.title')"
      :description="$t('finance.paymentDownload.description')"
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

          <q-select
            v-model="filters.receiptStatus"
            :options="receiptStatusOptions"
            emit-value
            map-options
            outlined
            dense
            options-dense
            class="admin-filter-bar__select bg-white q-ml-sm"
            @update:model-value="fetchData"
          />

          <q-btn
            flat
            dense
            round
            icon="filter_alt_off"
            color="negative"
            @click="clearFilters"
            class="q-ml-sm"
          >
            <q-tooltip>ล้างตัวกรอง</q-tooltip>
          </q-btn>
        </div>

        <div
          class="admin-filter-bar__row2"
          :class="{ 'admin-filter-bar__row2--inactive': datePreset !== 'custom' }"
        >
          <span class="admin-filter-bar__sub-label q-mr-sm">กำหนดช่วงเวลาเอง</span>
          <q-input
            v-model="dateRangeDisplay"
            readonly
            borderless
            dense
            placeholder="เลือกช่วงเวลา"
            class="admin-filter-bar__input admin-filter-bar__input--range"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" color="primary">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="dateRangeModel" range mask="DD/MM/YYYY" color="primary">
                    <div class="row items-center justify-end q-gutter-sm">
                      <q-btn label="ยกเลิก" color="primary" flat v-close-popup />
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
            <span class="text-caption text-orange-8 text-weight-medium q-mr-md gt-xs">
              * ข้อมูลที่ดาวน์โหลดจะเป็นไปตามตัวกรองที่เลือกอยู่
            </span>
            <q-btn
              unelevated
              color="positive"
              icon="download"
              :label="$t('finance.paymentDownload.downloadCsv')"
              :disable="tableData.length === 0"
              @click="downloadCsv"
            />
          </div>
        </template>

        <div class="payment-table-head row items-center justify-between q-mb-md q-px-md q-pt-md">
          <div>
            <div class="payment-table-head__title text-weight-bold text-body1">
              {{ $t('finance.paymentDownload.resultsTitle') }}
            </div>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ $t('finance.paymentDownload.resultsHint') }}
            </div>
          </div>
          <div class="payment-table-toolbar">
            <q-input
              v-model="search"
              outlined
              clearable
              debounce="200"
              :placeholder="$t('finance.paymentDownload.searchPlaceholder')"
              bg-color="white"
              class="payment-search-input-main"
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
          class="payment-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
        >
          <template #body-cell-receiptStatus="props">
            <q-td :props="props">
              <q-chip
                v-if="props.row.receiptIssued"
                color="positive"
                text-color="white"
                dense
                size="sm"
                class="q-ma-none text-weight-medium"
              >
                ออกใบเสร็จแล้ว
              </q-chip>
              <q-chip
                v-else
                color="negative"
                text-color="white"
                dense
                size="sm"
                class="q-ma-none text-weight-medium"
              >
                ยังไม่ได้ออก
              </q-chip>
            </q-td>
          </template>

          <template #bottom="scope">
            <div class="row full-width justify-between items-center q-py-sm">
              <div class="row items-center q-gutter-sm">
                <span class="text-subtitle2 text-grey-8">{{
                  $t('finance.paymentDownload.showEntries')
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
                  $t('finance.paymentDownload.entries')
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

          <template #no-data>
            <div class="full-width text-center q-pa-lg text-grey-7">
              {{ $t('finance.paymentDownload.noData') }}
            </div>
          </template>
        </q-table>
      </AppSurfaceCard>

      <div class="row justify-center q-mt-md">
        <q-btn
          flat
          no-caps
          color="primary"
          icon="upload_file"
          :label="$t('finance.paymentDownload.goToImport')"
          :to="{ path: '/finance/payment-import' }"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/admin/AppPageHero.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import { api } from 'src/boot/axios';
import { computed, onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Notify, type QTableProps } from 'quasar';
import { useAuthStore } from 'stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();
const userFacName = computed(() => authStore.user?.facName || authStore.user?.faculty || 'ไม่ระบุ');

interface PaymentNotificationItem {
  id: number;
  no: number;
  learnerRef: string;
  appRef: string;
  payerName: string;
  learnerName: string;
  paymentDate: string;
  paymentTime: string;
  amount: number;
  courseInfo: string;
  enrollDate: string | null;
  notifyDate: string | null;
  receiptIssued: boolean;
}

interface PaymentNotificationApiItem {
  id: number;
  enrollId: number;
  learnerRef: string;
  appRef: string;
  payerName: string | null;
  learnerName: string;
  amount: number;
  courseInfo: string;
  status: 'Paid' | 'Pending';
  enrollDate: string | null;
  notifyDate: string | null;
  receiptIssued: boolean;
}

interface PaymentNotificationApiResponse {
  items: PaymentNotificationApiItem[];
}

const search = ref('');
const tableData = ref<PaymentNotificationItem[]>([]);
const isLoading = ref(false);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function todayFormatted(): string {
  return formatDateInput(new Date());
}

const filters = ref({
  dateFrom: '',
  dateTo: '',
  receiptStatus: 'All',
});

const receiptStatusOptions = [
  { label: 'ทั้งหมด (All)', value: 'All' },
  { label: 'ออกใบเสร็จแล้ว (Issued)', value: 'Issued' },
  { label: 'ยังไม่ได้ออกใบเสร็จ (Not Issued)', value: 'NotIssued' },
];

const datePreset = ref('allTime');
const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

const dateRangeModel = computed({
  get() {
    if (
      filters.value.dateFrom &&
      filters.value.dateTo &&
      filters.value.dateFrom !== filters.value.dateTo
    ) {
      return { from: filters.value.dateFrom, to: filters.value.dateTo };
    }
    return filters.value.dateFrom || null;
  },
  set(val: { from: string; to: string } | string | null) {
    if (val !== null && typeof val === 'object' && 'from' in val && 'to' in val) {
      filters.value.dateFrom = val.from;
      filters.value.dateTo = val.to;
    } else if (typeof val === 'string') {
      filters.value.dateFrom = val;
      filters.value.dateTo = val;
    } else {
      filters.value.dateFrom = '';
      filters.value.dateTo = '';
    }
    onCustomDateChange();
  },
});

const dateRangeDisplay = computed(() => {
  if (
    filters.value.dateFrom &&
    filters.value.dateTo &&
    filters.value.dateFrom !== filters.value.dateTo
  ) {
    return `${filters.value.dateFrom} - ${filters.value.dateTo}`;
  }
  return filters.value.dateFrom || '';
});

function applyDatePreset(preset: string) {
  datePreset.value = preset;
  const now = new Date();
  if (preset === 'today') {
    filters.value.dateFrom = formatDateInput(now);
    filters.value.dateTo = formatDateInput(now);
  } else if (preset === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    filters.value.dateFrom = formatDateInput(startOfWeek);
    filters.value.dateTo = formatDateInput(new Date());
  } else if (preset === 'thisMonth') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    filters.value.dateFrom = formatDateInput(startOfMonth);
    filters.value.dateTo = formatDateInput(new Date());
  } else if (preset === 'thisYear') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    filters.value.dateFrom = formatDateInput(startOfYear);
    filters.value.dateTo = formatDateInput(new Date());
  } else if (preset === 'allTime') {
    filters.value.dateFrom = '';
    filters.value.dateTo = '';
  }
  if (preset !== 'custom') {
    void fetchData();
  }
}

function onCustomDateChange() {
  datePreset.value = 'custom';
  void fetchData();
}

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'no',
    label: t('finance.paymentDownload.columns.no'),
    field: 'no',
    align: 'center',
    sortable: true,
    style: 'width: 60px',
  },
  {
    name: 'paymentDate',
    label: t('finance.paymentDownload.columns.paymentDate'),
    field: 'paymentDate',
    align: 'center',
    sortable: true,
    style: 'width: 100px',
  },
  {
    name: 'paymentTime',
    label: t('finance.paymentDownload.columns.paymentTime'),
    field: 'paymentTime',
    align: 'center',
    sortable: true,
    style: 'width: 80px',
  },
  {
    name: 'learnerRef',
    label: t('finance.paymentDownload.columns.learnerRef'),
    field: 'learnerRef',
    align: 'center',
    sortable: true,
  },
  {
    name: 'appRef',
    label: t('finance.paymentDownload.columns.appRef'),
    field: 'appRef',
    align: 'center',
    sortable: true,
  },
  {
    name: 'payerName',
    label: t('finance.paymentDownload.columns.payerName'),
    field: 'payerName',
    align: 'center',
    sortable: true,
    style: 'min-width: 160px',
  },
  {
    name: 'learnerName',
    label: t('finance.paymentDownload.columns.learnerName'),
    field: 'learnerName',
    align: 'center',
    sortable: true,
  },
  {
    name: 'amount',
    label: t('finance.paymentDownload.columns.amount'),
    field: 'amount',
    align: 'center',
    sortable: true,
    style: 'width: 90px',
  },
  {
    name: 'courseInfo',
    label: t('finance.paymentDownload.columns.courseInfo'),
    field: 'courseInfo',
    align: 'center',
    sortable: true,
    style: 'min-width: 180px',
  },
  {
    name: 'receiptStatus',
    label: 'สถานะ',
    field: 'receiptIssued',
    align: 'center',
    sortable: true,
  },
]);

function formatPaymentDate(isoDate: string | null): string {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatPaymentTime(isoDate: string | null): string {
  if (!isoDate) return '00:00:00';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '00:00:00';
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${hour}:${minute}:${second}`;
}

function mapItem(item: PaymentNotificationApiItem, index: number): PaymentNotificationItem {
  return {
    id: item.id,
    no: index + 1,
    learnerRef: item.learnerRef,
    appRef: item.appRef,
    payerName: item.payerName || item.learnerName,
    learnerName: item.learnerName,
    paymentDate: formatPaymentDate(item.notifyDate || item.enrollDate),
    paymentTime: formatPaymentTime(item.notifyDate || item.enrollDate),
    amount: Number(item.amount) || 0,
    courseInfo: item.courseInfo,
    enrollDate: item.enrollDate,
    notifyDate: item.notifyDate,
    receiptIssued: item.receiptIssued,
  };
}

function clearFilters() {
  filters.value.dateFrom = '';
  filters.value.dateTo = '';
  filters.value.receiptStatus = 'All';
  datePreset.value = 'allTime';
  void fetchData();
}

async function fetchData() {
  isLoading.value = true;
  try {
    const params: Record<string, string | number | boolean> = {
      page: 1,
      pageSize: 500,
      status: 'Paid',
    };

    if (filters.value.dateFrom.trim()) {
      params.dateFrom = filters.value.dateFrom.trim();
    }
    if (filters.value.dateTo.trim()) {
      params.dateTo = filters.value.dateTo.trim();
    }
    if (filters.value.receiptStatus) {
      params.receiptStatus = filters.value.receiptStatus;
    }

    const { data } = await api.get<PaymentNotificationApiResponse>('/api/lltenroll', { params });
    const mapped = data.items.map(mapItem);
    tableData.value = mapped.filter((item) => item.amount > 0);
    tableData.value.forEach((item, index) => {
      item.no = index + 1;
    });
    pagination.value.page = 1;
  } catch (error: unknown) {
    console.error('Failed to load payment notifications', error);
    tableData.value = [];
    Notify.create({
      type: 'negative',
      message: t('finance.paymentDownload.loadError'),
      position: 'top',
    });
  } finally {
    isLoading.value = false;
  }
}

function escapeCsvValue(value: string | number): string {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function downloadCsv() {
  if (tableData.value.length === 0) return;

  const header = [
    t('finance.paymentDownload.layoutColumns.learnerRef'),
    t('finance.paymentDownload.layoutColumns.appRef'),
    t('finance.paymentDownload.layoutColumns.payerName'),
    t('finance.paymentDownload.layoutColumns.paymentDate'),
    t('finance.paymentDownload.layoutColumns.paymentTime'),
    t('finance.paymentDownload.layoutColumns.amount'),
  ].join(',');

  const rows = tableData.value.map((row) =>
    [
      escapeCsvValue(row.learnerRef),
      escapeCsvValue(row.appRef),
      escapeCsvValue(row.payerName),
      escapeCsvValue(row.paymentDate),
      escapeCsvValue(row.paymentTime),
      escapeCsvValue(row.amount.toFixed(2)),
    ].join(','),
  );

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = todayFormatted().replace(/\//g, '');
  link.href = url;
  link.download = `payment-notifications-${stamp}.csv`;
  link.click();
  URL.revokeObjectURL(url);

  Notify.create({
    type: 'positive',
    message: t('finance.paymentDownload.downloadSuccess', { count: tableData.value.length }),
    position: 'top',
  });
}

const sentinelRef = ref<HTMLElement | null>(null);
const filterStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

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
  transition: opacity 0.18s ease;

  &--inactive {
    opacity: 0.35;
    pointer-events: none;
  }
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

.admin-filter-bar__select {
  width: 220px;
  :deep(.q-field__control) {
    border-radius: 8px !important;
  }
}

.finance-payment-download-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass)) {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

.finance-payment-download-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
  border-color: var(--admin-line) !important;
  box-shadow: var(--admin-shadow-sm) !important;
}
.download-format-link {
  display: flex;
  justify-content: flex-start;
}

.payment-table-head {
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch !important;
  }
}

.payment-table-head__title {
  color: var(--admin-navy, #10233f);
}

.payment-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
  flex: 1 1 320px;

  @media (max-width: 600px) {
    flex: 1 1 100%;

    .payment-search-input-main {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.payment-search-input-main {
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

.payment-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(.q-table thead tr th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
    font-weight: 800;
    font-size: 0.8125rem;
    color: #475569;
    letter-spacing: 0.02em;
  }

  :deep(.q-table tbody tr:nth-child(even)) {
    background: rgba(248, 246, 241, 0.55);
  }

  :deep(.q-table tbody td) {
    font-size: 0.9rem;
  }

  :deep(.q-table__bottom) {
    border-top: 1px solid var(--admin-line, #e2e8f0);
  }
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

.layout-dialog-card {
  width: 640px;
  max-width: 95vw;
  border-radius: 16px;
}

.layout-table {
  :deep(th) {
    background: #f8fafc;
    font-weight: 700;
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
