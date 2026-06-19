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
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
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
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
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
              <div class="col-12 col-sm-4 text-weight-medium filter-label">
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
              <div class="col-sm-4 gt-xs" />
              <div class="col-12 col-sm-8 filter-section__actions">
                <AppActionButton
                  variant="primary"
                  icon="search"
                  :label="$t('finance.receiptSummary.filters.searchBtn')"
                  :loading="isLoading"
                  @click="fetchData"
                />
                <AppActionButton
                  variant="secondary"
                  icon="restart_alt"
                  :label="$t('finance.receiptSummary.filters.clearBtn')"
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
          <ReportExportActions
            :pdf-label="$t('finance.receiptSummary.exportPdf')"
            :excel-label="$t('finance.receiptSummary.exportExcel')"
            @export-pdf="handleExportToPdf"
            @export-excel="handleExportToExcel"
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

        <div class="receipt-table-wrapper">
          <q-table
            :rows="items"
            :columns="columns"
            row-key="id"
            flat
            dense
            :filter="search"
            :loading="isLoading"
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
              <div class="receipt-pagination q-py-sm">
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
                      items.length > 0
                        ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                        : 0
                    }}-{{
                      Math.min(scope.pagination.page * scope.pagination.rowsPerPage, items.length)
                    }}
                    of {{ items.length }}
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
        </div>
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
import { useReceiptSummaryReport } from 'src/composables/use-receipt-summary-report';
import { useReceiptSummaryExport } from 'src/composables/use-receipt-summary-export';
import type { ApiFaculty } from 'src/types/faculty';
import type { ReceiptSummaryItem } from 'src/types/receipt-summary-report';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import ReportExportActions from 'components/common/ReportExportActions.vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';

const { t } = useI18n();

const { isLoading: isFacultyLoading, fetchFaculties } = useFacultyList();
const { items, isLoading, filters, fetchData, clearFilters } = useReceiptSummaryReport();
const { exportToPdf, exportToExcel } = useReceiptSummaryExport();

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

async function downloadReceipt(row: ReceiptSummaryItem): Promise<void> {
  selectedReceipt.value = row;
  await nextTick();
  receiptDialogRef.value?.downloadReceiptPdf();
}

async function handleExportToPdf(): Promise<void> {
  await exportToPdf(
    items.value,
    t('centralFinance.receiptSummary.reportTitle'),
    t('centralFinance.receiptSummary.filters.faculty'),
    activeFacultyScopeLabel.value,
  );
}

function handleExportToExcel(): void {
  exportToExcel(items.value, t('centralFinance.receiptSummary.reportTitle'));
}

onMounted(async () => {
  faculties.value = await fetchFaculties();
  await fetchData();
});
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

.table-export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.receipt-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;

  .receipt-table {
    min-width: 900px;
  }
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

.receipt-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;

  @media (max-width: 599px) {
    justify-content: center;
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}

:deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
}
</style>
