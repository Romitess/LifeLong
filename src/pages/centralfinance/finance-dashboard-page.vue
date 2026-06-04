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

      <!-- ── Row 2: Revenue Chart + Request Pipeline ─────────── -->
      <div class="finance-main-grid">
        <!-- Revenue Chart -->
        <CentralFinanceSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.revenueChart.eyebrow')"
          :title="$t('centralFinance.dashboard.revenueChart.title')"
          card-class="finance-panel"
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
                { label: `7 ${$t('day')}`, value: '7d' },
                { label: `30 ${$t('day')}`, value: '30d' },
              ]"
              class="finance-period-toggle"
            />
          </template>

          <div class="finance-chart-area">
            <div class="finance-chart-summary">
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">
                  {{ $t('centralFinance.dashboard.revenueChart.today') }}
                </span>
                <strong class="finance-chart-summary__value text-positive">
                  {{ todayRevenue }}
                </strong>
              </div>
              <div class="finance-chart-summary__divider" />
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">
                  {{ $t('centralFinance.dashboard.revenueChart.yesterday') }}
                </span>
                <strong class="finance-chart-summary__value">{{ yesterdayRevenue }}</strong>
              </div>
              <div class="finance-chart-summary__divider" />
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">
                  {{ $t('centralFinance.dashboard.revenueChart.change') }}
                </span>
                <strong class="finance-chart-summary__value" :class="changeClass">
                  {{ revenueChange }}
                </strong>
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
        </CentralFinanceSurfaceCard>

        <!-- Request Pipeline -->
        <CentralFinanceSurfaceCard
          eyebrow="Fund Requests"
          :title="$t('centralFinance.dashboard.fundSourceStatus.title')"
          card-class="finance-panel"
        >
          <!-- Completion Rate Header -->
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

          <!-- Progress Bars per Status -->
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
        </CentralFinanceSurfaceCard>
      </div>

      <!-- ── Row 3: Activity Feed + Pending Requests ──────────── -->
      <div class="finance-bottom-grid">
        <!-- Activity Feed -->
        <CentralFinanceSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.activities.eyebrow')"
          :title="$t('centralFinance.dashboard.activities.title')"
          card-class="finance-panel"
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

        <!-- Pending Requests -->
        <CentralFinanceSurfaceCard
          eyebrow="Action Required"
          title="รายการรอดำเนินการ"
          card-class="finance-panel"
        >
          <template #header-actions>
            <q-badge
              v-if="pendingRequests.length > 0"
              rounded
              color="warning"
              :label="pendingRequests.length"
              class="text-weight-bold"
            />
          </template>

          <div v-if="pendingRequests.length === 0" class="pending-empty">
            <q-icon name="check_circle_outline" size="42px" color="positive" />
            <p>ไม่มีรายการรอดำเนินการ</p>
          </div>

          <div v-else class="pending-list">
            <div
              v-for="req in pendingRequests"
              :key="req.id"
              class="pending-item"
              @click="router.push('/central-finance/fund-sources')"
            >
              <div class="pending-item__left">
                <div
                  class="pending-item__status-dot"
                  :class="`pending-item__status-dot--${req.status}`"
                />
                <div class="pending-item__info">
                  <div class="pending-item__id">{{ req.requestId }}</div>
                  <div class="pending-item__faculty">{{ req.faculty }}</div>
                  <div class="pending-item__project">{{ req.project }}</div>
                </div>
              </div>
              <q-badge
                :color="req.status === 'new' ? 'warning' : 'blue-7'"
                :label="req.status === 'new' ? 'รอรับเรื่อง' : 'กำลังตรวจสอบ'"
                class="pending-item__badge"
              />
            </div>
          </div>

          <q-btn
            v-if="pendingRequests.length > 0"
            flat
            no-caps
            color="primary"
            icon-right="arrow_forward"
            label="จัดการคำขอทั้งหมด"
            class="full-width q-mt-md pipeline-goto-btn"
            @click="router.push('/central-finance/fund-sources')"
          />
        </CentralFinanceSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

const router = useRouter();
const { t } = useI18n();
const financeStore = useCentralFinanceStore();
const chartPeriod = ref<'7d' | '30d'>('7d');

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

interface FundSourceStatusItem {
  label: string;
  count: number;
  icon: string;
  color: string;
  bg: string;
  badge: string;
  badgeColor: string;
}

interface ActivityItem {
  title: string;
  time: string;
  detail: string;
  icon: string;
  color: string;
}

interface ChartBarItem {
  day: string;
  label: string;
  amount: number;
  amountLabel: string;
  percent: number;
  isToday?: boolean;
}

