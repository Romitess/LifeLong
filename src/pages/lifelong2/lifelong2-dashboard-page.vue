<template>
  <q-page class="lifelong2-page lifelong2-dashboard-page">
    <!-- Premium LLL Hero Header -->
    <AppPageHero
      eyebrow="BUU Lifelong Learning Console"
      eyebrow-icon="school"
      title="ระบบบริหารจัดการและแดชบอร์ด LLL"
      description="ภาพรวมการเรียนรู้ตลอดชีวิต การซิงค์ระบบ Moodle LMS บัญชีผู้เรียน และการสะสมหน่วยกิตคลังหน่วยกิต (BUU Credit Bank)"
    >
      <template #aside>
        <div class="row items-center q-gutter-sm">
          <q-btn
            round
            unelevated
            icon="sync"
            color="white"
            text-color="primary"
            class="lifelong2-sync-btn"
            :loading="isSyncing"
            @click="triggerMoodleSync"
          >
            <q-tooltip>ซิงค์ข้อมูลกับระบบ Moodle</q-tooltip>
          </q-btn>
          <q-badge
            rounded
            class="lifelong2-hero-status-badge text-weight-bolder"
            :color="syncSuccess ? 'positive' : 'warning'"
            :label="syncSuccess ? 'ซิงค์ระบบสำเร็จ' : 'ระบบรอดำเนินการ'"
          />
        </div>
      </template>
    </AppPageHero>

    <!-- Shell Container -->
    <section class="lifelong2-shell lifelong2-content">
      <q-banner v-if="errorMessage" rounded dense class="bg-negative text-white q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <!-- Sync Status Banner / Notification Alert -->
      <q-slide-transition>
        <div v-if="showSyncAlert" class="q-mb-md">
          <q-banner rounded class="lifelong2-alert-banner">
            <template #avatar>
              <q-avatar icon="cloud_sync" color="primary" text-color="white" />
            </template>
            <div class="text-weight-bold text-subtitle2">กำลังอัปเดตระบบสารสนเทศผู้เรียน LLL</div>
            <div class="text-caption text-grey-8">
              การเชื่อมโยงระบบ Moodle LMS ประมวลผลเสร็จสิ้น 100% ดึงรายชื่อผู้เรียนใหม่ 25 คน
              และส่งผ่าน Credit Bank 4 รายการ
            </div>
            <template #action>
              <q-btn flat color="primary" label="รับทราบ" @click="showSyncAlert = false" />
            </template>
          </q-banner>
        </div>
      </q-slide-transition>

      <!-- KPI Statistics Grid -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="kpi in customKpis" :key="kpi.id" class="col-12 col-sm-6 col-md-3">
          <q-card class="lifelong2-kpi-card" flat bordered>
            <div class="lifelong2-kpi-card__content">
              <div class="lifelong2-kpi-card__header row items-center justify-between">
                <span
                  class="lifelong2-kpi-card__icon"
                  :class="`lifelong2-kpi-card__icon--${kpi.tone}`"
                >
                  <q-icon :name="kpi.icon" size="22px" />
                </span>
                <span
                  class="lifelong2-kpi-card__delta"
                  :class="{
                    'lifelong2-kpi-card__delta--positive': kpi.delta >= 0,
                    'lifelong2-kpi-card__delta--negative': kpi.delta < 0,
                  }"
                >
                  <q-icon :name="kpi.delta >= 0 ? 'arrow_upward' : 'arrow_downward'" size="14px" />
                  {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta.toFixed(1) }}%
                </span>
              </div>
              <div class="lifelong2-kpi-card__body">
                <strong class="lifelong2-kpi-card__value">{{ kpi.valueString }}</strong>
                <span class="lifelong2-kpi-card__label">{{ kpi.label }}</span>
                <p class="lifelong2-kpi-card__description">{{ kpi.description }}</p>
              </div>

              <!-- Premium Custom Sparkline Graphic -->
              <div class="lifelong2-kpi-card__sparkline q-mt-sm">
                <svg viewBox="0 0 120 32" preserveAspectRatio="none">
                  <defs>
                    <linearGradient :id="`spark-grad-${kpi.id}`" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="var(--lll-gold)" stop-opacity="0.4" />
                      <stop offset="100%" stop-color="var(--lll-navy)" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    :d="getSparkAreaPath(kpi.trend)"
                    :fill="`url(#spark-grad-${kpi.id})`"
                    stroke="none"
                  />
                  <path
                    :d="getSparkLinePath(kpi.trend)"
                    fill="none"
                    stroke="var(--lll-gold)"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- Main Visualized Analytics Section -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <!-- Main Line Chart -->
        <div class="col-12 col-lg-8">
          <q-card class="lifelong2-surface-card full-height" flat bordered>
            <div class="q-px-lg q-pt-lg row items-center justify-between no-wrap">
              <div>
                <div class="text-overline text-primary text-weight-bold letter-spacing-lg">
                  Moodle Sync & Credit Bank Pipeline
                </div>
                <h3 class="text-h5 text-weight-bolder text-secondary q-my-none">
                  สถิติการเชื่อมโยงระบบนิสิตสะสม
                </h3>
              </div>
              <div>
                <q-btn-toggle
                  v-model="chartMetric"
                  no-caps
                  dense
                  unelevated
                  :options="[
                    { label: 'ลงทะเบียน', value: 'pipeline' },
                    { label: 'สะสมหน่วยกิต', value: 'credits' },
                  ]"
                  toggle-color="primary"
                  text-color="grey-8"
                  class="lifelong2-chart-toggle"
                />
              </div>
            </div>

            <q-card-section class="q-pt-md">
              <AdminAreaChart
                :series="areaChartSeries"
                :x-labels="dashboardSeries.months"
                :height="290"
                :format-y-tick="formatChartTick"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Donut Distribution Chart -->
        <div class="col-12 col-lg-4">
          <q-card class="lifelong2-surface-card full-height" flat bordered>
            <q-card-section class="q-px-lg q-pt-lg">
              <div class="text-overline text-primary text-weight-bold letter-spacing-lg">
                Course Types Mix
              </div>
              <h3 class="text-h5 text-weight-bolder text-secondary q-my-none">
                สัดส่วนประเภทรายวิชา
              </h3>
            </q-card-section>

            <q-card-section class="flex flex-center q-pb-lg">
              <AdminDonutChart
                :data="deliveryBreakdown"
                center-label="รายวิชา LLL"
                :center-value="formatCount(totals.courses)"
                center-hint="รวมในระบบ"
              />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Detail Leaderboards & Logs -->
      <div class="row q-col-gutter-lg">
        <!-- Top Performing Courses -->
        <div class="col-12 col-md-6">
          <q-card class="lifelong2-surface-card" flat bordered>
            <q-card-section class="q-px-lg q-pt-lg">
              <div class="text-overline text-primary text-weight-bold letter-spacing-lg">
                Popular LLL Courses
              </div>
              <h3 class="text-h6 text-weight-bolder text-secondary q-my-none">
                รายวิชาเรียนยอดนิยมสูงสุด
              </h3>
            </q-card-section>

            <q-separator class="opacity-12" />

            <div class="lifelong2-leaderboard">
              <div
                v-for="(course, index) in topCourses.slice(0, 5)"
                :key="course.id"
                class="lifelong2-leaderboard-item row items-center justify-between no-wrap"
              >
                <div class="row items-center no-wrap q-gutter-md">
                  <div class="lifelong2-rank-badge flex flex-center">
                    {{ index + 1 }}
                  </div>
                  <div class="column">
                    <span class="lifelong2-course-code text-weight-bold">{{ course.code }}</span>
                    <span class="lifelong2-course-title text-weight-bolder text-ellipsis">{{
                      course.title
                    }}</span>
                    <span class="lifelong2-course-meta text-caption text-grey-7">
                      <q-icon name="apartment" size="14px" class="q-mr-xs" />{{ course.faculty }}
                    </span>
                  </div>
                </div>
                <div class="text-right column items-end shrink-0">
                  <strong class="text-subtitle1 text-weight-bolder text-primary">
                    {{ formatCount(course.enrolledCount) }} ผู้เรียน
                  </strong>
                  <div class="lifelong2-progress-wrapper q-mt-xs">
                    <q-linear-progress
                      rounded
                      size="6px"
                      :value="course.paymentRate"
                      color="primary"
                    />
                  </div>
                  <span class="text-caption text-grey-6 q-mt-xs">
                    อัตราความสำเร็จ {{ Math.round(course.paymentRate * 100) }}%
                  </span>
                </div>
              </div>
            </div>
          </q-card>
        </div>

        <!-- Moodle LMS Sync and Credit Bank Actions -->
        <div class="col-12 col-md-6">
          <q-card class="lifelong2-surface-card" flat bordered>
            <q-card-section class="q-px-lg q-pt-lg">
              <div class="text-overline text-primary text-weight-bold letter-spacing-lg">
                LMS Sync & Credit Bank Log
              </div>
              <h3 class="text-h6 text-weight-bolder text-secondary q-my-none">
                ประวัติการซิงค์ & โอนย้ายล่าสุด
              </h3>
            </q-card-section>

            <q-separator class="opacity-12" />

            <div class="lifelong2-activities q-px-lg q-py-md">
              <q-list class="lifelong2-timeline-list">
                <q-item
                  v-for="(reg, i) in recentRegistrations.slice(0, 5)"
                  :key="reg.id"
                  class="q-px-none q-py-md lifelong2-timeline-item"
                >
                  <q-item-section avatar class="min-width-0 q-pr-sm">
                    <div
                      class="lifelong2-activity-avatar flex flex-center text-weight-bold"
                      :style="{ backgroundColor: getActivityAvatarColor(i) }"
                    >
                      {{ reg.learnerInitial }}
                    </div>
                  </q-item-section>

                  <q-item-section>
                    <div class="row items-center justify-between">
                      <span class="text-weight-bold text-secondary">{{ reg.learnerName }}</span>
                      <span class="text-caption text-grey-6">{{
                        formatRelativeTime(reg.registeredAt)
                      }}</span>
                    </div>
                    <div class="text-caption text-grey-8 q-mt-xs">
                      เชื่อมต่อระบบ Moodle LMS ในรายวิชา
                      <span class="text-primary text-weight-bold">{{ reg.courseTitle }}</span>
                    </div>
                    <div class="row items-center q-mt-sm q-gutter-sm">
                      <q-badge
                        outline
                        color="secondary"
                        class="lifelong2-tag"
                        label="Moodle Sync"
                      />
                      <q-badge
                        v-if="reg.paymentStatus === 'paid'"
                        color="primary"
                        class="lifelong2-tag"
                        label="Credit Bank โอนสำเร็จ"
                      />
                      <q-badge
                        v-else
                        color="positive"
                        class="lifelong2-tag"
                        label="หลักสูตรประกาศนียบัตร"
                      />
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card>
        </div>
      </div>

      <q-inner-loading :showing="isLoading" color="primary" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import AdminDonutChart from 'components/admin/AdminDonutChart.vue';
