<template>
  <q-page class="admin-page finance-dashboard-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <AdminPageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="account_balance"
      :title="$t('centralFinance.dashboard.hero.title')"
      :description="$t('centralFinance.dashboard.hero.desc')"
    >
      <template #actions>
        <AdminActionButton
          icon="description"
          :label="$t('centralFinance.dashboard.actions.fundRequests')"
          no-caps
          @click="onGotoFundSources"
        />
        <AdminActionButton
          variant="outline"
          icon="file_download"
          :label="$t('centralFinance.dashboard.actions.exportReport')"
          no-caps
          @click="onGoToReports"
        />
      </template>
    </AdminPageHero>

    <!-- ── Content ───────────────────────────────────────────── -->
    <section class="admin-shell admin-content">
      <!-- Metric Cards -->
      <div class="finance-stat-grid">
        <AdminMetricCard
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
        </AdminMetricCard>
      </div>

      <!-- Main Grid: Revenue Chart + Fund Source Summary -->
      <div class="finance-main-grid">
        <!-- Revenue Chart -->
        <AdminSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.revenueChart.eyebrow')"
          :title="$t('centralFinance.dashboard.revenueChart.title')"
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
                { label: `7 ${$t('day')}`, value: '7d' },
                { label: `30 ${$t('day')}`, value: '30d' },
              ]"
              class="finance-period-toggle"
            />
          </template>

          <div class="finance-chart-area">
            <div class="finance-chart-summary">
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">{{
                  $t('centralFinance.dashboard.revenueChart.today')
                }}</span>
                <strong class="finance-chart-summary__value text-positive">{{
                  todayRevenue
                }}</strong>
              </div>
              <div class="finance-chart-summary__divider" />
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">{{
                  $t('centralFinance.dashboard.revenueChart.yesterday')
                }}</span>
                <strong class="finance-chart-summary__value">{{ yesterdayRevenue }}</strong>
              </div>
              <div class="finance-chart-summary__divider" />
              <div class="finance-chart-summary__item">
                <span class="finance-chart-summary__label">{{
                  $t('centralFinance.dashboard.revenueChart.change')
                }}</span>
                <strong class="finance-chart-summary__value" :class="changeClass">{{
                  revenueChange
                }}</strong>
              </div>
            </div>

            <!-- Bar Chart (CSS-only) -->
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
        </AdminSurfaceCard>

        <!-- Fund Source Request Status -->
        <AdminSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.fundSourceStatus.eyebrow')"
          :title="$t('centralFinance.dashboard.fundSourceStatus.title')"
          card-class="finance-panel finance-panel--status"
        >
          <div class="finance-status-list">
            <div v-for="item in fundSourceStatus" :key="item.label" class="finance-status-item">
              <div
                class="finance-status-item__icon"
                :style="{ background: item.bg, color: item.color }"
              >
                <q-icon :name="item.icon" size="20px" />
              </div>
              <div class="finance-status-item__info">
                <strong>{{ item.count }}</strong>
                <span>{{ item.label }}</span>
              </div>
              <q-badge rounded :color="item.badgeColor" :label="item.badge" />
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="finance-quick-links">
            <p class="finance-quick-links__title">
              {{ $t('centralFinance.dashboard.quickLinks.title') }}
            </p>
            <AdminActionButton
              variant="secondary"
              icon="add_circle_outline"
              :label="$t('centralFinance.dashboard.quickLinks.addFundSource')"
              icon-right="arrow_forward"
              no-caps
              class="full-width"
              @click="onAddFundSource"
            />
            <AdminActionButton
              variant="secondary"
              icon="file_download"
              :label="$t('centralFinance.dashboard.quickLinks.dailyReport')"
              icon-right="arrow_forward"
              no-caps
              class="full-width"
              @click="onGoToReports"
            />
          </div>
        </AdminSurfaceCard>
      </div>

      <!-- Bottom Grid: Activities + Shortcuts -->
      <div class="finance-bottom-grid">
        <!-- Recent Activities -->
        <AdminSurfaceCard
          :eyebrow="$t('centralFinance.dashboard.activities.eyebrow')"
          :title="$t('centralFinance.dashboard.activities.title')"
          card-class="finance-panel finance-panel--activity"
        >
          <q-timeline color="primary" layout="dense" class="finance-timeline">
            <q-timeline-entry
              v-for="activity in recentActivities"
              :key="activity.title"
              :icon="activity.icon"
              :color="activity.color"
            >
              <template #title>{{ activity.title }}</template>
              <template #subtitle>{{ activity.time }}</template>
              <div class="finance-timeline__detail">{{ activity.detail }}</div>
            </q-timeline-entry>
          </q-timeline>
        </AdminSurfaceCard>

        <!-- Quick Access Shortcuts -->
        <div class="finance-shortcut-stack">
          <AdminSurfaceCard
            v-for="item in shortcuts"
            :key="item.title"
            :eyebrow="$t('centralFinance.dashboard.shortcuts.eyebrow')"
            :title="item.title"
            card-class="finance-shortcut-card"
          >
            <div class="finance-shortcut-card__body">
              <div
                class="finance-shortcut-card__icon"
                :style="{ background: item.bg, color: item.color }"
              >
                <q-icon :name="item.icon" size="28px" />
              </div>
              <p>{{ item.detail }}</p>
              <AdminActionButton
                variant="secondary"
                :label="$t('centralFinance.dashboard.shortcuts.openPage')"
                icon-right="arrow_forward"
                no-caps
                @click="onShortcutClick(item.to)"
              />
            </div>
          </AdminSurfaceCard>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import AdminMetricCard from 'components/admin/AdminMetricCard.vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

