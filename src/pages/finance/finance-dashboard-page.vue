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
          <template #footer v-if="stat.trendText">
            <div class="finance-metric-footer">
              <q-icon :name="stat.trendIcon" size="16px" :color="stat.trendColor" />
              <span :class="`text-${stat.trendColor}`">{{ stat.trendText }}</span>
            </div>
          </template>
        </CentralFinanceMetricCard>
      </div>

      <div class="finance-main-grid">
        <CentralFinanceSurfaceCard
          eyebrow="Financial Trends"
          title="ภาพรวมรายรับของคณะ"
          card-class="finance-panel finance-panel--chart"
        >
          <template #header-actions>
            <q-btn-toggle
              v-model="chartPeriod"
              no-caps
              rounded
              unelevated
              toggle-color="primary"
              color="white"
              text-color="grey-7"
              :options="[
                { label: '7D', value: '7d' },
                { label: '30D', value: '30d' },
              ]"
              class="finance-period-toggle"
            />
          </template>

          <div class="finance-chart-surface">
            <div class="finance-chart-area">
              <div class="finance-chart-summary">
                <div class="finance-chart-summary__item">
                  <span class="finance-chart-summary__label">วันนี้</span>
                  <strong class="finance-chart-summary__value text-positive">{{
                    todayRevenue
                  }}</strong>
                </div>
                <div class="finance-chart-summary__divider" />
                <div class="finance-chart-summary__item">
                  <span class="finance-chart-summary__label">เมื่อวาน</span>
                  <strong class="finance-chart-summary__value">{{ yesterdayRevenue }}</strong>
                </div>
                <div class="finance-chart-summary__divider" />
                <div class="finance-chart-summary__item">
                  <span class="finance-chart-summary__label">เปลี่ยนแปลง</span>
                  <strong class="finance-chart-summary__value text-positive">{{
                    revenueChange
                  }}</strong>
                </div>
              </div>

              <div class="finance-bar-chart">
                <div v-for="(bar, i) in chartBars" :key="i" class="finance-bar-chart__col">
                  <div class="finance-bar-chart__bar-wrap">
                    <div
                      class="finance-bar-chart__bar"
                      :class="{ 'finance-bar-chart__bar--today': bar.isToday }"
                      :style="{ height: `${bar.percent}%` }"
                    >
                      <q-tooltip>{{ bar.label }}<br />{{ bar.amountLabel }}</q-tooltip>
                    </div>
                  </div>
                  <span class="finance-bar-chart__day">{{ bar.day }}</span>
                </div>
              </div>
            </div>
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
              <template #title>{{ $t(activity.title) }}</template>
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
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';

const { t } = useI18n();
const authStore = useAuthStore();

const chartPeriod = ref<'7d' | '30d'>('7d');
const currentUserFaculty = computed(() => authStore.user?.facName ?? authStore.user?.faculty ?? '');

const mockDashboardStats = [
  {
    label: 'finance.dashboard.totalRevenueToday',
    value: 48500,
    icon: 'payments',
    color: '#0d9488',
    tint: '#ccfbf1',
    trend: '+12%',
    trendColor: 'positive',
  },
  {
    label: 'finance.dashboard.pendingReview',
    value: 18,
    icon: 'hourglass_empty',
    color: '#d97706',
    tint: '#fef3c7',
    trend: '+4',
    trendColor: 'orange',
  },
  {
    label: 'finance.dashboard.totalTransactions',
    value: 248,
    icon: 'confirmation_number',
    color: '#2563eb',
    tint: '#dbeafe',
    trend: '+9%',
    trendColor: 'positive',
  },
  {
    label: 'finance.dashboard.receiptsIssued',
    value: '96.4%',
    icon: 'task_alt',
    color: '#059669',
    tint: '#d1fae5',
  },
];

const mockTrendSeriesByFaculty: Record<string, number[]> = {
  คอมพิวเตอร์และเทคโนโลยี: [125000, 148000, 132000, 155000, 172000, 188000],
  คณะวิทยาการสารสนเทศ: [250000, 280000, 260000, 310000, 290000, 340000],
};

