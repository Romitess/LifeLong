<template>
  <q-page class="admin-page finance-receipts-page">
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('finance.receipts.title')"
      :description="$t('finance.receipts.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ currentUserFaculty || 'ไม่ระบุคณะ' }}</div>
        </div>
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <AppSurfaceCard :title="$t('finance.receipts.allReceipts')" card-class="q-pa-none">
        <template #header-actions>
          <q-input
            v-model="search"
            dense
            outlined
            rounded
            :placeholder="$t('finance.receipts.searchPlaceholder')"
            class="receipt-search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn flat round icon="filter_list" color="primary" />
        </template>

        <q-table
          :rows="mockReceipts"
          :columns="columns"
          row-key="id"
          flat
          :filter="search"
          class="receipt-table"
        >
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge
                :color="props.value === 'Paid' ? 'positive' : 'warning'"
                :label="props.value"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn flat round dense icon="visibility" color="primary">
                <q-tooltip>{{ $t('finance.receipts.viewDetails') }}</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="print" color="grey-7">
                <q-tooltip>{{ $t('finance.receipts.printReceipt') }}</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </AppSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import { ref, computed } from 'vue';
import type { QTableProps } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();

const currentUserFaculty = computed(
  () => authStore.user?.facName || authStore.user?.faculty || 'ไม่ระบุคณะ',
);

const search = ref('');

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'id',
    label: t('finance.receipts.columns.receiptNo'),
    field: 'id',
    align: 'left',
    sortable: true,
  },
  {
    name: 'date',
    label: t('finance.receipts.columns.paymentDate'),
    field: 'date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'learner',
    label: t('finance.receipts.columns.learner'),
    field: 'learner',
    align: 'left',
    sortable: true,
  },
  {
    name: 'course',
    label: t('finance.receipts.columns.courseCode'),
    field: 'course',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: t('finance.receipts.columns.amount'),
    field: 'amount',
    align: 'right',
    sortable: true,
  },
  { name: 'status', label: t('finance.receipts.columns.status'), field: 'status', align: 'center' },
  {
    name: 'actions',
    label: t('finance.receipts.columns.actions'),
    field: 'actions',
    align: 'center',
  },
]);

const mockReceipts = [
  {
    id: 'REC-69001',
    date: '2026-05-08',
    learner: 'สมชาย ใจดี',
    course: '888101',
    amount: '฿1,200',
    status: 'Paid',
  },
  {
    id: 'REC-69002',
    date: '2026-05-08',
    learner: 'วิภาวี สุขใจ',
    course: '888203',
    amount: '฿3,500',
    status: 'Paid',
  },
  {
    id: 'REC-68999',
    date: '2026-05-07',
    learner: 'กิตติพงษ์ มั่นคง',
    course: '888101',
    amount: '฿1,200',
    status: 'Paid',
  },
  {
    id: 'REC-68998',
    date: '2026-05-07',
    learner: 'ธนากร รักเรียน',
    course: '999101',
    amount: '฿0',
    status: 'Paid',
  },
  {
    id: 'REC-68995',
    date: '2026-05-06',
    learner: 'นารี มีสุข',
    course: '777102',
    amount: '฿2,900',
    status: 'Pending',
  },
];
</script>

<style lang="scss" scoped>
.receipt-search {
  width: 300px;
}

.receipt-table {
  :deep(.q-table__card) {
    box-shadow: none;
  }
  :deep(thead tr) {
    background: #f8fafc;
  }
  :deep(th) {
    font-weight: 800;
    color: #475569;
    font-size: 0.9rem;
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
</style>