const router = useRouter();
const { t } = useI18n();
const financeStore = useCentralFinanceStore();
const chartPeriod = ref<'7d' | '30d'>('7d');

async function onAddFundSource() {
  await router.push('/central-finance/fund-sources/add');
}
async function onGotoFundSources() {
  await router.push('/central-finance/fund-sources');
}
async function onGoToReports() {
  await router.push('/central-finance/reports');
}

async function onShortcutClick(to: string) {
  await router.push(to);
}

// ── Metric Cards ────────────────────────────────────────────
const metricCards = computed(() => [
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
    label: t('centralFinance.dashboard.metrics.completedToday'),
    value: financeStore.requests.filter((r) => r.status === 'completed').length.toString(),
    icon: 'task_alt',
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.12)',
    trendIcon: 'trending_up',
    trendColor: 'positive',
    trendText: t('centralFinance.dashboard.metrics.trendUp', { value: '12%' }),
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
    label: t('centralFinance.dashboard.metrics.totalFundSources'),
    value: financeStore.fundSources.length.toString(),
    icon: 'account_tree',
    color: '#7c3aed',
    tint: 'rgba(124, 58, 237, 0.12)',
    trendIcon: 'trending_flat',
    trendColor: 'grey-6',
    trendText: t('centralFinance.dashboard.metrics.trendNeutral'),
  },
]);

// ── Revenue Chart Data ──────────────────────────────────────
const todayRevenue = '฿1,248,500';
const yesterdayRevenue = '฿1,152,300';
const revenueChange = '+8.4%';
const changeClass = 'text-positive';

const rawBars = [
  { day: t('centralFinance.dashboard.revenueChart.days.mon'), amount: 980000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.tue'), amount: 1152300, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.wed'), amount: 870000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.thu'), amount: 1340000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.fri'), amount: 1100000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.sat'), amount: 430000, isToday: false },
  { day: t('centralFinance.dashboard.revenueChart.days.today'), amount: 1248500, isToday: true },
];

const chartBars = computed(() => {
  const max = Math.max(...rawBars.map((b) => b.amount));
  return rawBars.map((b) => ({
    ...b,
    percent: Math.max(8, Math.round((b.amount / max) * 100)),
    amountLabel: `฿${b.amount.toLocaleString('th-TH')}`,
    label: b.day,
  }));
});

// ── Fund Source Status ──────────────────────────────────────
const fundSourceStatus = computed(() => [
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
    label: t('centralFinance.dashboard.fundSourceStatus.completed'),
    count: financeStore.requests.filter((r) => r.status === 'completed').length,
    icon: 'check_circle',
    bg: 'rgba(4, 120, 87, 0.12)',
    color: '#047857',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.completed'),
    badgeColor: 'positive',
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
    label: t('centralFinance.dashboard.fundSourceStatus.rejected'),
    count: financeStore.requests.filter((r) => r.status === 'rejected').length,
    icon: 'reply',
    bg: 'rgba(220, 38, 38, 0.1)',
    color: '#b91c1c',
    badge: t('centralFinance.dashboard.fundSourceStatus.badges.rejected'),
    badgeColor: 'negative',
  },
]);

