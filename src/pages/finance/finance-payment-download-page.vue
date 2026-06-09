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
      <AppSurfaceCard>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-lg-8 offset-lg-2">
            <div class="download-format-link q-mb-md">
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                icon="article"
                :label="$t('finance.paymentDownload.viewLayoutFormat')"
                @click="showLayoutDialog = true"
              />
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('finance.paymentDownload.statementDate') }}
              </div>
              <div class="col-12 col-sm-8 row q-col-gutter-sm">
                <div class="col-6">
                  <q-input
                    v-model="filters.dateFrom"
                    outlined
                    dense
                    :label="$t('finance.paymentDownload.dateFrom')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template #append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.dateFrom"
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
                    v-model="filters.dateTo"
                    outlined
                    dense
                    :label="$t('finance.paymentDownload.dateTo')"
                    placeholder="วว/ดด/ปปปป"
                    mask="##/##/####"
                    class="bg-white"
                  >
                    <template #append>
                      <q-icon name="event" class="cursor-pointer" color="grey-7">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date
                            v-model="filters.dateTo"
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

            <div class="row items-center q-mb-md">
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
              <div class="col-12 col-sm-8">
                <div class="text-caption text-grey-7">
                  {{ $t('finance.paymentDownload.dateHint') }}
                </div>
              </div>
            </div>

            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('finance.paymentDownload.searchBtn')"
                  unelevated
                  class="q-px-xl"
                  :loading="isLoading"
                  @click="fetchData"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('finance.paymentDownload.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </AppSurfaceCard>

      <AppSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <q-btn
            unelevated
            color="positive"
            icon="download"
            :label="$t('finance.paymentDownload.downloadCsv')"
            :disable="tableData.length === 0"
            @click="downloadCsv"
          />
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

    <q-dialog v-model="showLayoutDialog">
      <q-card class="layout-dialog-card">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('finance.paymentDownload.layoutDialogTitle') }}</div>
          <q-space />
          <q-btn v-close-popup icon="close" flat round dense />
        </q-card-section>

        <q-card-section>
          <p class="text-body2 text-grey-8 q-mb-md">
            {{ $t('finance.paymentDownload.layoutDialogDescription') }}
          </p>
          <q-markup-table flat bordered separator="cell" class="layout-table">
            <thead>
              <tr>
                <th>{{ $t('finance.paymentDownload.layoutColumns.order') }}</th>
                <th>{{ $t('finance.paymentDownload.layoutColumns.name') }}</th>
                <th>{{ $t('finance.paymentDownload.layoutColumns.example') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="col in layoutColumns" :key="col.order">
                <td class="text-center">{{ col.order }}</td>
                <td>{{ col.name }}</td>
                <td class="text-grey-8">{{ col.example }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/admin/AppPageHero.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
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
}

interface PaymentNotificationApiResponse {
  items: PaymentNotificationApiItem[];
}

const search = ref('');
const tableData = ref<PaymentNotificationItem[]>([]);
const isLoading = ref(false);
const showLayoutDialog = ref(false);

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

function threeMonthsAgoFormatted(): string {
  const now = new Date();
  return formatDateInput(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()));
}

const filters = ref({
  dateFrom: threeMonthsAgoFormatted(),
  dateTo: todayFormatted(),
});

const layoutColumns = computed(() => [
  {
    order: 1,
    name: t('finance.paymentDownload.layoutColumns.learnerRef'),
    example: '6700017',
  },
  {
    order: 2,
    name: t('finance.paymentDownload.layoutColumns.appRef'),
    example: '6751300100003',
  },
  {
    order: 3,
    name: t('finance.paymentDownload.layoutColumns.payerName'),
    example: 'นายสมชาย ใจดี',
  },
  {
    order: 4,
    name: t('finance.paymentDownload.layoutColumns.paymentDate'),
    example: '09-06-2026',
  },
  {
    order: 5,
    name: t('finance.paymentDownload.layoutColumns.paymentTime'),
    example: '14:30:00',
  },
  {
    order: 6,
    name: t('finance.paymentDownload.layoutColumns.amount'),
    example: '1500.00',
  },
]);

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
  };
}

function clearFilters() {
  filters.value.dateFrom = threeMonthsAgoFormatted();
  filters.value.dateTo = todayFormatted();
}

async function fetchData() {
  isLoading.value = true;
  try {
    const params: Record<string, string | number | boolean> = {
      page: 1,
      pageSize: 500,
      notifyOnly: true,
    };

    if (filters.value.dateFrom.trim()) {
      params.dateFrom = filters.value.dateFrom.trim();
    }
    if (filters.value.dateTo.trim()) {
      params.dateTo = filters.value.dateTo.trim();
    }

    const { data } = await api.get<PaymentNotificationApiResponse>('/api/lltenroll', { params });
    tableData.value = data.items.map(mapItem);
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

onMounted(() => {
  void fetchData();
});
</script>

<style lang="scss" scoped>
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
