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
        <BaseInfoCard
          v-for="stat in metricCards"
          :key="stat.label"
          variant="stat"
          :tone="stat.tone"
          :icon="stat.icon"
          :value="stat.value"
          :title="stat.label"
          description=""
        />
      </div>

      <!-- ── Row 2: Revenue Chart + Faculty Breakdown ──────────── -->
      <div class="finance-main-grid">
        <!-- Revenue Trend -->
        <CentralFinanceSurfaceCard
          :eyebrow="$t('finance.dashboard.financialTrends', 'แนวโน้มการเงิน')"
          :title="$t('finance.dashboard.financialOverview', 'ภาพรวมทางการเงิน')"
          :subtitle="dateRangeLabel || $t('finance.filters.allTime')"
          card-class="finance-panel finance-panel--chart"
        >
          <div class="q-mb-md">
            <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-8">
              {{ $t('finance.dashboard.totalRevenueLabel', 'รายรับรวมทั้งหมด (บาท)') }}
            </div>
            <AppAreaChart
              :series="revenueChartSeries"
              :x-labels="trendChartLabels"
              :height="240"
              :format-y-tick="formatRevenueTick"
              :aria-label="$t('finance.dashboard.totalRevenueLabel', 'รายรับรวมทั้งหมด')"
            />
          </div>
        </CentralFinanceSurfaceCard>

        <!-- Faculty Revenue Pie Chart -->
        <CentralFinanceSurfaceCard
          :eyebrow="$t('centralFinance.facultyRevenue.chart.eyebrow', 'By Faculty')"
          :title="$t('centralFinance.facultyRevenue.chart.title')"
          card-class="finance-panel"
        >
          <div v-if="facultyDonutData.length === 0" class="breakdown-empty">
            <q-icon name="pie_chart" size="42px" color="grey-4" />
            <p>ไม่มีข้อมูลรายรับ</p>
          </div>
          <CentralFinanceDonutChart
            v-else
            :data="facultyDonutData"
            center-label="รายรับรวม"
            :center-value="formatCurrency(dashboardStats.totalRevenue)"
            :format-value="(v) => formatCurrency(Math.round(v))"
          />
        </CentralFinanceSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AppAreaChart, { type AreaChartSeries } from 'components/common/AppAreaChart.vue';
import CentralFinanceDonutChart, {
  type DonutChartSegment,
} from 'components/centralfinance/CentralFinanceDonutChart.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import { api } from 'src/boot/axios';
import { formatCompactCurrency } from 'src/utils/course-format';
import type { ReceiptUsageResponse } from 'src/types/receipt-usage-report';

const { locale } = useI18n();
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
  issuedReceipts: 0,
  voidReceipts: 0,
});

const trendData = ref<{ months: string[]; revenue: number[] }>({
  months: [],
  revenue: [],
});

const facultyData = ref<{ faculty: string; totalAmount: number }[]>([]);

async function fetchDashboardData() {
  const { preset, dateFrom, dateTo } = period.value;
  const params: Record<string, string> =
    preset === 'allTime' ? { period: 'allTime' } : { period: 'custom', dateFrom, dateTo };

  const receiptParams: Record<string, string> = {};
  if (preset !== 'allTime' && dateFrom) {
    receiptParams.receiptDateStart = dateFrom;
    receiptParams.receiptDateEnd = dateTo;
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
    dashboardStats.value.issuedReceipts = stats.issuedReceipts ?? 0;
    dashboardStats.value.voidReceipts = stats.pendingReceipts ?? 0;
  } else {
    dashboardStats.value.totalRevenue = validTx.reduce((s, t) => s + t.amount, 0);
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
type InfoCardTone =
  | 'primary'
  | 'secondary'
  | 'positive'
  | 'accent'
  | 'amber'
  | 'indigo'
  | 'gold'
  | 'blue';

interface MetricCard {
  label: string;
  value: string;
  icon: string;
  tone: InfoCardTone;
}

const metricCards = computed<MetricCard[]>(() => [
  {
    label: 'รายรับรวมทั้งหมด',
    value: formatCurrency(dashboardStats.value.totalRevenue),
    icon: 'account_balance_wallet',
    tone: 'positive',
  },
  {
    label: 'ใบเสร็จรับเงินทั้งหมด',
    value: `${dashboardStats.value.totalReceipts.toLocaleString('th-TH')} ใบ`,
    icon: 'receipt',
    tone: 'secondary',
  },
  {
    label: 'ใบเสร็จโมฆะ',
    value: `${dashboardStats.value.voidReceipts.toLocaleString('th-TH')} ใบ`,
    icon: 'cancel',
    tone: 'amber',
  },
  {
    label: 'ค่าเฉลี่ยต่อรายการ',
    value: formatCurrency(
      dashboardStats.value.issuedReceipts > 0
        ? Math.round(dashboardStats.value.totalRevenue / dashboardStats.value.issuedReceipts)
        : 0,
    ),
    icon: 'analytics',
    tone: 'gold',
  },
]);

// ── Revenue Trend Chart ──────────────────────────────────────
function formatYmLabel(ym: string): string {
  if (ym.includes(' ')) return ym.split(' ')[1] ?? ym;
  const parts = ym.split('-');
  const localeStr = locale.value === 'th' ? 'th-TH' : 'en-US';
  if (parts.length === 3) {
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Intl.DateTimeFormat(localeStr, { day: 'numeric', month: 'short' }).format(d);
  }
  const d = new Date(Number(parts[0]), Number(parts[1] ?? '1') - 1);
  return new Intl.DateTimeFormat(localeStr, { month: 'short', year: '2-digit' }).format(d);
}

const trendChartLabels = computed(() => trendData.value.months.map(formatYmLabel));

const revenueChartSeries = computed<AreaChartSeries[]>(() => [
  {
    id: 'revenue',
    label: 'รายรับรวมทั้งหมด',
    color: '#0F766E',
    values: trendData.value.revenue,
    totalLabel: formatCurrency(dashboardStats.value.totalRevenue),
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

// ── Faculty Revenue Pie Chart ─────────────────────────────────
const FACULTY_COLORS = ['#1d4ed8', '#047857', '#7c3aed', '#0891b2', '#b45309', '#dc2626'];

const facultyDonutData = computed<DonutChartSegment[]>(() =>
  facultyData.value.map((item, i) => ({
    id: item.faculty,
    label: item.faculty,
    value: item.totalAmount,
    color: FACULTY_COLORS[i % FACULTY_COLORS.length] ?? '#1d4ed8',
  })),
);
</script>

<style lang="scss" scoped>
// ── KPI Grid ─────────────────────────────────────────────────
.finance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
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