import AppPageHero from 'components/admin/AppPageHero.vue';
import { useAdminDashboardMetrics } from 'src/composables/use-admin-dashboard-metrics';
import { formatCount } from 'src/utils/course-format';

const $q = useQuasar();
const isSyncing = ref(false);
const syncSuccess = ref(true);
const showSyncAlert = ref(false);
const chartMetric = ref<'pipeline' | 'credits'>('pipeline');

const {
  isLoading,
  errorMessage,
  kpis,
  monthlySeries: dashboardSeries,
  deliveryBreakdown,
  topCourses,
  recentRegistrations,
  totals,
  refresh,
} = useAdminDashboardMetrics();

// Format numbers
function formatChartTick(value: number): string {
  return formatCount(Math.round(value));
}

// Moodle Sync Action trigger helper
function triggerMoodleSync() {
  isSyncing.value = true;

  // Simulate API call to moodle microservice sync
  setTimeout(() => {
    isSyncing.value = false;
    syncSuccess.value = true;
    showSyncAlert.value = true;

    // Refresh dashboard data
    void refresh();

    $q.notify({
      color: 'positive',
      textColor: 'white',
      icon: 'cloud_done',
      message: 'ซิงค์ฐานข้อมูลนิสิตและผลการเรียนรู้ Moodle สำเร็จ!',
      position: 'top',
      timeout: 3000,
    });
  }, 1800);
}

