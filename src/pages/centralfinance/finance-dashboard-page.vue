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
      <!-- Sticky sentinel -->
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

          <q-btn
            flat
            dense
            round
            icon="filter_alt_off"
            color="negative"
            class="q-ml-sm"
            @click="clearFilters"
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
        >
          <template #footer>
            <div class="finance-metric-footer">
              <q-icon :name="stat.trendIcon" size="16px" :color="stat.trendColor" />
              <span :class="`text-${stat.trendColor}`">{{ stat.trendText }}</span>
            </div>
          </template>
        </CentralFinanceMetricCard>
      </div>

      <!-- ── Row 2: Trend Charts + Fund Pipeline ───────────────── -->
      <div class="finance-main-grid">
        <!-- Operations Trend Charts -->
        <CentralFinanceSurfaceCard
          eyebrow="Operations Overview"
          title="ภาพรวมการดำเนินงาน"
          :subtitle="dateRangeDisplay || 'ทั้งหมด'"
          card-class="finance-panel finance-panel--chart"
        >
          <div class="chart-block q-mb-xl">
            <div class="chart-block__header">
              <span class="chart-block__title">รายรับรวมทุกคณะ/ส่วนงาน (บาท)</span>
            </div>
            <AdminAreaChart
              :series="revenueChartSeries"
              :x-labels="trendChartLabels"
              :height="220"
              :format-y-tick="formatRevenueTick"
              aria-label="รายรับรวมทุกคณะ"
            />
          </div>

          <div class="chart-block">
            <div class="chart-block__header">
              <span class="chart-block__title">คำขอแหล่งเงินทุน (รายการ)</span>
            </div>
            <AdminAreaChart
              :series="fundRequestsChartSeries"
              :x-labels="trendChartLabels"
              :height="200"
              :format-y-tick="formatCountTick"
              aria-label="คำขอแหล่งเงินทุน"
            />
          </div>
        </CentralFinanceSurfaceCard>

        <!-- Fund Request Pipeline -->
        <CentralFinanceSurfaceCard
          eyebrow="Fund Requests"
          :title="$t('centralFinance.dashboard.fundSourceStatus.title')"
          card-class="finance-panel"
        >
          <div class="pipeline-summary">
            <div class="pipeline-summary__rate">
              <span class="pipeline-summary__percent">{{ completionRate }}%</span>
              <span class="pipeline-summary__label">อัตราการดำเนินการ</span>
            </div>
            <div class="pipeline-summary__total">
              <span class="pipeline-summary__number">{{ totalRequests }}</span>
              <span class="pipeline-summary__label">คำขอทั้งหมด</span>
            </div>
          </div>

          <div class="pipeline-bars">
            <div v-for="item in fundSourceStatus" :key="item.label" class="pipeline-bar-row">
              <div class="pipeline-bar-row__meta">
                <div class="pipeline-bar-row__dot" :style="{ background: item.color }" />
                <span class="pipeline-bar-row__label">{{ item.label }}</span>
                <strong class="pipeline-bar-row__count">{{ item.count }}</strong>
              </div>
              <div class="pipeline-bar-row__track">
                <div
                  class="pipeline-bar-row__fill"
                  :style="{
                    width: totalRequests > 0 ? `${(item.count / totalRequests) * 100}%` : '0%',
                    background: item.color,
                  }"
                />
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <q-btn
            flat
            no-caps
            color="primary"
            icon-right="arrow_forward"
            label="จัดการคำขอทั้งหมด"
            class="full-width pipeline-goto-btn"
            tag="a"
            :href="resolveFullUrl('/central-finance/fund-sources')"
            @click="onManageAllRequestsClick"
          />
        </CentralFinanceSurfaceCard>
      </div>

      <!-- ── Row 3: Faculty Breakdown + Recent Activity ─────────── -->
      <div class="finance-bottom-grid">
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

        <!-- Recent Activity Feed -->
        <CentralFinanceSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.activities.eyebrow')"
          :title="$t('centralFinance.dashboard.activities.title')"
          card-class="finance-panel"
        >
          <div v-if="recentActivities.length === 0" class="breakdown-empty">
            <q-icon name="history" size="42px" color="grey-4" />
            <p>ไม่มีกิจกรรมล่าสุด</p>
          </div>
          <q-timeline v-else color="primary" layout="dense" class="finance-timeline">
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import { api } from 'src/boot/axios';
import { formatCompactCurrency, formatCount } from 'src/utils/course-format';

