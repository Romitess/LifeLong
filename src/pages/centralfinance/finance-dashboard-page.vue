<template>
  <q-page class="finance-page finance-dashboard-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <CentralFinancePageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="account_balance"
      :title="$t('centralFinance.dashboard.hero.title')"
      :description="$t('centralFinance.dashboard.hero.desc')"
    />

    <!-- ── Content ───────────────────────────────────────────── -->
    <section class="finance-shell finance-content">
      <PeriodFilterBar v-model="period" @change="fetchDashboardData" />

      <!-- ── Row 1: KPI Metric Cards ─────────────────────────── -->
      <div class="finance-stat-grid">
        <CentralFinanceMetricCard
          v-for="stat in metricCards"
          :key="stat.label"
          :icon="stat.icon"
          :value="stat.value"
          :label="stat.label"
          :icon-color="stat.color"
          :icon-tint="stat.tint"
        />
      </div>

      <!-- ── Row 2: Revenue Chart + Faculty Breakdown ──────────── -->
      <div class="finance-main-grid">
        <!-- Revenue Trend -->
        <CentralFinanceSurfaceCard
          eyebrow="Revenue Trend"
          title="แนวโน้มรายรับรวม"
          :subtitle="dateRangeLabel || 'ทั้งหมด'"
          card-class="finance-panel"
        >
          <div class="chart-block__header">
            <span class="chart-block__title">รายรับรวมทุกคณะ/ส่วนงาน (บาท)</span>
          </div>
          <AppAreaChart
            :series="revenueChartSeries"
            :x-labels="trendChartLabels"
            :height="280"
            :format-y-tick="formatRevenueTick"
            aria-label="รายรับรวมทุกคณะ"
          />
        </CentralFinanceSurfaceCard>

        <!-- Faculty Revenue Breakdown -->
        <CentralFinanceSurfaceCard
          eyebrow="By Faculty"
          title="ยอดรายรับตามคณะ/ส่วนงาน"
          card-class="finance-panel"
        >
          <div v-if="topFaculties.length === 0" class="breakdown-empty">
            <q-icon name="bar_chart" size="42px" color="grey-4" />
            <p>ไม่มีข้อมูลรายรับ</p>
          </div>
          <div v-else class="faculty-breakdown-list">
            <div
              v-for="(item, i) in topFaculties"
              :key="item.faculty"
              class="faculty-breakdown-item"
            >
              <div class="faculty-breakdown-item__rank">#{{ i + 1 }}</div>
              <div class="faculty-breakdown-item__info">
                <div class="faculty-breakdown-item__name">{{ item.faculty }}</div>
                <div class="faculty-breakdown-item__track">
                  <div
                    class="faculty-breakdown-item__fill"
                    :style="{ width: `${item.percent}%` }"
                  />
                </div>
              </div>
              <div class="faculty-breakdown-item__amount">
                {{ formatCurrency(item.totalAmount) }}
              </div>
            </div>
          </div>
        </CentralFinanceSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppAreaChart, { type AreaChartSeries } from 'components/common/AppAreaChart.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import { api } from 'src/boot/axios';
import { formatCompactCurrency } from 'src/utils/course-format';
import type { ReceiptUsageResponse } from 'src/types/receipt-usage-report';

const financeStore = useCentralFinanceStore();

// ── Sticky Filter Bar ────────────────────────────────────────
const period = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });

const dateRangeLabel = computed(() => {
  const { dateFrom, dateTo } = period.value;
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return `${dateFrom} - ${dateTo}`;
  }
  return dateFrom || '';
});

// ── Dashboard API Data ───────────────────────────────────────
const dashboardStats = ref({
  totalRevenue: 0,
  totalReceipts: 0,
  onlinePayments: 0,
  voidReceipts: 0,
});

const trendData = ref<{ months: string[]; revenue: number[] }>({
  months: [],
  revenue: [],
});

const facultyData = ref<{ faculty: string; totalAmount: number }[]>([]);