// ── Recent Activities ───────────────────────────────────────
const recentActivities = computed(() => [
  {
    title: t('centralFinance.dashboard.activities.items.scienceFacultyRequest'),
    time: t('centralFinance.dashboard.activities.items.scienceFacultyTime'),
    detail: t('centralFinance.dashboard.activities.items.scienceFacultyDetail'),
    icon: 'add_circle',
    color: 'teal',
  },
  {
    title: t('centralFinance.dashboard.activities.items.issueSuccess'),
    time: t('centralFinance.dashboard.activities.items.issueTime'),
    detail: t('centralFinance.dashboard.activities.items.issueDetail'),
    icon: 'receipt_long',
    color: 'primary',
  },
  {
    title: t('centralFinance.dashboard.activities.items.exportSuccess'),
    time: t('centralFinance.dashboard.activities.items.exportTime'),
    detail: t('centralFinance.dashboard.activities.items.exportDetail'),
    icon: 'file_download',
    color: 'orange',
  },
  {
    title: t('centralFinance.dashboard.activities.items.nursingFacultyRequest'),
    time: t('centralFinance.dashboard.activities.items.nursingFacultyTime'),
    detail: t('centralFinance.dashboard.activities.items.nursingFacultyDetail'),
    icon: 'upload_file',
    color: 'blue',
  },
  {
    title: t('centralFinance.dashboard.activities.items.editReturned'),
    time: t('centralFinance.dashboard.activities.items.editTime'),
    detail: t('centralFinance.dashboard.activities.items.editDetail'),
    icon: 'reply',
    color: 'negative',
  },
]);

// ── Quick Shortcuts ─────────────────────────────────────────
const shortcuts = computed(() => [
  {
    icon: 'add_circle_outline',
    title: t('centralFinance.dashboard.quickLinks.addFundSource'),
    detail: t('centralFinance.dashboard.shortcuts.addFundSourceDetail'),
    bg: 'rgba(4, 120, 87, 0.1)',
    color: '#047857',
    to: '/central-finance/fund-sources',
  },
  {
    icon: 'summarize',
    title: t('centralFinance.dashboard.actions.exportReport'),
    detail: t('centralFinance.dashboard.shortcuts.exportReportDetail'),
    bg: 'rgba(29, 78, 216, 0.1)',
    color: '#1d4ed8',
    to: '/central-finance/reports',
  },
]);
</script>

<style lang="scss" scoped>
// ── Pulse Card (Hero Aside) ──────────────────────────────────
.finance-pulse-card-shell {
  padding-top: 18px;
}

.finance-pulse-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.finance-pulse-card {
  min-height: 110px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  align-content: space-between;

  strong {
    font-size: 1.7rem;
    line-height: 1;
  }

  span {
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.82rem;
    font-weight: 700;
  }
}

// ── Metric Cards Grid ────────────────────────────────────────
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

// ── Main Grid ────────────────────────────────────────────────
.finance-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
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
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--admin-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.finance-chart-summary__value {
  display: block;
  font-size: 1.15rem;
  font-weight: 950;
  color: var(--admin-navy);
  line-height: 1.2;
}

.finance-chart-summary__divider {
  width: 1px;
  height: 40px;
  background: rgba(16, 35, 63, 0.1);
  flex-shrink: 0;
}

// Bar Chart
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
  font-weight: 700;
  color: var(--admin-muted);
  white-space: nowrap;
}

.finance-period-toggle {
  border: 1px solid rgba(16, 35, 63, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

// ── Fund Source Status ───────────────────────────────────────
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
    color: var(--admin-navy);
    line-height: 1;
  }

  span {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--admin-muted);
  }
}

.finance-quick-links {
  display: grid;
  gap: 10px;
}

.finance-quick-links__title {
  margin: 0 0 4px;
  font-size: 0.75rem;
  font-weight: 900;
  color: #b7791f;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

// ── Bottom Grid ──────────────────────────────────────────────
.finance-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}

.finance-timeline__detail {
  font-size: 0.88rem;
  color: var(--admin-muted);
  margin-top: 3px;
}

// ── Shortcut Stack ───────────────────────────────────────────
.finance-shortcut-stack {
  display: grid;
  gap: 18px;
  align-content: start;
}

.finance-shortcut-card {
  height: auto;
}

.finance-shortcut-card__body {
  display: grid;
  gap: 12px;

  p {
    margin: 0;
    color: var(--admin-muted);
    font-size: 0.88rem;
    line-height: 1.6;
  }
}

.finance-shortcut-card__icon {
  display: inline-grid;
  place-items: center;
  width: 54px;
  height: 54px;
  border-radius: 18px;
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
  .finance-pulse-grid {
    grid-template-columns: 1fr;
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
