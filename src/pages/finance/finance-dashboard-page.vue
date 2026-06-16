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
      <!-- Sticky sentinel — 1px div สำหรับ IntersectionObserver detect "stuck" -->
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
            @click="clearFilters"
            class="q-ml-sm"
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
          :subtitle="dateRangeDisplay || 'ทั้งหมด'"
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import { api } from 'src/boot/axios';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import { formatCompactCurrency, formatCount } from 'src/utils/course-format';

const { t } = useI18n();
const authStore = useAuthStore();

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const filters = ref({
  dateFrom: '',
  dateTo: '',
});

const datePreset = ref('allTime');
const datePresetOptions = computed(() => [
  { label: t('finance.filters.today'), value: 'today' },
  { label: t('finance.filters.thisWeek'), value: 'thisWeek' },
  { label: t('finance.filters.thisMonth'), value: 'thisMonth' },
  { label: t('finance.filters.thisYear'), value: 'thisYear' },
  { label: t('finance.filters.allTime'), value: 'allTime' },
  { label: t('finance.filters.custom'), value: 'custom' },
]);

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
    onCustomDateChange();
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

function applyDatePreset(preset: string) {
  datePreset.value = preset;
  const now = new Date();
  if (preset === 'today') {
    filters.value.dateFrom = formatDateInput(now);
    filters.value.dateTo = formatDateInput(now);
  } else if (preset === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diff);
    const endOfWeek = new Date(
      startOfWeek.getFullYear(),
      startOfWeek.getMonth(),
      startOfWeek.getDate() + 6,
    );
    filters.value.dateFrom = formatDateInput(startOfWeek);
    filters.value.dateTo = formatDateInput(endOfWeek);
  } else if (preset === 'thisMonth') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    filters.value.dateFrom = formatDateInput(startOfMonth);
    filters.value.dateTo = formatDateInput(endOfMonth);
  } else if (preset === 'thisYear') {
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    filters.value.dateFrom = formatDateInput(startOfYear);
    filters.value.dateTo = formatDateInput(endOfYear);
  } else if (preset === 'allTime') {
    filters.value.dateFrom = '';
    filters.value.dateTo = '';
  }
  if (preset !== 'custom') {
    void fetchDashboardStats();
  }
}

function onCustomDateChange() {
  datePreset.value = 'custom';
  void fetchDashboardStats();
}

function clearFilters() {
  filters.value.dateFrom = '';
  filters.value.dateTo = '';
  datePreset.value = 'allTime';
  void fetchDashboardStats();
}

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
    if (datePreset.value === 'allTime') {
      params.period = 'allTime';
    } else {
      params.period = 'custom';
      params.dateFrom = filters.value.dateFrom;
      params.dateTo = filters.value.dateTo;
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

const sentinelRef = ref<HTMLElement | null>(null);
const filterStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

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

  void fetchDashboardStats();
  void fetchRecentActivity();
});

onUnmounted(() => {
  stickyObserver?.disconnect();
});

const currentUserFaculty = computed(() => authStore.user?.facName ?? authStore.user?.faculty ?? '');

const mockDashboardStats = computed(() => [
  {
    label:
      datePreset.value === 'allTime'
        ? 'รายรับรวมทั้งหมด'
        : datePreset.value === 'today'
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

.admin-filter-bar__divider {
  width: 1px;
  height: 24px;
  background: rgba(17, 24, 39, 0.08);
  margin: 0 10px;
  flex: 0 0 auto;
}

.admin-filter-bar__input {
  width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;
}
.admin-filter-bar__input--range {
  width: 220px;
}
.admin-filter-bar__input:focus-within {
  border-color: #0d9488;
  box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
}

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