// Process Custom KPIs decorated for LLL Theme
interface CustomKpi {
  id: string;
  label: string;
  valueString: string;
  delta: number;
  description: string;
  icon: string;
  tone: 'gold' | 'navy' | 'teal' | 'rose';
  trend: number[];
}

const customKpis = computed<CustomKpi[]>(() => {
  return kpis.value.map((kpi) => {
    let customizedLabel = kpi.label;
    let customizedDesc = kpi.description;
    let iconName = kpi.icon;
    let tone: 'gold' | 'navy' | 'teal' | 'rose' = kpi.tone;
    let displayVal = kpi.value.toLocaleString('th-TH');

    if (kpi.id === 'revenue') {
      customizedLabel = 'ชำระเงินคลังหน่วยกิต';
      customizedDesc = 'รายได้สะสมในระบบ BUU Credit Bank';
      iconName = 'account_balance';
      tone = 'navy';
      displayVal = `฿${kpi.value.toLocaleString('th-TH')}`;
    } else if (kpi.id === 'enrollments') {
      customizedLabel = 'บัญชีที่เชื่อมระบบ Moodle';
      customizedDesc = 'จำนวนบัญชีผู้เรียนจริงใน Moodle LMS';
      iconName = 'cloud_sync';
      tone = 'gold';
    } else if (kpi.id === 'learners') {
      customizedLabel = 'ผู้เรียนสะสม (Credit Bank)';
      customizedDesc = 'ผู้เรียนที่มีข้อมูลหน่วยกิตในระบบธนาคาร';
      iconName = 'badge';
      tone = 'teal';
    } else if (kpi.id === 'paid-rate') {
      customizedLabel = 'อัตราการโอนย้ายสำเร็จ';
      customizedDesc = 'การอนุมัติเทียบโอนผลการเรียน LLL';
      iconName = 'workspace_premium';
      tone = 'rose';
      displayVal = `${kpi.value}%`;
    }

    return {
      id: kpi.id,
      label: customizedLabel,
      valueString: displayVal,
      delta: kpi.delta,
      description: customizedDesc,
      icon: iconName,
      tone: tone,
      trend: kpi.trend,
    };
  });
});