// ── Metric Cards ────────────────────────────────────────────
const metricCards = computed<MetricCard[]>(() => [
  {
    label: t('centralFinance.dashboard.metrics.pending'),
    value: financeStore.requests.filter((r) => r.status === 'new').length.toString(),
    icon: 'pending_actions',
    color: '#b45309',
    tint: 'rgba(180, 83, 9, 0.12)',
    trendIcon: 'trending_up',
    trendColor: 'negative',
    trendText: t('centralFinance.dashboard.metrics.trendUp', { value: '3' }),
  },
  {
    label: t('centralFinance.dashboard.metrics.monthlyRevenue'),
    value: '฿38,742,000',
    icon: 'account_balance_wallet',
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.12)',
    trendIcon: 'trending_up',
    trendColor: 'positive',
    trendText: t('centralFinance.dashboard.metrics.trendUp', { value: '8.2%' }),
  },
  {
    label: t('centralFinance.dashboard.metrics.todayRevenue'),
    value: '฿1,248,500',
    icon: 'payments',
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.12)',
    trendIcon: 'trending_up',
    trendColor: 'positive',
    trendText: t('centralFinance.dashboard.metrics.trendUp', { value: '8.4%' }),
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

// ── Revenue Chart ───────────────────────────────────────────
const todayRevenue = ref<string>('฿1,248,500');
const yesterdayRevenue = ref<string>('฿1,152,300');
const revenueChange = ref<string>('+8.4%');
const changeClass = ref<string>('text-positive');

const rawBars = [
  { day: t('centralFinance.dashboard.revenueChart.days.mon'), amount: 980000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.tue'), amount: 1152300, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.wed'), amount: 870000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.thu'), amount: 1340000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.fri'), amount: 1100000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.sat'), amount: 430000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.today'), amount: 1248500, isToday: true },
];

const chartBars = computed<ChartBarItem[]>(() => {
  const max = Math.max(...rawBars.map((b) => b.amount));
  return rawBars.map((b) => ({
    ...b,
    percent: Math.max(8, Math.round((b.amount / max) * 100)),
    amountLabel: `฿${b.amount.toLocaleString('th-TH')}`,
    label: b.day,
  }));
});

// ── Request Pipeline ────────────────────────────────────────
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
    icon: 'hourglass_top',
    bg: 'rgba(217, 119, 6, 0.12)',
    color: '#b45309',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.pending'),
    badgeColor: 'warning',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.processing'),
    count: financeStore.requests.filter((r) => r.status === 'processing').length,
    icon: 'find_in_page',
    bg: 'rgba(29, 78, 216, 0.12)',
    color: '#1d4ed8',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.processing'),
    badgeColor: 'blue-7',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.completed'),
    count: financeStore.requests.filter((r) => r.status === 'completed').length,
    icon: 'check_circle',
    bg: 'rgba(4, 120, 87, 0.12)',
    color: '#047857',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.completed'),
    badgeColor: 'positive',
  },
  {
    label: t('centralFinance.dashboard.fundSourceStatus.rejected'),
    count: financeStore.requests.filter((r) => r.status === 'rejected').length,
    icon: 'reply',
    bg: 'rgba(220, 38, 38, 0.1)',
    color: '#b91c1c',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.rejected'),
    badgeColor: 'negative',
  },
]);

// ── Pending Requests ────────────────────────────────────────
const pendingRequests = computed(() =>
  financeStore.requests.filter((r) => r.status === 'new' || r.status === 'processing').slice(0, 5),
);

// ── Recent Activities ───────────────────────────────────────
const recentActivities = computed<ActivityItem[]>(() =>
  financeStore.requests
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5)
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

// ── Revenue Chart ────────────────────────────────────────────
.finance-chart-area {
  display: grid;
  gap: 20px;
}

.finance-chart-summary {
  display: flex;
  align-items: center;
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
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--finance-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.finance-chart-summary__value {
  display: block;
  font-size: 1.15rem;
  font-weight: 950;
  color: var(--finance-navy);
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

  &::before {
    content: '';
    position: absolute;
    inset: 0 0 28px 0;
    border-bottom: 2px solid rgba(16, 35, 63, 0.08);
    pointer-events: none;
  }
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
  font-weight: 700;
  color: var(--finance-muted);
  white-space: nowrap;
}

.finance-period-toggle {
  border: 1px solid rgba(16, 35, 63, 0.12);
  border-radius: 10px;
  overflow: hidden;
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
  color: var(--finance-navy);
  line-height: 1;
}

.pipeline-summary__label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--finance-muted);
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
  color: var(--finance-muted);
}

.pipeline-bar-row__count {
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--finance-navy);
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

// ── Bottom Grid ──────────────────────────────────────────────
.finance-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.finance-timeline__detail {
  font-size: 0.88rem;
  color: var(--finance-muted);
  margin-top: 3px;
}

// ── Pending Requests ─────────────────────────────────────────
.pending-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 0;
  color: var(--finance-muted);

  p {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.pending-list {
  display: grid;
  gap: 10px;
}

.pending-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(16, 35, 63, 0.08);
  background: #fbfcfd;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background: #f0f7ff;
    border-color: rgba(29, 78, 216, 0.2);
    transform: translateX(2px);
  }
}

.pending-item__left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.pending-item__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;

  &--new {
    background: #b45309;
  }
  &--processing {
    background: #1d4ed8;
  }
}

.pending-item__info {
  min-width: 0;
}

.pending-item__id {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--finance-muted);
  letter-spacing: 0.04em;
}

.pending-item__faculty {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--finance-navy);
  margin-top: 1px;
}

.pending-item__project {
  font-size: 0.78rem;
  color: var(--finance-muted);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.pending-item__badge {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 800;
}

// ── Responsive ───────────────────────────────────────────────
@media (max-width: 1100px) {
  .finance-stat-grid,
  .finance-main-grid,
  .finance-bottom-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
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

  .pipeline-summary {
    gap: 16px;
  }
}
</style>
