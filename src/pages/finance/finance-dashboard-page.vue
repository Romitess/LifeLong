<template>
  <q-page class="finance-page finance-dashboard-page">
    <CentralFinancePageHero
      eyebrow="Finance Operations"
      eyebrow-icon="account_balance"
      :title="$t('finance.dashboard.title')"
      :description="$t('finance.dashboard.subtitle')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ currentUserFaculty || 'ไม่ระบุคณะ' }}</div>
        </div>
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <PeriodFilterBar
        v-model="period"
        :presets="datePresetOptions"
        @change="fetchDashboardStats"
      />

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

      <div class="finance-main-grid">
        <CentralFinanceSurfaceCard
          eyebrow="Financial Trends"
          title="ภาพรวมทางการเงิน"
          :subtitle="dateRangeLabel || 'ทั้งหมด'"
          card-class="finance-panel finance-panel--chart"
        >
          <div class="q-mb-xl">
            <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-8">
              รายรับรวมทั้งหมด (บาท)
            </div>
            <AdminAreaChart
              :series="revenueChartSeries"
              :x-labels="trendChartLabels"
              :height="240"
              :format-y-tick="formatRevenueTick"
              aria-label="รายรับรวมทั้งหมด"
            />
          </div>

          <div>
            <div class="text-subtitle1 text-weight-bold q-mb-md text-grey-8">
              รายการชำระเงินใหม่ (รายการ)
            </div>
            <AdminAreaChart
              :series="transactionsChartSeries"
              :x-labels="trendChartLabels"
              :height="240"
              :format-y-tick="formatTransactionsTick"
              aria-label="รายการชำระเงินใหม่"
            />
          </div>
        </CentralFinanceSurfaceCard>

        <CentralFinanceSurfaceCard
          eyebrow="Recent Activity"
          title="กิจกรรมล่าสุดของคณะ"
          card-class="finance-panel finance-panel--activity"
        >
          <q-timeline color="primary" layout="dense" class="finance-timeline">
            <q-timeline-entry
              v-for="activity in recentActivities"
              :key="activity.title + activity.time"
              :icon="activity.icon"
              :color="activity.color"
            >
              <template #title>{{ activity.title }}</template>
              <template #subtitle>{{ activity.time }}</template>
              <div class="finance-timeline__detail">{{ activity.detail }}</div>
            </q-timeline-entry>
          </q-timeline>
        </CentralFinanceSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import { api } from 'src/boot/axios';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { formatCompactCurrency, formatCount } from 'src/utils/course-format';

const { t } = useI18n();
const authStore = useAuthStore();

const period = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });

const dateRangeLabel = computed(() => {
  const { dateFrom, dateTo } = period.value;
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return `${dateFrom} - ${dateTo}`;
  }
  return dateFrom || '';
});

const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

const dashboardStats = ref({
  todayRevenue: 0,
  yesterdayRevenue: 0,
  pendingReceipts: 0,
  issuedReceipts: 0,
  totalTransactions: 0,
});

async function fetchDashboardStats() {
  try {
    const params: Record<string, string> = {};
    if (period.value.preset === 'allTime') {
      params.period = 'allTime';
    } else {
      params.period = 'custom';
      params.dateFrom = period.value.dateFrom;
      params.dateTo = period.value.dateTo;
    }

    const [statsRes, trendRes] = await Promise.all([
      api.get('/api/lltenroll/dashboard-stats', { params }),
      api.get('/api/lltenroll/dashboard-trend', { params }),
    ]);

    const stats = statsRes.data;
    dashboardStats.value.todayRevenue = stats.todayRevenue || 0;
    dashboardStats.value.yesterdayRevenue = stats.yesterdayRevenue || 0;
    dashboardStats.value.pendingReceipts = stats.pendingReceipts || 0;
    dashboardStats.value.issuedReceipts = stats.issuedReceipts || 0;
    dashboardStats.value.totalTransactions = stats.totalTransactions || 0;

    const trend = trendRes.data;
    trendData.value.months = trend.months || [];
    trendData.value.enrollments = trend.enrollments || [];
    trendData.value.paidEnrollments = trend.paidEnrollments || [];
    trendData.value.revenue = trend.revenue || [];
  } catch (error) {
    console.error('Failed to load dashboard stats', error);
  }
}

onMounted(() => {
  void fetchDashboardStats();
  void fetchRecentActivity();
});

const currentUserFaculty = computed(() => authStore.user?.facName ?? authStore.user?.faculty ?? '');

const mockDashboardStats = computed(() => [
  {
    label:
      period.value.preset === 'allTime'
        ? 'รายรับรวมทั้งหมด'
        : period.value.preset === 'today'
          ? t('finance.dashboard.totalRevenueToday')
          : 'รายรับตามช่วงเวลา',
    value: dashboardStats.value.todayRevenue,
    icon: 'payments',
    color: '#0d9488',
    tint: '#ccfbf1',
  },
  {
    label: 'รายการชำระเงินใหม่',
    value: `${dashboardStats.value.totalTransactions} รายการ`,
    icon: 'credit_card',
    color: '#2563eb',
    tint: '#dbeafe',
  },
  {
    label: 'รายการที่รอออกใบเสร็จ',
    value: `${dashboardStats.value.pendingReceipts} รายการ`,
    icon: 'hourglass_empty',
    color: '#d97706',
    tint: '#fef3c7',
  },
  {
    label: 'ออกใบเสร็จไปแล้ว (สำเนา+ฉบับจริง)',
    value: `${dashboardStats.value.issuedReceipts} ใบ`,
    icon: 'task_alt',
    color: '#059669',
    tint: '#d1fae5',
  },
]);