// Area chart values based on active metric tab
const areaChartSeries = computed<AreaChartSeries[]>(() => {
  if (chartMetric.value === 'credits') {
    return [
      {
        id: 'credit-enrollments',
        label: 'สะสมหน่วยกิตสำเร็จ (ราย)',
        color: '#f5a623',
        values: dashboardSeries.value.paidEnrollments,
        totalLabel: `${formatCount(
          dashboardSeries.value.paidEnrollments.reduce((sum, value) => sum + value, 0),
        )} รายการ`,
        formatValue: (value) => `${formatCount(Math.round(value))} รายการ`,
      },
    ];
  }

  return [
    {
      id: 'moodle-users',
      label: 'ซิงค์ข้อมูลผู้เรียน (ราย)',
      color: '#1a237e',
      values: dashboardSeries.value.enrollments,
      totalLabel: `${formatCount(
        dashboardSeries.value.enrollments.reduce((sum, value) => sum + value, 0),
      )} คน`,
      formatValue: (value) => `${formatCount(Math.round(value))} คน`,
    },
  ];
});

// Sparkline paths helpers
function getSparkLinePath(values: number[]): string {
  if (!values || values.length === 0) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const stepX = 120 / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = 28 - ((value - min) / range) * 24;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function getSparkAreaPath(values: number[]): string {
  const linePath = getSparkLinePath(values);
  if (!linePath) return '';
  return `${linePath} L 120 32 L 0 32 Z`;
}

// Activity colors helper
const ACTIVITY_AVATAR_COLORS = [
  'rgba(26, 35, 126, 0.12)',
  'rgba(245, 166, 35, 0.12)',
  'rgba(76, 175, 80, 0.12)',
  'rgba(233, 30, 99, 0.12)',
  'rgba(156, 39, 176, 0.12)',
];

function getActivityAvatarColor(index: number): string {
  return ACTIVITY_AVATAR_COLORS[index % ACTIVITY_AVATAR_COLORS.length] ?? 'rgba(26, 35, 126, 0.12)';
}

// Relative times formatter
const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('th-TH', { numeric: 'auto' });

function formatRelativeTime(iso: string | null): string {
  if (!iso) return '-';
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((target - now) / (60 * 1000));

  if (Math.abs(diffMinutes) < 60) {
    return RELATIVE_TIME_FORMATTER.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return RELATIVE_TIME_FORMATTER.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return RELATIVE_TIME_FORMATTER.format(diffDays, 'day');
}
</script>

<style lang="scss" scoped>
.lifelong2-dashboard-page {
  --illus-gradient: linear-gradient(135deg, var(--lll-navy-deep), var(--lll-navy));
}

.lifelong2-sync-btn {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  transition: transform 0.22s ease;
  &:hover {
    transform: rotate(30deg) scale(1.05);
  }
}

.lifelong2-hero-status-badge {
  padding: 8px 14px;
  font-size: 0.82rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.lifelong2-alert-banner {
  background: var(--lll-navy-soft) !important;
  border-left: 5px solid var(--lll-navy);
  border-radius: var(--lll-radius-md);
  color: var(--lll-ink);
}

.lifelong2-kpi-card {
  border: none !important;
  border-radius: var(--lll-radius-lg) !important;
  background: var(--lll-surface);
  box-shadow: var(--lll-shadow-sm) !important;
  padding: 22px 24px;
  min-height: 184px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--lll-shadow-md) !important;
    border-color: rgba(245, 166, 35, 0.3) !important;
  }

  &__content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    justify-content: space-between;
  }

  &__header {
    margin-bottom: 12px;
  }

  &__icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;

    &--navy {
      background: rgba(26, 35, 126, 0.12);
      color: var(--lll-navy);
    }
    &--gold {
      background: rgba(245, 166, 35, 0.15);
      color: var(--lll-gold-deep);
    }
    &--teal {
      background: rgba(15, 118, 110, 0.12);
      color: #0f766e;
    }
    &--rose {
      background: rgba(225, 29, 72, 0.12);
      color: #e11d48;
    }
  }

  &__delta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 99px;
    font-size: 0.74rem;
    font-weight: 800;

    &--positive {
      background: rgba(76, 175, 80, 0.15);
      color: #2e7d32;
    }
    &--negative {
      background: rgba(244, 67, 54, 0.15);
      color: #c62828;
    }
  }

  &__value {
    color: var(--lll-navy-deep);
    font-size: 1.85rem;
    font-weight: 950;
    line-height: 1.1;
  }

  &__label {
    display: block;
    color: var(--lll-ink);
    font-weight: 800;
    margin-top: 4px;
    font-size: 0.95rem;
  }

  &__description {
    margin: 2px 0 0;
    color: var(--lll-muted);
    font-size: 0.8rem;
    font-weight: 600;
  }

  &__sparkline {
    height: 32px;
    width: 100%;
    margin-top: 8px;
    opacity: 0.85;
  }
}