const router = useRouter();
const { t } = useI18n();
const financeStore = useCentralFinanceStore();

// ── Navigation ───────────────────────────────────────────────
function onManageAllRequestsClick(event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push('/central-finance/fund-sources');
}

// ── Sticky Filter Bar ────────────────────────────────────────
const sentinelRef = ref<HTMLElement | null>(null);
const filterStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

const filters = ref({ dateFrom: '', dateTo: '' });
const datePreset = ref('allTime');
const datePresetOptions = [
  { label: 'วันนี้', value: 'today' },
  { label: 'สัปดาห์นี้', value: 'thisWeek' },
  { label: 'เดือนนี้', value: 'thisMonth' },
  { label: 'ปีนี้', value: 'thisYear' },
  { label: 'ทั้งหมด', value: 'allTime' },
  { label: 'กำหนดเอง', value: 'custom' },
];

function formatDateInput(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function applyDatePreset(preset: string) {
  datePreset.value = preset;
  const now = new Date();
  if (preset === 'today') {
    filters.value.dateFrom = formatDateInput(now);
    filters.value.dateTo = formatDateInput(now);
  } else if (preset === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.getFullYear(), now.getMonth(), diff);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    filters.value.dateFrom = formatDateInput(start);
    filters.value.dateTo = formatDateInput(end);
  } else if (preset === 'thisMonth') {
    filters.value.dateFrom = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    filters.value.dateTo = formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  } else if (preset === 'thisYear') {
    filters.value.dateFrom = formatDateInput(new Date(now.getFullYear(), 0, 1));
    filters.value.dateTo = formatDateInput(new Date(now.getFullYear(), 11, 31));
  } else if (preset === 'allTime') {
    filters.value.dateFrom = '';
    filters.value.dateTo = '';
  }
  if (preset !== 'custom') void fetchDashboardData();
}

function clearFilters() {
  filters.value.dateFrom = '';
  filters.value.dateTo = '';
  datePreset.value = 'allTime';
  void fetchDashboardData();
}

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
    datePreset.value = 'custom';
    void fetchDashboardData();
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

// ── Dashboard API Data ───────────────────────────────────────
const dashboardStats = ref({
  totalRevenue: 0,
  totalTransactions: 0,
  pendingReceipts: 0,
  issuedReceipts: 0,
});

const trendData = ref<{
  months: string[];
  revenue: number[];
  fundRequests: number[];
}>({ months: [], revenue: [], fundRequests: [] });

const facultyBreakdownData = ref<{ faculty: string; totalAmount: number }[]>([]);

async function fetchDashboardData() {
  try {
    const params: Record<string, string> =
      datePreset.value === 'allTime'
        ? { period: 'allTime' }
        : { period: 'custom', dateFrom: filters.value.dateFrom, dateTo: filters.value.dateTo };

    const [statsRes, trendRes, facultyRes] = await Promise.all([
      api.get('/api/centralfinance/dashboard-stats', { params }),
      api.get('/api/centralfinance/dashboard-trend', { params }),
      api.get<{ faculty: string; totalAmount: number }[]>(
        '/api/centralfinance/dashboard-faculty-breakdown',
        { params },
      ),
    ]);

    const stats = statsRes.data;
    dashboardStats.value.totalRevenue = stats.totalRevenue ?? 0;
    dashboardStats.value.totalTransactions = stats.totalTransactions ?? 0;
    dashboardStats.value.pendingReceipts = stats.pendingReceipts ?? 0;
    dashboardStats.value.issuedReceipts = stats.issuedReceipts ?? 0;

    const trend = trendRes.data;
    trendData.value.months = trend.months ?? [];
    trendData.value.revenue = trend.revenue ?? [];
    trendData.value.fundRequests = trend.fundRequests ?? [];

    facultyBreakdownData.value = facultyRes.data ?? [];
  } catch {
    // API not yet implemented — fall back to store-derived totals
    const validTx = financeStore.transactions.filter((t) => t.status === 'valid');
    dashboardStats.value.totalRevenue = validTx.reduce((s, t) => s + t.amount, 0);
    dashboardStats.value.totalTransactions = validTx.length;
    dashboardStats.value.pendingReceipts = financeStore.transactions.filter(
      (t) => t.status === 'flagged',
    ).length;
    dashboardStats.value.issuedReceipts = financeStore.transactions.filter(
      (t) => t.status === 'valid',
    ).length;
  }
}