const recentActivities = ref<
  { title: string; time: string; detail: string; icon: string; color: string }[]
>([]);

async function fetchRecentActivity() {
  try {
    const { data } = await api.get('/api/lltenroll/recent-activity');
    const items = data.activities || [];
    recentActivities.value = items.map(
      (a: { title: string; time: string; detail: string; icon: string; color: string }) => ({
        ...a,
        time: formatRelativeTime(a.time),
      }),
    );
  } catch (error) {
    console.error('Failed to load recent activity', error);
  }
}

function formatRelativeTime(isoStr: string): string {
  const now = Date.now();
  const then = new Date(isoStr).getTime();
  if (Number.isNaN(then)) return isoStr;
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'เมื่อสักครู่';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ชั่วโมงที่แล้ว`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'เมื่อวาน';
  if (diffDay < 30) return `${diffDay} วันที่แล้ว`;
  const d = new Date(isoStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yyyy}`;
}

const metricCards = computed(() =>
  mockDashboardStats.value.map((stat) => ({
    label: stat.label.includes('.') ? t(stat.label) : stat.label,
    value: typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value,
    icon: stat.icon,
    color: stat.color,
    tint: stat.tint,
  })),
);

const trendData = ref<{
  months: string[];
  enrollments: number[];
  paidEnrollments: number[];
  revenue: number[];
}>({
  months: [],
  enrollments: [],
  paidEnrollments: [],
  revenue: [],
});

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
  if (ym.includes(' ')) {
    return ym.split(' ')[1] ?? ym;
  }
  const parts = ym.split('-');
  if (parts.length === 3) {
    const d = Number(parts[2]);
    const mm = parts[1] ?? '01';
    return `${d} ${THAI_MONTH_ABBR[mm] ?? mm}`;
  }
  const mm = parts[1] ?? '01';
  const yyyy = Number(parts[0] ?? 0);
  const buddhistYear = yyyy + 543;
  return `${THAI_MONTH_ABBR[mm] ?? mm} ${String(buddhistYear).slice(-2)}`;
}

const trendChartLabels = computed(() => trendData.value.months.map(formatYmLabel));

const revenueChartSeries = computed<AreaChartSeries[]>(() => {
  const d = trendData.value;
  return [
    {
      id: 'revenue',
      label: 'รายรับรวมทั้งหมด',
      color: '#0F766E',
      values: d.revenue,
      totalLabel: formatCompactCurrency(d.revenue.reduce((sum, v) => sum + v, 0)),
      formatValue: (value) => formatCurrency(Math.round(value)),
    },
  ];
});

const transactionsChartSeries = computed<AreaChartSeries[]>(() => {
  const d = trendData.value;
  return [
    {
      id: 'transactions',
      label: 'รายการชำระเงินใหม่',
      color: '#F5A623',
      values: d.paidEnrollments,
      totalLabel: `${formatCount(d.paidEnrollments.reduce((sum, v) => sum + v, 0))} รายการ`,
      formatValue: (value) => `${formatCount(Math.round(value))} รายการ`,
    },
  ];
});

function formatRevenueTick(value: number): string {
  return formatCompactCurrency(Math.round(value));
}

function formatTransactionsTick(value: number): string {
  return formatCount(Math.round(value));
}

function formatCurrency(value: number | string | undefined | null): string {
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return `฿${value.toLocaleString('th-TH')}`;
}
</script>

<style lang="scss" scoped>
.finance-dashboard-page {
  background: #f8fafc;
  min-height: 100vh;
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

.faculty-scope-card__helper {
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
}

.finance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;

  :deep(.cf-metric-card__copy) {
    margin-top: 16px !important;
  }
}

.finance-metric-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 2px;
}

.finance-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.finance-chart-toggle {
  border-radius: 10px;
  background: rgba(15, 23, 42, 0.04);
  padding: 4px;

  :deep(.q-btn) {
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    border-radius: 8px !important;
    font-size: 0.78rem;
    font-weight: 800;
    padding: 0 14px;
    min-height: 32px;
  }

  :deep(.q-btn::before) {
    box-shadow: none !important;
  }
}

.finance-period-toggle {
  border: 1px solid rgba(16, 35, 63, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

.finance-status-list {
  display: grid;
  gap: 14px;
}

.finance-status-item {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: 12px;
  align-items: center;
}

.finance-status-item__icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  flex-shrink: 0;
}

.finance-status-item__info {
  display: grid;
  gap: 2px;

  strong {
    font-size: 1.3rem;
    font-weight: 950;
    color: #10223f;
    line-height: 1;
  }

  span {
    font-size: 0.82rem;
    font-weight: 800;
    color: #64748b;
  }
}

.finance-bottom-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
  margin-bottom: 20px;
}

.finance-timeline__detail {
  font-size: 0.88rem;
  color: #64748b;
  margin-top: 3px;
}

// ─── Sticky Filter Bar ───────────────────────────────────────
@media (max-width: 1100px) {
  .finance-stat-grid,
  .finance-main-grid,
  .finance-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .finance-floating-summary {
    position: static;
    width: 100%;
    margin-bottom: 8px;
  }

  .finance-chart-area {
    padding-top: 0;
  }

  .finance-chart-summary {
    flex-direction: column;
    gap: 12px;

    &__divider {
      width: 100%;
      height: 1px;
    }

    &__item {
      padding: 0;
    }
  }
}
</style>
