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
        />
      </div>

      <!-- ── Row 2: Revenue Chart + Faculty Breakdown ──────────── -->
      <div class="finance-main-grid">
        <!-- Revenue Trend -->
        <CentralFinanceSurfaceCard
          eyebrow="Revenue Trend"
          title="แนวโน้มรายรับรวม"
          :subtitle="dateRangeDisplay || 'ทั้งหมด'"
          card-class="finance-panel"
        >
          <div class="chart-block__header">
            <span class="chart-block__title">รายรับรวมทุกคณะ/ส่วนงาน (บาท)</span>
          </div>
          <AdminAreaChart
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
import { computed, ref, onMounted, onUnmounted } from 'vue';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import { api } from 'src/boot/axios';
import { formatCompactCurrency } from 'src/utils/course-format';
import type { ReceiptUsageResponse } from 'src/types/receipt-usage-report';

const financeStore = useCentralFinanceStore();

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
  totalReceipts: 0,
  onlinePayments: 0,
  voidReceipts: 0,
});

const trendData = ref<{ months: string[]; revenue: number[] }>({
  months: [],
  revenue: [],
});

async function fetchDashboardData() {
  const params: Record<string, string> =
    datePreset.value === 'allTime'
      ? { period: 'allTime' }
      : { period: 'custom', dateFrom: filters.value.dateFrom, dateTo: filters.value.dateTo };

  const receiptParams: Record<string, string> = {};
  if (datePreset.value !== 'allTime' && filters.value.dateFrom) {
    receiptParams.receiptDateStart = filters.value.dateFrom;
    receiptParams.receiptDateEnd = filters.value.dateTo;
  }

  const [statsResult, trendResult, receiptResult] = await Promise.allSettled([
    api.get('/api/centralfinance/dashboard-stats', { params }),
    api.get('/api/centralfinance/dashboard-trend', { params }),
    api.get<ReceiptUsageResponse>('/api/centralfinance/receipt-usage', { params: receiptParams }),
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
  const map = new Map<string, number>();
  for (const tx of financeStore.transactions) {
    if (tx.status === 'valid') {
      map.set(tx.faculty, (map.get(tx.faculty) ?? 0) + tx.amount);
    }
  }
  const sorted = Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const max = sorted[0]?.[1] ?? 1;
  return sorted.map(([faculty, totalAmount]) => ({
    faculty,
    totalAmount,
    percent: Math.max(4, Math.round((totalAmount / max) * 100)),
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