// ── Lifecycle ────────────────────────────────────────────────
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
  void fetchDashboardData();
});

onUnmounted(() => {
  stickyObserver?.disconnect();
});

// ── KPI Metric Cards ─────────────────────────────────────────
interface MetricCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  tint: string;
  trendIcon: string;
  trendColor: string;
  trendText: string;
}

const metricCards = computed<MetricCard[]>(() => [
  {
    label: 'รายรับรวมทั้งหมด',
    value: formatCurrency(dashboardStats.value.totalRevenue),
    icon: 'account_balance_wallet',
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.12)',
    trendIcon: 'domain',
    trendColor: 'grey-7',
    trendText: 'รวมทุกคณะ/ส่วนงาน',
  },
  {
    label: t('centralFinance.dashboard.metrics.pending'),
    value: financeStore.requests
      .filter((r) => r.status === 'new' || r.status === 'processing')
      .length.toString(),
    icon: 'pending_actions',
    color: '#b45309',
    tint: 'rgba(180, 83, 9, 0.12)',
    trendIcon: 'pending_actions',
    trendColor: 'negative',
    trendText: `รอรับเรื่อง ${financeStore.requests.filter((r) => r.status === 'new').length} รายการ`,
  },
  {
    label: 'รายการธุรกรรมทั้งหมด',
    value: `${dashboardStats.value.totalTransactions.toLocaleString('th-TH')} รายการ`,
    icon: 'receipt_long',
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.12)',
    trendIcon: 'check_circle',
    trendColor: 'positive',
    trendText: `ออกใบเสร็จแล้ว ${dashboardStats.value.issuedReceipts} ใบ`,
  },
  {
    label: t('centralFinance.dashboard.metrics.activeFaculties'),
    value: new Set(financeStore.requests.map((r) => r.faculty)).size.toString(),
    icon: 'domain',
    color: '#7c3aed',
    tint: 'rgba(124, 58, 237, 0.12)',
    trendIcon: 'trending_flat',
    trendColor: 'grey-6',
    trendText: t('centralFinance.dashboard.metrics.trendNeutral'),
  },
]);

// ── Trend Charts ─────────────────────────────────────────────
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

const fundRequestsChartSeries = computed<AreaChartSeries[]>(() => [
  {
    id: 'fundRequests',
    label: 'คำขอแหล่งเงินทุน',
    color: '#7c3aed',
    values: trendData.value.fundRequests,
    totalLabel: `${formatCount(trendData.value.fundRequests.reduce((s: number, v: number) => s + v, 0))} รายการ`,
    formatValue: (v: number) => `${formatCount(Math.round(v))} รายการ`,
  },
]);

function formatRevenueTick(value: number): string {
  return formatCompactCurrency(Math.round(value));
}

function formatCountTick(value: number): string {
  return formatCount(Math.round(value));
}

function formatCurrency(value: number | string | undefined | null): string {
  if (typeof value === 'string') return value;
  if (typeof value !== 'number' || Number.isNaN(value)) return '฿0';
  return `฿${value.toLocaleString('th-TH')}`;
}

// ── Fund Request Pipeline ────────────────────────────────────
interface FundSourceStatusItem {
  label: string;
  count: number;
  color: string;
}

const totalRequests = computed<number>(() => financeStore.requests.length);

const completionRate = computed<number>(() => {
  if (totalRequests.value === 0) return 0;
  const done = financeStore.requests.filter(
    (r) => r.status === 'completed' || r.status === 'rejected',
  ).length;
  return Math.round((done / totalRequests.value) * 100);
});

const fundSourceStatus = computed<FundSourceStatusItem[]>(() => [
  {
    label: t('centralFinance.dashboard.fundSourceStatus.pending'),
    count: financeStore.requests.filter((r) => r.status === 'new').length,
    color: '#b45309',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.processing'),
    count: financeStore.requests.filter((r) => r.status === 'processing').length,
    color: '#1d4ed8',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.completed'),
    count: financeStore.requests.filter((r) => r.status === 'completed').length,
    color: '#047857',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.rejected'),
    count: financeStore.requests.filter((r) => r.status === 'rejected').length,
    color: '#b91c1c',
  },
]);

// ── Faculty Revenue Breakdown ─────────────────────────────────
interface FacultyBreakdownItem {
  faculty: string;
  totalAmount: number;
  percent: number;
}