const mockRecentActivities = [
  {
    title: 'finance.dashboard.confirmPayment',
    time: '2 นาทีที่แล้ว',
    detail: 'นิสิต ธนากร สุขใจ - ฿4,500 (บัตรเครดิต) #REC-70012',
    icon: 'credit_card',
    color: 'purple-5',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    title: 'finance.dashboard.confirmPayment',
    time: '15 นาทีที่แล้ว',
    detail: 'นิสิต พรเทพ ดีมาก - ฿3,200 (โอนเงิน) #REC-70001',
    icon: 'check_circle',
    color: 'positive',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    title: 'finance.dashboard.autoReceipt',
    time: '1 ชั่วโมงที่แล้ว',
    detail: 'ออกใบเสร็จอัตโนมัติ 5 รายการ - คอร์ส Data Science',
    icon: 'receipt',
    color: 'blue-6',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    title: 'finance.dashboard.confirmPayment',
    time: '2 ชั่วโมงที่แล้ว',
    detail: 'นิสิต สมชาย ใจดี - ฿1,200 (โอนเงิน) #REC-69001',
    icon: 'check_circle',
    color: 'positive',
    faculty: 'คณะวิทยาการสารสนเทศ',
  },
  {
    title: 'finance.dashboard.autoReceipt',
    time: '5 ชั่วโมงที่แล้ว',
    detail: 'สร้างใบเสร็จรับเงินอัตโนมัติสำหรับคอร์ส Finance Basics',
    icon: 'receipt_long',
    color: 'blue-7',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    title: 'finance.dashboard.confirmPayment',
    time: 'วันนี้ 09:30',
    detail: 'นิสิต นภัสสรณ์ รุ่งเรือง - ฿8,900 (QR Payment) #REC-70112',
    icon: 'qr_code',
    color: 'amber-8',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
];

interface ChartBarItem {
  day: string;
  label: string;
  amount: number;
  amountLabel: string;
  percent: number;
  isToday?: boolean;
}

const metricCards = computed(() =>
  mockDashboardStats.map((stat) => ({
    label: t(stat.label),
    value: typeof stat.value === 'number' ? formatCurrency(stat.value) : stat.value,
    icon: stat.icon,
    color: stat.color,
    tint: stat.tint,
    trendText: stat.trend ? `${stat.trend} จากสัปดาห์ก่อน` : '',
    trendIcon: stat.trend ? 'trending_up' : 'trending_flat',
    trendColor: stat.trendColor ?? 'grey-6',
  })),
);

const defaultTrendSeries = mockTrendSeriesByFaculty['คอมพิวเตอร์และเทคโนโลยี'] ?? [];

const trendSeries = computed<number[]>(() => {
  return mockTrendSeriesByFaculty[currentUserFaculty.value] ?? defaultTrendSeries;
});

const trendLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];

const chartBars = computed<ChartBarItem[]>(() => {
  const values = trendSeries.value;
  const max = values.length ? Math.max(...values) : 1;

  return values.map((amount, index) => ({
    day: trendLabels[index] ?? `W${index + 1}`,
    label: trendLabels[index] ?? `W${index + 1}`,
    amount,
    amountLabel: formatCurrency(amount),
    percent: Math.max(10, Math.round((amount / max) * 100)),
    isToday: index === values.length - 1,
  }));
});

const todayRevenue = computed(() =>
  formatCurrency(trendSeries.value[trendSeries.value.length - 1] ?? 0),
);
const yesterdayRevenue = computed(() =>
  formatCurrency(trendSeries.value[trendSeries.value.length - 2] ?? 0),
);
const revenueChange = computed(() => {
  const current = trendSeries.value[trendSeries.value.length - 1] ?? 0;
  const previous = trendSeries.value[trendSeries.value.length - 2] ?? 0;
  if (!previous) return '+0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
});

const recentActivities = computed(() => mockRecentActivities);

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

.finance-chart-surface {
  position: relative;
  display: grid;
  gap: 20px;
}

.finance-floating-summary {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: min(300px, calc(100% - 24px));
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.16);
  border: 1px solid rgba(14, 116, 144, 0.16);
  backdrop-filter: blur(4px);
}

.finance-floating-summary__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.finance-floating-summary__eyebrow {
  display: block;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #0f766e;
}

.finance-floating-summary__title {
  margin-top: 4px;
  font-size: 0.92rem;
  font-weight: 900;
  color: #10223f;
}

.finance-floating-summary__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(255, 215, 0, 0.18);
  color: #b45309;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.finance-floating-summary__items {
  display: grid;
  gap: 10px;
}

.finance-floating-summary__item {
  display: grid;
  grid-template-columns: 32px 1fr;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(16, 35, 63, 0.08);
}

.finance-floating-summary__item-icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.finance-floating-summary__item-copy {
  display: grid;
  gap: 2px;
}

.finance-floating-summary__item-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
}

.finance-floating-summary__item-value {
  font-size: 0.96rem;
  font-weight: 950;
  color: #10223f;
}

.finance-chart-area {
  display: grid;
  gap: 20px;
  padding-top: 104px;
}

.finance-chart-summary {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 16px 20px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid rgba(16, 35, 63, 0.07);
}

.finance-chart-summary__item {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 0 20px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }
}

.finance-chart-summary__label {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.finance-chart-summary__value {
  display: block;
  font-size: 1.15rem;
  font-weight: 950;
  color: #10223f;
  line-height: 1.2;
}

.finance-chart-summary__divider {
  width: 1px;
  height: 40px;
  background: rgba(16, 35, 63, 0.1);
  flex-shrink: 0;
}

.finance-bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 160px;
  padding: 0 4px 28px;
  position: relative;
}

.finance-bar-chart::before {
  content: '';
  position: absolute;
  inset: 0 0 28px 0;
  border-bottom: 2px solid rgba(16, 35, 63, 0.08);
  pointer-events: none;
}

.finance-bar-chart__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.finance-bar-chart__bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

.finance-bar-chart__bar {
  width: 100%;
  border-radius: 6px 6px 0 0;
  background: rgba(29, 78, 216, 0.22);
  transition: height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;

  &:hover {
    background: rgba(29, 78, 216, 0.38);
  }

  &--today {
    background: linear-gradient(180deg, #1d4ed8, #3b82f6);
    box-shadow: 0 4px 16px rgba(29, 78, 216, 0.3);
  }
}

.finance-bar-chart__day {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
  white-space: nowrap;
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
