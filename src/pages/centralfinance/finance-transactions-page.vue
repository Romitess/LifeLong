<template>
  <q-page class="admin-page finance-transactions-page">
    <AdminPageHero
      :eyebrow="$t('centralFinance.transactions.hero.eyebrow')"
      eyebrow-icon="gavel"
      :title="$t('centralFinance.transactions.hero.title')"
      :description="$t('centralFinance.transactions.hero.desc')"
    >
      <template #actions>
        <AdminActionButton
          variant="secondary"
          icon="file_download"
          label="Export Audit Log"
          no-caps
        />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <!-- Advanced Search / Filters -->
      <div class="filter-section q-mb-lg">
        <AdminSurfaceCard class="filter-card">
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-5">
              <q-input
                v-model="search"
                outlined
                dense
                bg-color="white"
                :placeholder="$t('centralFinance.transactions.filters.search')"
                class="search-input"
              >
                <template #prepend>
                  <q-icon name="search" color="black" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="facultyFilter"
                outlined
                dense
                bg-color="white"
                :options="facultyOptions"
                :label="$t('centralFinance.transactions.filters.faculty')"
                clearable
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="dateRange"
                outlined
                dense
                bg-color="white"
                mask="####/##/## - ####/##/##"
                :placeholder="$t('centralFinance.transactions.filters.dateRange')"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-1">
              <q-btn
                unelevated
                color="primary"
                icon="tune"
                class="full-width"
                style="height: 40px; border-radius: 8px"
              />
            </div>
          </div>
        </AdminSurfaceCard>
      </div>

      <!-- Transaction Table -->
      <AdminSurfaceCard :accent="true" body-padding="none">
        <q-table
          flat
          :rows="filteredTransactions"
          :columns="columns"
          row-key="id"
          class="transactions-table"
          :pagination="{ rowsPerPage: 10 }"
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
            <q-td :props="props" class="text-weight-bold">
              {{ formatCurrency(props.row.amount) }}
            </q-td>
          </template>

          <!-- Custom Actions Column -->
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn flat round dense color="grey-7" icon="more_vert">
                <q-menu auto-close>
                  <q-list style="min-width: 150px">
                    <q-item clickable>
                      <q-item-section avatar
                        ><q-icon name="visibility" color="primary"
                      /></q-item-section>
                      <q-item-section>View Audit Log</q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section avatar><q-icon name="flag" color="warning" /></q-item-section>
                      <q-item-section>Flag Transaction</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import { useCentralFinanceStore, type Transaction } from 'src/stores/central-finance-store';

const { t } = useI18n();
const financeStore = useCentralFinanceStore();

const search = ref<string>('');
const facultyFilter = ref<string | null>(null);
const dateRange = ref<string>('');

const facultyOptions: string[] = [
  'คณะวิทยาการสารสนเทศ',
  'คณะวิทยาศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะวิศวกรรมศาสตร์',
  'สำนักคอมพิวเตอร์',
];

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
    const matchesSearch =
      !search.value ||
      tx.receiptNumber.toLowerCase().includes(search.value.toLowerCase()) ||
      tx.payerName.toLowerCase().includes(search.value.toLowerCase());

    const matchesFaculty = !facultyFilter.value || tx.faculty === facultyFilter.value;

    return matchesSearch && matchesFaculty;
  });
});

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
  .search-input {
    :deep(.q-field__control) {
      border-radius: 12px;
    }
  }

  .status-badge {
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .transactions-table {
    background: transparent;

    :deep(thead tr th) {
      font-weight: 800;
      color: var(--admin-muted);
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    :deep(tbody tr:hover) {
      background: rgba(var(--q-primary), 0.03);
    }
  }
}
</style>