const topFaculties = computed<FacultyBreakdownItem[]>(() => {
  const data = facultyBreakdownData.value;
  if (data.length === 0) return [];
  const max = data[0]?.totalAmount ?? 1;
  return data.map((item) => ({
    faculty: item.faculty,
    totalAmount: item.totalAmount,
    percent: Math.max(4, Math.round((item.totalAmount / max) * 100)),
  }));
});

// ── Recent Activities ─────────────────────────────────────────
interface ActivityItem {
  title: string;
  time: string;
  detail: string;
  icon: string;
  color: string;
}

const recentActivities = computed<ActivityItem[]>(() =>
  financeStore.requests
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((req) => {
      const map: Record<string, { title: string; icon: string; color: string }> = {
        new: {
          title: t('centralFinance.dashboard.activities.items.dynamic.new', {
            faculty: req.faculty,
          }),
          icon: 'add_circle',
          color: 'teal',
        },
        processing: {
          title: t('centralFinance.dashboard.activities.items.dynamic.processing', {
            id: req.requestId,
          }),
          icon: 'hourglass_empty',
          color: 'orange',
        },
        completed: {
          title: t('centralFinance.dashboard.activities.items.dynamic.completed', {
            faculty: req.faculty,
          }),
          icon: 'check_circle',
          color: 'positive',
        },
        rejected: {
          title: t('centralFinance.dashboard.activities.items.dynamic.rejected', {
            id: req.requestId,
          }),
          icon: 'error',
          color: 'negative',
        },
      };
      const meta = map[req.status] ?? { title: req.requestId, icon: 'info', color: 'grey' };
      return { ...meta, time: req.date, detail: req.project };
    }),
);
</script>

<style lang="scss" scoped>
// ── KPI Grid ─────────────────────────────────────────────────
.finance-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.finance-metric-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 2px;
}

// ── Main Grid ────────────────────────────────────────────────
.finance-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

// ── Bottom Grid ──────────────────────────────────────────────
.finance-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

// ── Chart Blocks ─────────────────────────────────────────────
.chart-block {
  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--finance-navy, #10223f);
  }
}

// ── Request Pipeline ─────────────────────────────────────────
.pipeline-summary {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0f7ff, #f8fafc);
  border: 1px solid rgba(29, 78, 216, 0.1);
  margin-bottom: 20px;
}

.pipeline-summary__rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  border-right: 1px solid rgba(16, 35, 63, 0.1);
  padding-right: 24px;
}

.pipeline-summary__percent {
  font-size: 2rem;
  font-weight: 950;
  color: #1d4ed8;
  line-height: 1;
}

.pipeline-summary__total {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.pipeline-summary__number {
  font-size: 2rem;
  font-weight: 950;
  color: var(--finance-navy, #10223f);
  line-height: 1;
}

.pipeline-summary__label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--finance-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
}

.pipeline-bars {
  display: grid;
  gap: 14px;
}

.pipeline-bar-row {
  display: grid;
  gap: 6px;
}

.pipeline-bar-row__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pipeline-bar-row__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.pipeline-bar-row__label {
  flex: 1;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--finance-muted, #64748b);
}

.pipeline-bar-row__count {
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--finance-navy, #10223f);
}

.pipeline-bar-row__track {
  height: 6px;
  border-radius: 999px;
  background: rgba(16, 35, 63, 0.07);
  overflow: hidden;
}

.pipeline-bar-row__fill {
  height: 100%;
  border-radius: inherit;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 4px;
}

.pipeline-goto-btn {
  border-radius: 10px;
  border: 1px dashed rgba(29, 78, 216, 0.2);

  &:hover {
    background: rgba(29, 78, 216, 0.04);
    border-color: rgba(29, 78, 216, 0.4);
  }
}

// ── Faculty Breakdown ────────────────────────────────────────
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
  gap: 14px;
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
  gap: 6px;
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

// ── Timeline ─────────────────────────────────────────────────
.finance-timeline__detail {
  font-size: 0.88rem;
  color: var(--finance-muted, #64748b);
  margin-top: 3px;
}

// ── Sticky Filter Bar ────────────────────────────────────────
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

.admin-filter-bar__input {
  width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &--range {
    width: 220px;
  }

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 2px rgba($primary, 0.1);
  }
}

// ── Responsive ───────────────────────────────────────────────
@media (max-width: 1100px) {
  .finance-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .finance-main-grid,
  .finance-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 599px) {
  .finance-stat-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-summary {
    gap: 16px;
  }
}
</style>
