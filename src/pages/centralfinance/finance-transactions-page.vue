<template>
  <q-page class="finance-page finance-transactions-page">
    <CentralFinancePageHero
      :eyebrow="$t('centralFinance.transactions.hero.eyebrow')"
      eyebrow-icon="gavel"
      :title="$t('centralFinance.transactions.hero.title')"
      :description="$t('centralFinance.transactions.hero.desc')"
    >
      <template #aside>
        <CentralFinanceScopeCard :label="activeFacultyLabel" />
      </template>
      <template #actions>
        <CentralFinanceActionButton
          icon="file_download"
          :label="$t('centralFinance.transactions.actions.exportAuditLog')"
          no-caps
          @click="onExportAuditLog"
        />
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- Advanced Search / Filters -->
      <div class="filter-section">
        <CentralFinanceSurfaceCard :accent="false" class="filter-card">
          <div class="filter-grid">
            <q-input
              v-model="search"
              outlined
              dense
              bg-color="white"
              :placeholder="$t('centralFinance.transactions.filters.search')"
              class="filter-item search-input"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="facultyFilter"
              :options="facultyOptions"
              outlined
              dense
              bg-color="white"
              :label="$t('centralFinance.transactions.filters.faculty')"
              class="filter-item"
              clearable
              emit-value
              map-options
            >
              <template #prepend>
                <q-icon name="business" />
              </template>
            </q-select>

            <q-input
              v-model="dateDisplay"
              outlined
              dense
              bg-color="white"
              :label="$t('centralFinance.transactions.filters.dateRange')"
              class="filter-item"
              mask="####/##/## - ####/##/##"
            >
              <template #prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="dateRange" mask="YYYY/MM/DD - YYYY/MM/DD" range>
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup :label="$t('close')" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <div class="filter-item text-right">
              <q-btn
                unelevated
                color="primary"
                icon="tune"
                class="filter-btn"
                style="height: 40px; width: 40px; border-radius: 10px"
              />
            </div>
          </div>
        </CentralFinanceSurfaceCard>
      </div>

      <!-- Transaction Table -->
      <CentralFinanceSurfaceCard :accent="false" body-padding="none">
        <q-table
          flat
          :rows="filteredTransactions"
          :columns="columns"
          row-key="id"
          class="transactions-table"
          :pagination="pagination"
        >
          <!-- Custom Status Column -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="getStatusColor(props.row.status)"
                class="status-badge q-px-sm q-py-xs"
                rounded
              >
                <q-icon :name="getStatusIcon(props.row.status)" size="14px" class="q-mr-xs" />
                {{ $t(`centralFinance.transactions.status.${props.row.status}`) }}
              </q-badge>
            </q-td>
          </template>

          <!-- Custom Amount Column -->
          <template #body-cell-amount="props">
            <q-td :props="props">
              {{ formatCurrency(props.row.amount) }}
            </q-td>
          </template>

          <!-- Custom Actions Column -->
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="onViewAuditLog(props.row)"
              >
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t('centralFinance.transactions.auditLog.viewAudit')
                }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="warning"
                icon="flag"
                @click="onFlagTransaction(props.row)"
              >
                <q-tooltip v-if="!$q.platform.is.mobile">{{
                  $t('centralFinance.transactions.auditLog.flagTx')
                }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </CentralFinanceSurfaceCard>
    </section>

    <!-- ── Audit Log Dialog ─────────────────────────────────── -->
    <q-dialog v-model="showAuditDialog">
      <CentralFinanceSurfaceCard
        :title="$t('centralFinance.transactions.auditLog.title')"
        body-padding="none"
        style="width: 500px; max-width: 90vw"
      >
        <template #header-actions>
          <q-btn icon="close" flat round dense v-close-popup />
        </template>

        <div v-if="selectedTx" class="q-pa-md">
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6">
              <div class="text-overline text-grey-7">
                {{ $t('centralFinance.transactions.table.receiptNumber') }}
              </div>
              <div class="text-subtitle1 text-weight-bold">{{ selectedTx.receiptNumber }}</div>
            </div>
            <div class="col-6">
              <div class="text-overline text-grey-7">
                {{ $t('centralFinance.transactions.table.status') }}
              </div>
              <q-badge
                :color="getStatusColor(selectedTx.status)"
                :label="$t(`centralFinance.transactions.status.${selectedTx.status}`)"
              />
            </div>
          </div>

          <q-separator spaced />

          <div class="text-subtitle2 q-mb-md text-primary">
            {{ $t('centralFinance.transactions.auditLog.history') }}
          </div>

          <q-timeline layout="dense" side="right" color="primary">
            <q-timeline-entry
              v-for="(log, idx) in mockAuditHistory"
              :key="idx"
              :title="log.action"
              :subtitle="log.time"
              :icon="log.icon"
              :color="log.color"
            >
              <div class="text-caption">{{ log.detail }}</div>
              <div class="text-caption text-grey-6 text-italic q-mt-xs">
                {{
                  log.by === 'system'
                    ? $t('centralFinance.transactions.auditLog.system')
                    : $t('centralFinance.transactions.auditLog.manual')
                }}
              </div>
            </q-timeline-entry>
          </q-timeline>

          <div v-if="mockAuditHistory.length === 0" class="text-center q-pa-lg text-grey-6">
            {{ $t('centralFinance.transactions.auditLog.noLogs') }}
          </div>
        </div>
      </CentralFinanceSurfaceCard>
    </q-dialog>

    <!-- ── Flag Confirmation Dialog ─────────────────────────── -->
    <q-dialog v-model="showFlagDialog" persistent>
      <q-card style="border-radius: 16px; min-width: 350px">
        <q-card-section class="row items-center q-pb-none">
          <q-avatar icon="flag" color="warning" text-color="white" />
          <span class="text-h6 q-ml-md">{{
            $t('centralFinance.transactions.auditLog.flagTitle')
          }}</span>
        </q-card-section>

        <q-card-section class="q-pt-md">
          {{
            $t('centralFinance.transactions.auditLog.flagConfirm', {
              id: selectedTx?.receiptNumber,
            })
          }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('centralFinance.transactions.auditLog.cancel')"
            color="grey-7"
            v-close-popup
            no-caps
          />
          <q-btn
            unelevated
            :label="$t('centralFinance.transactions.auditLog.confirm')"
            color="warning"
            @click="confirmFlag"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceScopeCard from 'components/centralfinance/CentralFinanceScopeCard.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import CentralFinanceActionButton from 'components/centralfinance/CentralFinanceActionButton.vue';
import { useCentralFinanceStore, type Transaction } from 'src/stores/central-finance-store';

const { t, locale } = useI18n();
const $q = useQuasar();
const financeStore = useCentralFinanceStore();

const search = ref<string>('');
const facultyFilter = ref<string | null>(null);

interface DateRange {
  from: string;
  to: string;
}

type QuasarDateValue = string | DateRange | null;
const dateRange = ref<QuasarDateValue>(null);

const dateDisplay = computed<string>({
  get(): string {
    if (!dateRange.value) return '';
    if (typeof dateRange.value === 'string') return dateRange.value;
    return `${dateRange.value.from} - ${dateRange.value.to}`;
  },
  set(val: string): void {
    dateRange.value = val;
  },
});

const facultyOptions = computed(() => [
  { label: t('common.faculties.informatics'), value: 'คณะวิทยาการสารสนเทศ' },
  { label: t('common.faculties.science'), value: 'คณะวิทยาศาสตร์' },
  { label: t('common.faculties.nursing'), value: 'คณะพยาบาลศาสตร์' },
  { label: t('common.faculties.business'), value: 'คณะบริหารธุรกิจ' },
  { label: t('common.faculties.engineering'), value: 'คณะวิศวกรรมศาสตร์' },
  { label: t('common.faculties.computerCenter'), value: 'สำนักคอมพิวเตอร์' },
]);

const activeFacultyLabel = computed<string>(() => {
  if (!facultyFilter.value) return t('centralFinance.receiptSummary.allFaculties');
  return (
    facultyOptions.value.find((o) => o.value === facultyFilter.value)?.label ?? facultyFilter.value
  );
});

const pagination = ref({
  rowsPerPage: 10,
});

const showAuditDialog = ref<boolean>(false);
const showFlagDialog = ref<boolean>(false);
const selectedTx = ref<Transaction | null>(null);

interface AuditLogEntry {
  action: string;
  time: string;
  detail: string;
  icon: string;
  color: string;
  by: 'system' | 'user';
}

const mockAuditHistory = computed<AuditLogEntry[]>(() => {
  if (!selectedTx.value) return [];

  const entries: AuditLogEntry[] = [
    {
      action: t('centralFinance.transactions.auditLog.events.created'),
      time: selectedTx.value.timestamp,
      detail: t('centralFinance.transactions.auditLog.events.createdDetail'),
      icon: 'add_circle',
      color: 'teal',
      by: 'system',
    },
  ];

  if (selectedTx.value.status === 'flagged') {
    entries.unshift({
      action: t('centralFinance.transactions.auditLog.events.flagged'),
      time: new Date().toLocaleString(locale.value === 'th' ? 'th-TH' : 'en-US'),
      detail: t('centralFinance.transactions.auditLog.events.flaggedDetail'),
      icon: 'flag',
      color: 'warning',
      by: 'user',
    });
  }

  return entries;
});

const columns = computed<QTableColumn[]>(() => [
  {
    name: 'timestamp',
    label: t('centralFinance.transactions.table.timestamp'),
    field: 'timestamp',
    align: 'left',
    sortable: true,
  },
  {
    name: 'receiptNumber',
    label: t('centralFinance.transactions.table.receiptNumber'),
    field: 'receiptNumber',
    align: 'left',
    sortable: true,
  },
  {
    name: 'payerName',
    label: t('centralFinance.transactions.table.payer'),
    field: 'payerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: t('centralFinance.transactions.table.amount'),
    field: 'amount',
    align: 'right',
    sortable: true,
  },
  {
    name: 'fundCode',
    label: t('centralFinance.transactions.table.fundCode'),
    field: 'fundCode',
    align: 'center',
  },
  {
    name: 'faculty',
    label: t('centralFinance.transactions.table.faculty'),
    field: 'faculty',
    align: 'left',
  },
  {
    name: 'status',
    label: t('centralFinance.transactions.table.status'),
    field: 'status',
    align: 'center',
  },
  {
    name: 'actions',
    label: t('centralFinance.transactions.table.actions'),
    field: 'id',
    align: 'center',
  },
]);

const filteredTransactions = computed<Transaction[]>(() => {
  return financeStore.transactions.filter((tx: Transaction) => {
    // Search filter
    const matchesSearch =
      !search.value ||
      tx.receiptNumber.toLowerCase().includes(search.value.toLowerCase()) ||
      tx.payerName.toLowerCase().includes(search.value.toLowerCase());

    // Faculty filter
    const matchesFaculty = !facultyFilter.value || tx.faculty === facultyFilter.value;

    // Date range filter
    let matchesDate = true;
    if (dateRange.value) {
      const ts = tx.timestamp || '';
      const txDate = ts.split(' ')[0]?.replace(/-/g, '/') || '';

      if (typeof dateRange.value === 'string') {
        if (dateRange.value.includes(' - ')) {
          const [start, end] = dateRange.value.split(' - ');
          matchesDate = txDate >= (start || '') && txDate <= (end || '');
        } else {
          matchesDate = txDate === dateRange.value;
        }
      } else if (dateRange.value && typeof dateRange.value === 'object') {
        // Quasar date range object { from, to }
        const { from, to } = dateRange.value;
        matchesDate = txDate >= from && txDate <= to;
      }
    }

    return matchesSearch && matchesFaculty && matchesDate;
  });
});

function onExportAuditLog(): void {
  $q.loading.show({
    message: t('centralFinance.dashboard.activities.items.exportSuccess'),
    spinnerColor: 'white',
    backgroundColor: 'primary',
    messageColor: 'white',
  });

  setTimeout(() => {
    // Mock CSV generation
    const headers: string[] = [
      t('centralFinance.transactions.table.timestamp'),
      t('centralFinance.transactions.table.receiptNumber'),
      t('centralFinance.transactions.table.payer'),
      t('centralFinance.transactions.table.amount'),
      t('centralFinance.transactions.table.fundCode'),
      t('centralFinance.transactions.table.faculty'),
      t('centralFinance.transactions.table.status'),
    ];

    const rows: (string | number)[][] = filteredTransactions.value.map((tx) => [
      tx.timestamp,
      tx.receiptNumber,
      tx.payerName,
      tx.amount,
      tx.fundCode,
      tx.faculty,
      t(`centralFinance.transactions.status.${tx.status}`),
    ]);

    const csvContent: string = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob: Blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url: string = URL.createObjectURL(blob);
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    $q.loading.hide();
    $q.notify({
      type: 'positive',
      message: t('centralFinance.transactions.actions.exportAuditLog') + ' ' + t('success'),
      icon: 'file_download',
    });
  }, 1500);
}

function onViewAuditLog(row: Transaction): void {
  selectedTx.value = row;
  showAuditDialog.value = true;
}

function onFlagTransaction(row: Transaction): void {
  if (row.status === 'flagged') {
    $q.notify({
      type: 'info',
      message: t('centralFinance.transactions.auditLog.alreadyFlagged'),
      icon: 'info',
    });
    return;
  }
  selectedTx.value = row;
  showFlagDialog.value = true;
}

function confirmFlag(): void {
  if (selectedTx.value) {
    financeStore.updateTransactionStatus(selectedTx.value.id, 'flagged');
    $q.notify({
      type: 'positive',
      message: t('centralFinance.transactions.auditLog.flagSuccess'),
      icon: 'check_circle',
    });
    showFlagDialog.value = false;
  }
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
}

function getStatusColor(status: Transaction['status']): string {
  switch (status) {
    case 'valid':
      return 'positive';
    case 'flagged':
      return 'warning';
    case 'void':
      return 'negative';
    default:
      return 'grey';
  }
}

function getStatusIcon(status: Transaction['status']): string {
  switch (status) {
    case 'valid':
      return 'check_circle';
    case 'flagged':
      return 'report_problem';
    case 'void':
      return 'cancel';
    default:
      return 'help';
  }
}
</script>

<style lang="scss" scoped>
.finance-transactions-page {
  .filter-section {
    margin-bottom: 24px;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: 2fr 1.2fr 1.2fr 44px;
    gap: 16px;
    align-items: center;
  }

  .transactions-table {
    background: transparent;

    :deep(.q-table__card) {
      box-shadow: none;
    }

    :deep(thead tr th) {
      font-weight: 800;
      color: var(--finance-navy);
      background: #f8fafc;
      font-size: 0.88rem;
      padding: 16px;
    }

    :deep(tbody tr td) {
      padding: 16px;
      font-size: 0.94rem;
    }

    :deep(tbody tr:hover) {
      background: rgba(16, 35, 63, 0.02);
    }
  }

  .status-badge {
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
}

@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