.lifelong2-chart-toggle {
  background: rgba(26, 35, 126, 0.05);
  border-radius: 10px;
  padding: 4px;

  :deep(.q-btn) {
    border-radius: 8px !important;
    font-size: 0.8rem;
    font-weight: 800;
    padding: 0 14px;
    min-height: 30px;
  }
}

.lifelong2-leaderboard {
  display: flex;
  flex-direction: column;
}

.lifelong2-leaderboard-item {
  padding: 18px 24px;
  border-bottom: 1px solid rgba(26, 35, 126, 0.06);
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(245, 166, 35, 0.06);
  }

  &:last-child {
    border-bottom: none;
  }
}

.lifelong2-rank-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(26, 35, 126, 0.08);
  color: var(--lll-navy);
  font-weight: 900;
  font-size: 0.85rem;
}

.lifelong2-course-code {
  color: var(--lll-gold-deep);
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}

.lifelong2-course-title {
  color: var(--lll-navy);
  font-size: 0.92rem;
  line-height: 1.35;
}

.lifelong2-progress-wrapper {
  width: 120px;
}

.lifelong2-activity-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  color: var(--lll-navy);
  font-size: 0.95rem;
}

.lifelong2-timeline-item {
  border-bottom: 1px solid rgba(26, 35, 126, 0.04);
  &:last-child {
    border-bottom: none;
  }
}

.lifelong2-tag {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.letter-spacing-lg {
  letter-spacing: 0.1em;
}
</style>
