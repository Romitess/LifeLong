<template>
  <q-page class="admin-page finance-daily-report-page">
    <AdminPageHero
      :eyebrow="$t('centralFinance.dailyReport.hero.eyebrow')"
      eyebrow-icon="account_balance_wallet"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    >
      <template #actions>
        <div class="row items-center q-gutter-sm">
          <q-btn
            unelevated
            color="white"
            text-color="primary"
            icon="today"
            label="15 May 2026"
            class="report-date-btn"
          />
          <AdminActionButton variant="secondary" icon="print" label="Print Report" no-caps />
        </div>
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <!-- Summary Metrics Row -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <!-- Net Total Main Card -->
        <div class="col-12 col-lg-7">
          <AdminSurfaceCard :accent="true" card-class="net-total-card">
            <div class="row items-center no-wrap">
              <div class="net-total-card__icon q-mr-lg">
                <q-icon name="payments" size="42px" color="primary" />
              </div>
              <div class="column">
                <span class="text-overline text-grey-7">{{
                  $t('centralFinance.dailyReport.summary.totalNet')
                }}</span>
                <div class="row items-baseline">
                  <h2 class="text-h3 text-weight-bolder text-primary q-my-none">
                    {{ formatCurrency(netTotal) }}
                  </h2>
                  <span class="text-subtitle1 text-grey-6 q-ml-sm">THB</span>
                </div>
                <div class="row items-center q-mt-sm">
                  <q-icon name="info" size="16px" color="grey-6" class="q-mr-xs" />
                  <span class="text-caption text-grey-6">
                    {{ $t('centralFinance.dailyReport.summary.deducted') }} ({{
                      formatCurrency(voidTotal)
                    }})
                  </span>
                </div>
              </div>
            </div>
          </AdminSurfaceCard>
        </div>

        <!-- Void Summary Card -->
        <div class="col-12 col-lg-5">
          <AdminSurfaceCard card-class="void-summary-card h-full">
            <div class="column justify-between h-full">
              <div class="row justify-between items-center q-mb-md">
                <span class="text-subtitle2 text-weight-bold text-grey-8">
                  {{ $t('centralFinance.dailyReport.summary.voidCount') }}
                </span>
                <q-badge color="negative" class="q-px-sm">{{ voidCount }} รายการ</q-badge>
              </div>
              <q-separator class="q-my-sm" />
              <div class="row justify-between items-center q-mt-md">
                <span class="text-caption text-grey-7">{{
                  $t('centralFinance.dailyReport.summary.totalGross')
                }}</span>
                <span class="text-subtitle1 text-weight-bold text-grey-9">{{
                  formatCurrency(grossTotal)
                }}</span>
              </div>
            </div>
          </AdminSurfaceCard>
        </div>
      </div>

      <!-- Channel Breakdown -->
      <div class="q-mb-xl">
        <h3 class="text-h6 text-weight-bold q-mb-lg row items-center">
          <q-icon name="bar_chart" color="primary" class="q-mr-sm" />
          {{ $t('centralFinance.dailyReport.channels.title') }}
        </h3>
        <div class="row q-col-gutter-lg">
          <div v-for="channel in channelBreakdown" :key="channel.key" class="col-12 col-md-4">
            <AdminSurfaceCard card-class="channel-card">
              <div class="column">
                <div class="row items-center q-mb-md">
                  <div class="channel-icon" :class="`channel-icon--${channel.key}`">
                    <q-icon :name="channel.icon" size="24px" />
                  </div>
                  <span class="text-subtitle2 text-weight-bold q-ml-sm">{{
                    $t(`centralFinance.dailyReport.channels.${channel.key}`)
                  }}</span>
                </div>
                <div class="row justify-between items-end">
                  <div class="column">
                    <span class="text-caption text-grey-6">ยอดรวม</span>
                    <span class="text-h5 text-weight-bolder">{{
                      formatCurrency(channel.amount)
                    }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-caption text-grey-6">{{ channel.count }} รายการ</div>
                    <div class="text-weight-bold text-primary">{{ channel.percent }}%</div>
                  </div>
                </div>
                <q-linear-progress
                  :value="channel.percent / 100"
                  :color="channel.color"
                  rounded
                  size="6px"
                  class="q-mt-md bg-grey-2"
                />
              </div>
            </AdminSurfaceCard>
          </div>
        </div>
      </div>

      <!-- Detail Table -->
      <AdminSurfaceCard :title="$t('centralFinance.dailyReport.table.title')" body-padding="none">
        <q-table
          flat
          :rows="todayTransactions"
          :columns="columns"
          row-key="id"
          class="report-table"
        >
          <template #header-cell="props">
            <q-th :props="props" class="report-table__header">
              {{ props.col.label }}
            </q-th>
          </template>

          <template #body-cell-channel="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-icon
                  :name="getChannelIcon(props.row.paymentChannel)"
                  size="18px"
                  :color="getChannelColor(props.row.paymentChannel)"
                  class="q-mr-sm"
                />
                {{ $t(`centralFinance.dailyReport.channels.${props.row.paymentChannel}`) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props">
              <div
                :class="
                  props.row.status === 'void' ? 'text-strike text-grey-5' : 'text-weight-bold'
                "
              >
                {{ formatCurrency(props.row.amount) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-badge v-if="props.row.status === 'void'" color="negative" outline class="q-px-sm">
                VOIDED
              </q-badge>
              <q-icon v-else name="check_circle" color="positive" size="18px" />
            </q-td>
          </template>
        </q-table>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

import type { QTableColumn } from 'quasar';
import type { Transaction } from 'src/stores/central-finance-store';
const financeStore = useCentralFinanceStore();

const todayTransactions = computed<Transaction[]>(() => {
  // Mock filter for today (2026-05-15)
  return financeStore.transactions.filter((tx: Transaction) => tx.timestamp.includes('2026-05-15'));
});

const grossTotal = computed<number>(() => {
  return todayTransactions.value.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
});

const voidTotal = computed<number>(() => {
  return todayTransactions.value
    .filter((tx: Transaction) => tx.status === 'void')
    .reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
});

const netTotal = computed<number>(() => grossTotal.value - voidTotal.value);
const voidCount = computed<number>(
  () => todayTransactions.value.filter((tx: Transaction) => tx.status === 'void').length,
);

interface ChannelSummary {
  key: 'transfer' | 'cash' | 'qrcode';
  icon: string;
  color: string;
  amount: number;
  count: number;
  percent: number;
}

const channelBreakdown = computed<ChannelSummary[]>(() => {
  const activeTx = todayTransactions.value.filter((tx: Transaction) => tx.status !== 'void');
  const totalActive = activeTx.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0) || 1;

  const channels: { key: 'transfer' | 'cash' | 'qrcode'; icon: string; color: string }[] = [
    { key: 'transfer', icon: 'account_balance', color: 'primary' },
    { key: 'cash', icon: 'payments', color: 'secondary' },
    { key: 'qrcode', icon: 'qr_code_2', color: 'accent' },
  ];

  return channels.map((c) => {
    const channelTx = activeTx.filter((tx: Transaction) => tx.paymentChannel === c.key);
    const amount = channelTx.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
    return {
      ...c,
      amount,
      count: channelTx.length,
      percent: Math.round((amount / totalActive) * 100),
    };
  });
});

const columns: QTableColumn[] = [
  { name: 'timestamp', label: 'เวลา', field: 'timestamp', align: 'left', sortable: true },
  {
    name: 'receiptNumber',
    label: 'เลขที่ใบเสร็จ',
    field: 'receiptNumber',
    align: 'left',
    sortable: true,
  },
  { name: 'payerName', label: 'ผู้ชำระเงิน', field: 'payerName', align: 'left', sortable: true },
  { name: 'channel', label: 'ช่องทาง', field: 'paymentChannel', align: 'left' },
  { name: 'amount', label: 'จำนวนเงิน', field: 'amount', align: 'right', sortable: true },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(val);
}

function getChannelIcon(channel: string): string {
  switch (channel) {
    case 'transfer':
      return 'account_balance';
    case 'cash':
      return 'payments';
    case 'qrcode':
      return 'qr_code_2';
    default:
      return 'help';
  }
}

function getChannelColor(channel: string): string {
  switch (channel) {
    case 'transfer':
      return 'primary';
    case 'cash':
      return 'secondary';
    case 'qrcode':
      return 'accent';
    default:
      return 'grey';
  }
}
</script>

<style lang="scss" scoped>
.finance-daily-report-page {
  .report-date-btn {
    border-radius: 12px;
    font-weight: 700;
  }

  .net-total-card {
    background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%);

    &__icon {
      width: 84px;
      height: 84px;
      border-radius: 24px;
      background: rgba(var(--q-primary), 0.08);
      display: grid;
      place-items: center;
    }
  }

  .channel-card {
    transition: transform 0.2s ease;
    &:hover {
      transform: translateY(-4px);
    }
  }

  .channel-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;

    &--transfer {
      background: rgba($primary, 0.1);
      color: $primary;
    }
    &--cash {
      background: rgba($secondary, 0.1);
      color: $secondary;
    }
    &--qrcode {
      background: rgba($accent, 0.1);
      color: $accent;
    }
  }

  .report-table {
    &__header {
      font-weight: 800;
      color: var(--admin-muted);
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.1em;
    }
  }
}

.h-full {
  height: 100%;
}
</style>