async function fetchDashboardData() {
  const params: Record<string, string> =
    period.value.preset === 'allTime'
      ? { period: 'allTime' }
      : { period: 'custom', dateFrom: period.value.dateFrom, dateTo: period.value.dateTo };

  const receiptParams: Record<string, string> = {};
  if (period.value.preset !== 'allTime' && period.value.dateFrom) {
    receiptParams.receiptDateStart = period.value.dateFrom;
    receiptParams.receiptDateEnd = period.value.dateTo;
  }

  const [statsResult, trendResult, receiptResult, facultyResult] = await Promise.allSettled([
    api.get('/api/centralfinance/dashboard-stats', { params }),
    api.get('/api/centralfinance/dashboard-trend', { params }),
    api.get<ReceiptUsageResponse>('/api/centralfinance/receipt-usage', { params: receiptParams }),
    api.get<{ faculty: string; totalAmount: number }[]>(
      '/api/centralfinance/dashboard-faculty-breakdown',
      { params },
    ),
  ]);

  const validTx = financeStore.transactions.filter((t) => t.status === 'valid');

  if (statsResult.status === 'fulfilled') {
    const stats = statsResult.value.data;
    dashboardStats.value.totalRevenue = stats.totalRevenue ?? 0;
    dashboardStats.value.onlinePayments = stats.onlinePayments ?? 0;
    dashboardStats.value.voidReceipts = stats.voidReceipts ?? 0;
  } else {
    dashboardStats.value.totalRevenue = validTx.reduce((s, t) => s + t.amount, 0);
    dashboardStats.value.onlinePayments = validTx.filter(
      (t) => t.paymentChannel === 'transfer' || t.paymentChannel === 'qrcode',
    ).length;
    dashboardStats.value.voidReceipts = financeStore.transactions.filter(
      (t) => t.status === 'void',
    ).length;
  }

  if (trendResult.status === 'fulfilled') {
    const trend = trendResult.value.data;
    trendData.value.months = trend.months ?? [];
    trendData.value.revenue = trend.revenue ?? [];
  }

  if (receiptResult.status === 'fulfilled') {
    const receiptData = receiptResult.value.data;
    dashboardStats.value.totalReceipts = receiptData.total ?? receiptData.data.length;
  } else {
    dashboardStats.value.totalReceipts = validTx.length;
  }

  if (facultyResult.status === 'fulfilled') {
    facultyData.value = facultyResult.value.data ?? [];
  }
}

// ── Lifecycle ────────────────────────────────────────────────
onMounted(() => {
  void fetchDashboardData();
});

// ── KPI Metric Cards ─────────────────────────────────────────
interface MetricCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  tint: string;
}

const metricCards = computed<MetricCard[]>(() => [
  {
    label: 'รายรับรวมทั้งหมด',
    value: formatCurrency(dashboardStats.value.totalRevenue),
    icon: 'account_balance_wallet',
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.12)',
  },
  {
    label: 'ใบเสร็จรับเงินทั้งหมด',
    value: `${dashboardStats.value.totalReceipts.toLocaleString('th-TH')} ใบ`,
    icon: 'receipt',
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.12)',
  },
  {
    label: 'รายการชำระออนไลน์',
    value: `${dashboardStats.value.onlinePayments.toLocaleString('th-TH')} รายการ`,
    icon: 'payment',
    color: '#0891b2',
    tint: 'rgba(8, 145, 178, 0.12)',
  },
  {
    label: 'ค่าเฉลี่ยต่อรายการ',
    value: formatCurrency(
      dashboardStats.value.onlinePayments > 0
        ? Math.round(dashboardStats.value.totalRevenue / dashboardStats.value.onlinePayments)
        : 0,
    ),
    icon: 'analytics',
    color: '#7c3aed',
    tint: 'rgba(124, 58, 237, 0.12)',
  },
]);

// ── Revenue Trend Chart ──────────────────────────────────────
const THAI_MONTH_ABBR: Record<string, string> = {
  '01': 'ม.ค.',
  '02': 'ก.พ.',
  '03': 'มี.ค.',
  '04': 'เม.ย.',
  '05': 'พ.ค.',
  '06': 'มิ.ย.',
  '07': 'ก.ค.',
  '08': 'ส.ค.',
  '09': 'ก.ย.',
  '10': 'ต.ค.',
  '11': 'พ.ย.',
  '12': 'ธ.ค.',
};

function formatYmLabel(ym: string): string {
  if (ym.includes(' ')) return ym.split(' ')[1] ?? ym;
  const parts = ym.split('-');
  if (parts.length === 3) {
    return `${Number(parts[2])} ${THAI_MONTH_ABBR[parts[1] ?? '01'] ?? parts[1]}`;
  }
  const mm = parts[1] ?? '01';
  const buddhistYear = Number(parts[0] ?? 0) + 543;
  return `${THAI_MONTH_ABBR[mm] ?? mm} ${String(buddhistYear).slice(-2)}`;
}

const trendChartLabels = computed(() => trendData.value.months.map(formatYmLabel));

const revenueChartSeries = computed<AreaChartSeries[]>(() => [
  {
    id: 'revenue',
    label: 'รายรับรวมทั้งหมด',
    color: '#047857',
    values: trendData.value.revenue,
    totalLabel: formatCompactCurrency(trendData.value.revenue.reduce((s, v) => s + v, 0)),
    formatValue: (v) => formatCurrency(Math.round(v)),
  },
]);

function formatRevenueTick(value: number): string {
  return formatCompactCurrency(Math.round(value));
}

function formatCurrency(value: number | string | undefined | null): string {
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || Number.isNaN(value)) return '฿0';
  return `฿${value.toLocaleString('th-TH')}`;
}

// ── Faculty Revenue Breakdown ─────────────────────────────────
interface FacultyBreakdownItem {
  faculty: string;
  totalAmount: number;
  percent: number;
}

const topFaculties = computed<FacultyBreakdownItem[]>(() => {
  const max = facultyData.value[0]?.totalAmount ?? 1;
  return facultyData.value.map((item) => ({
    faculty: item.faculty,
    totalAmount: item.totalAmount,
    percent: Math.max(4, Math.round((item.totalAmount / max) * 100)),
  }));
});
</script>

<style lang="scss" scoped>
// ── KPI Grid ─────────────────────────────────────────────────
.finance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;

  :deep(.cf-metric-card__copy) {
    margin-top: 16px !important;
  }
}

// ── Main Grid ────────────────────────────────────────────────
.finance-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

// ── Revenue Chart ─────────────────────────────────────────────
.chart-block__header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.chart-block__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--finance-navy, #10223f);
}

// ── Faculty Breakdown ─────────────────────────────────────────
.breakdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--finance-muted, #64748b);

  p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.faculty-breakdown-list {
  display: grid;
  gap: 16px;
}

.faculty-breakdown-item {
  display: grid;
  grid-template-columns: 28px 1fr auto;
  align-items: center;
  gap: 12px;
}

.faculty-breakdown-item__rank {
  font-size: 0.72rem;
  font-weight: 900;
  color: var(--finance-muted, #64748b);
  text-align: center;
}

.faculty-breakdown-item__info {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.faculty-breakdown-item__name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--finance-navy, #10223f);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.faculty-breakdown-item__track {
  height: 6px;
  border-radius: 999px;
  background: rgba(16, 35, 63, 0.07);
  overflow: hidden;
}

.faculty-breakdown-item__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #1d4ed8, #3b82f6);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 4px;
}

.faculty-breakdown-item__amount {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--finance-navy, #10223f);
  white-space: nowrap;
}

// ── Sticky Filter Bar ────────────────────────────────────────
// ── Responsive ───────────────────────────────────────────────
@media (max-width: 1100px) {
  .finance-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .finance-main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .finance-stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
