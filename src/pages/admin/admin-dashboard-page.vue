<template>
  <q-page class="admin-page admin-dashboard-page">
    <AppPageHero
      eyebrow="BUU Lifelong Admin Console"
      eyebrow-icon="admin_panel_settings"
      title="แดชบอร์ดผู้ดูแลระบบ"
      description="ภาพรวมหลักสูตร ผู้สอน ผู้เรียน และรายได้สำหรับการดูแลระบบในที่เดียว"
    >
      <template #aside>
        <q-badge
          rounded
          color="positive"
          :label="heroBadgeLabel"
          class="admin-dashboard__hero-badge"
        />
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <q-banner v-if="errorMessage" rounded dense class="bg-negative text-white q-mb-md">
        {{ errorMessage }}
      </q-banner>

      <PeriodFilterBar v-model="periodModel" @change="onPeriodChange" />

      <div class="row q-col-gutter-md admin-dashboard__pulse">
        <div v-for="item in systemPulse" :key="item.label" class="col-12 col-sm-6 col-md-3">
          <BaseInfoCard
            variant="stat"
            :tone="item.tone"
            :icon="item.icon"
            :value="item.value"
            :title="item.label"
            :description="item.description"
          />
        </div>
      </div>

      <div class="admin-dashboard__kpis">
        <BaseInfoCard
          v-for="kpi in animatedKpis"
          :key="kpi.id"
          variant="stat"
          tone="primary"
          icon=""
          title=""
          description=""
          class="admin-kpi-card"
          :class="`admin-kpi-card--${kpi.tone}`"
        >
          <div class="admin-kpi-card__content">
            <div class="admin-kpi-card__header">
              <span class="admin-kpi-card__icon">
                <q-icon :name="kpi.icon" size="22px" />
              </span>
              <span
                class="admin-kpi-card__delta"
                :class="{
                  'admin-kpi-card__delta--positive': kpi.delta >= 0,
                  'admin-kpi-card__delta--negative': kpi.delta < 0,
                }"
              >
                <q-icon :name="kpi.delta >= 0 ? 'trending_up' : 'trending_down'" size="14px" />
                {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta.toFixed(1) }}%
              </span>
            </div>
            <strong class="admin-kpi-card__value">{{
              kpi.id === 'revenue'
                ? formatCompactCurrency(Math.round(kpi.value))
                : kpi.id === 'paid-rate'
                  ? Math.round(kpi.value * 10) / 10 + '%'
                  : formatCount(Math.round(kpi.value))
            }}</strong>
            <span class="admin-kpi-card__label">{{ kpi.label }}</span>
            <p class="admin-kpi-card__description">{{ kpi.description }}</p>
            <div class="admin-kpi-card__sparkline">
              <svg
                :key="chartKey"
                viewBox="0 0 120 36"
                preserveAspectRatio="none"
                class="admin-kpi-card__sparkline-svg"
              >
                <defs>
                  <linearGradient :id="`spark-${kpi.id}`" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="currentColor" stop-opacity="0.4" />
                    <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path
                  :d="getSparkAreaPath(kpi.trend)"
                  :fill="`url(#spark-${kpi.id})`"
                  stroke="none"
                />
                <path
                  :d="getSparkLinePath(kpi.trend)"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <span class="admin-kpi-card__delta-label">{{ kpi.deltaLabel }}</span>
          </div>
        </BaseInfoCard>
      </div>

      <div class="admin-dashboard__main-row">
        <AppSurfaceCard
          :eyebrow="primaryChartContent.eyebrow"
          :title="primaryChartContent.title"
          :subtitle="periodLabel"
          card-class="admin-dashboard__panel admin-dashboard__panel--chart"
        >
          <template #header-actions>
            <q-btn-toggle
              v-model="chartMetric"
              no-caps
              dense
              unelevated
              :options="chartMetricOptions"
              toggle-color="primary"
              text-color="grey-8"
              class="admin-chart-toggle"
            />
          </template>

          <AdminAreaChart
            :key="chartKey"
            :series="areaChartSeries"
            :x-labels="dashboardSeries.months"
            :height="280"
            :format-y-tick="formatChartTick"
            :aria-label="primaryChartContent.title"
          />
        </AppSurfaceCard>

        <AppSurfaceCard
          eyebrow="Enrollment Mix"
          title="สัดส่วนการลงทะเบียน"
          :subtitle="periodLabel"
          card-class="admin-dashboard__panel admin-dashboard__panel--donut"
        >
          <AdminDonutChart
            :key="chartKey"
            :data="deliveryBreakdown"
            center-label="ผู้ลงทะเบียน"
            :center-value="formatCount(totals.enrolledLearners)"
            center-hint="รวมทุกสถานะ"
          />
        </AppSurfaceCard>
      </div>

      <div class="admin-dashboard__mid-row">
        <AppSurfaceCard
          eyebrow="Category Performance"
          title="ผู้ลงทะเบียนตามหมวดหมู่"
          :subtitle="periodLabel"
          card-class="admin-dashboard__panel"
        >
          <AdminBarChart
            :key="chartKey"
            :items="categoryBarItems"
            :format-value="(value) => `${formatCount(value)} คน`"
          />
        </AppSurfaceCard>

        <AppSurfaceCard
          eyebrow="Top Performing Courses"
          title="คอร์สยอดนิยม"
          :subtitle="periodLabel"
          body-padding="none"
          card-class="admin-dashboard__panel"
        >
          <ul :key="chartKey" class="admin-dashboard__leaderboard">
            <li
              v-for="(course, index) in topCourses"
              :key="`${chartKey}-${course.id}`"
              class="admin-dashboard__leaderboard-item"
              :style="{ animationDelay: `${index * 0.07}s` }"
            >
              <span class="admin-dashboard__leaderboard-rank">{{ index + 1 }}</span>
              <div class="admin-dashboard__leaderboard-copy">
                <span class="admin-dashboard__leaderboard-code">{{ course.code }}</span>
                <span class="admin-dashboard__leaderboard-title">{{ course.title }}</span>
                <span class="admin-dashboard__leaderboard-meta">
                  <q-icon name="school" size="14px" />
                  {{ course.faculty }} ·
                  <q-icon name="category" size="14px" />
                  {{ course.category }}
                </span>
              </div>
              <div class="admin-dashboard__leaderboard-stats">
                <span>
                  {{ formatCount(course.enrolledCount) }} ลงทะเบียน ·
                  {{ course.classAmount === 0 ? 'ฟรี' : formatCurrency(course.classAmount) }}
                </span>
                <strong>{{ formatCurrency(course.revenue) }}</strong>
                <div class="admin-dashboard__leaderboard-progress">
                  <q-linear-progress
                    rounded
                    size="6px"
                    :value="course.paymentRate"
                    color="primary"
                  />
                </div>
                <span>
                  ชำระเงินแล้ว {{ Math.round(course.paymentRate * 100) }}% ·
                  {{ course.isPublic ? 'เผยแพร่' : 'ไม่เผยแพร่' }}
                </span>
              </div>
            </li>
          </ul>
        </AppSurfaceCard>
      </div>

      <div class="admin-dashboard__bottom-row">
        <AppSurfaceCard
          eyebrow="Recent Activity"
          title="การลงทะเบียนล่าสุด"
          :subtitle="periodLabel"
          body-padding="none"
          card-class="admin-dashboard__panel"
        >
          <ul class="admin-dashboard__registrations">
            <li
              v-for="registration in recentRegistrations"
              :key="registration.id"
              class="admin-dashboard__registration"
            >
              <div
                class="admin-dashboard__registration-avatar"
                :style="{ backgroundColor: getAvatarTone(registration.id) }"
              >
                {{ registration.learnerInitial }}
              </div>
              <div class="admin-dashboard__registration-copy">
                <strong>{{ registration.learnerName }}</strong>
                <span>{{ registration.courseTitle }}</span>
                <span class="admin-dashboard__registration-meta">
                  <q-icon :name="getPaymentStatusIcon(registration.paymentStatus)" size="14px" />
                  {{ getPaymentStatusLabel(registration.paymentStatus) }} ·
                  <q-icon name="schedule" size="14px" />
                  {{ formatRelativeTime(registration.registeredAt) }}
                </span>
              </div>
              <span
                class="admin-dashboard__registration-amount"
                :class="{
                  'admin-dashboard__registration-amount--free':
                    registration.paymentStatus === 'free',
                }"
              >
                {{
                  registration.paymentStatus === 'free'
                    ? 'ฟรี'
                    : formatCurrency(registration.amount)
                }}
              </span>
            </li>
          </ul>
        </AppSurfaceCard>

        <AppSurfaceCard
          eyebrow="Faculty Breakdown"
          title="ผู้เรียนแบ่งตามคณะ"
          :subtitle="periodLabel"
          card-class="admin-dashboard__panel"
        >
          <AdminBarChart
            :key="chartKey"
            :items="facultyBarItems"
            :format-value="(value) => `${formatCount(value)} คน`"
          />
        </AppSurfaceCard>
      </div>

      <q-inner-loading :showing="isLoading" color="primary" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import AdminBarChart, { type BarChartItem } from 'components/admin/AdminBarChart.vue';
import AdminDonutChart from 'components/admin/AdminDonutChart.vue';
import AppPageHero from 'components/admin/AppPageHero.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import PeriodFilterBar, { type PeriodFilterValue } from 'components/common/PeriodFilterBar.vue';
import { useAdminDashboardMetrics } from 'src/composables/use-admin-dashboard-metrics';
import type { RecentRegistration } from 'src/composables/use-admin-dashboard-metrics';
import { formatCompactCurrency, formatCount, formatCurrency } from 'src/utils/course-format';

type ChartMetric = 'pipeline' | 'learners' | 'revenue';

const {
  isLoading,
  errorMessage,
  generatedAt,
  period,
  dateFrom,
  dateTo,
  periodLabel,
  kpis,
  monthlySeries: dashboardSeries,
  categoryUsage,
  deliveryBreakdown,
  topCourses,
  facultyShare,
  recentRegistrations,
  totals,
} = useAdminDashboardMetrics();

// ─── Date-range filter (shared PeriodFilterBar) ──────────────
const periodModel = ref<PeriodFilterValue>({ preset: 'allTime', dateFrom: '', dateTo: '' });

function onPeriodChange() {
  period.value = periodModel.value.preset === 'allTime' ? 'allTime' : 'custom';
  dateFrom.value = periodModel.value.dateFrom;
  dateTo.value = periodModel.value.dateTo;
}

// ─── Chart key — re-triggers chart animations on data reload ──
const chartKey = ref(0);

watch(isLoading, (loading) => {
  if (!loading) chartKey.value += 1;
});

const animatedKpis = computed(() =>
  kpis.value.map((kpi) => {
    let description = kpi.description;
    if (kpi.id === 'enrollments') {
      description = `ฟรี ${totals.value.freeEnrollments.toLocaleString('th-TH')} · ชำระเงิน ${totals.value.paidEnrollments.toLocaleString('th-TH')} รายการ`;
    } else if (kpi.id === 'paid-rate') {
      description = `${totals.value.paidEnrollments.toLocaleString('th-TH')} จาก ${totals.value.enrolledLearners.toLocaleString('th-TH')} รายการ`;
    } else if (kpi.id === 'revenue') {
      description = `ชำระเงินสำเร็จ ${totals.value.paidEnrollments.toLocaleString('th-TH')} รายการ`;
    } else if (kpi.id === 'learners') {
      description = `จาก ${totals.value.courses.toLocaleString('th-TH')} หลักสูตรในระบบ`;
    }
    return { ...kpi, description };
  }),
);

const chartMetric = ref<ChartMetric>('pipeline');
const chartMetricOptions: { label: string; value: ChartMetric }[] = [
  { label: 'ลงทะเบียน', value: 'pipeline' },
  { label: 'ผู้เรียน', value: 'learners' },
  { label: 'รายได้', value: 'revenue' },
];

// เปลี่ยน metric toggle → re-trigger chart animation
watch(chartMetric, () => {
  chartKey.value += 1;
});

type PulseTone = 'gold' | 'secondary' | 'positive' | 'indigo';

const heroBadgeLabel = computed(() =>
  generatedAt.value
    ? `อัปเดต ${new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date(generatedAt.value))}`
    : 'กำลังอัปเดต',
);

const systemPulse = computed<
  { icon: string; value: string; label: string; description: string; tone: PulseTone }[]
>(() => {
  const t = totals.value;
  return [
    {
      icon: 'menu_book',
      value: formatCount(t.courses),
      label: 'รายวิชาทั้งหมด',
      description: '',
      tone: 'gold',
    },
    {
      icon: 'workspace_premium',
      value: formatCount(t.certificateCourses),
      label: 'หลักสูตรประกาศนียบัตร',
      description: '',
      tone: 'secondary',
    },
    {
      icon: 'school',
      value: formatCount(t.creditCourses),
      label: 'หลักสูตรสะสมหน่วยกิต',
      description: '',
      tone: 'positive',
    },
    {
      icon: 'auto_stories',
      value: formatCount(t.publicGeneralCourses),
      label: 'หลักสูตรทั่วไป',
      description: '',
      tone: 'indigo',
    },
    {
      icon: 'co_present',
      value: formatCount(t.instructorCount),
      label: 'ผู้สอน',
      description: '',
      tone: 'gold',
    },
    {
      icon: 'groups',
      value: formatCount(t.distinctLearners),
      label: 'ผู้เรียนทั้งหมด',
      description: '',
      tone: 'secondary',
    },
    {
      icon: 'apartment',
      value: formatCount(t.facultyCount),
      label: 'คณะ/ส่วนงาน',
      description: '',
      tone: 'positive',
    },
    {
      icon: 'payments',
      value: formatCompactCurrency(t.totalRevenue),
      label: 'รายได้',
      description: '',
      tone: 'indigo',
    },
  ];
});

const primaryChartContent = computed(() => {
  const pl = periodLabel.value;
  if (chartMetric.value === 'learners') {
    return {
      eyebrow: 'Learner Growth',
      title: 'จำนวนผู้เรียน',
      subtitle: pl,
    };
  }
  if (chartMetric.value === 'revenue') {
    return {
      eyebrow: 'Revenue Trend',
      title: 'รายได้จากการลงทะเบียน',
      subtitle: pl,
    };
  }
  return {
    eyebrow: 'Enrollment Overview',
    title: 'ภาพรวมการลงทะเบียน',
    subtitle: pl,
  };
});

const areaChartSeries = computed<AreaChartSeries[]>(() => {
  if (chartMetric.value === 'learners') {
    return [
      {
        id: 'learners',
        label: 'ผู้เรียนทั้งหมด (คน)',
        color: '#0F766E',
        values: dashboardSeries.value.distinctLearners,
        totalLabel: `${formatCount(
          dashboardSeries.value.distinctLearners.reduce((sum, value) => sum + value, 0),
        )} คน`,
        formatValue: (value) => `${formatCount(Math.round(value))} คน`,
      },
    ];
  }

  if (chartMetric.value === 'revenue') {
    return [
      {
        id: 'revenue',
        label: 'รายได้ (บาท)',
        color: '#F5A623',
        values: dashboardSeries.value.revenue,
        totalLabel: formatCompactCurrency(
          dashboardSeries.value.revenue.reduce((sum, value) => sum + value, 0),
        ),
        formatValue: (value) => formatCurrency(Math.round(value)),
      },
    ];
  }

  return [
    {
      id: 'enrollments',
      label: 'จำนวนลงทะเบียน',
      color: '#1A237E',
      values: dashboardSeries.value.enrollments,
      totalLabel: `${formatCount(
        dashboardSeries.value.enrollments.reduce((sum, value) => sum + value, 0),
      )} รายการ`,
      formatValue: (value) => `${formatCount(Math.round(value))} รายการ`,
    },
    {
      id: 'paid-enrollments',
      label: 'ชำระเงินสำเร็จ',
      color: '#F5A623',
      values: dashboardSeries.value.paidEnrollments,
      totalLabel: `${formatCount(
        dashboardSeries.value.paidEnrollments.reduce((sum, value) => sum + value, 0),
      )} รายการ`,
      formatValue: (value) => `${formatCount(Math.round(value))} รายการ`,
    },
  ];
});

function formatChartTick(value: number): string {
  if (chartMetric.value === 'revenue') {
    return formatCompactCurrency(Math.round(value));
  }
  return formatCount(Math.round(value));
}

const categoryBarItems = computed<BarChartItem[]>(() =>
  categoryUsage.value.slice(0, 6).map((category) => ({
    id: category.id,
    label: category.name,
    sublabel: `${category.courseCount} รายวิชา`,
    value: category.enrolledLearners,
    helperLabel: formatCompactCurrency(category.revenue),
    color: category.color,
    icon: category.icon,
  })),
);

const facultyBarItems = computed<BarChartItem[]>(() =>
  facultyShare.value.slice(0, 6).map((faculty) => ({
    id: faculty.id,
    label: faculty.label,
    value: faculty.value,
    sublabel: `${faculty.courseCount} รายวิชา`,
    helperLabel: formatCompactCurrency(faculty.revenue),
    color: faculty.color,
    icon: 'school',
  })),
);

function getSparkLinePath(values: number[]): string {
  if (values.length === 0) return '';
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const stepX = 120 / Math.max(values.length - 1, 1);

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = 32 - ((value - min) / range) * 28;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function getSparkAreaPath(values: number[]): string {
  const linePath = getSparkLinePath(values);
  if (!linePath) return '';
  return `${linePath} L 120 36 L 0 36 Z`;
}

const AVATAR_TONES = ['#F5A623', '#1A237E', '#0F766E', '#E11D48', '#9333EA', '#0EA5E9'];

function getAvatarTone(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return `${AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length] ?? '#F5A623'}1f`;
}

function getPaymentStatusIcon(status: RecentRegistration['paymentStatus']): string {
  if (status === 'paid') return 'payments';
  if (status === 'pending') return 'hourglass_top';
  return 'redeem';
}

function getPaymentStatusLabel(status: RecentRegistration['paymentStatus']): string {
  if (status === 'paid') return 'ชำระเงินแล้ว';
  if (status === 'pending') return 'รอชำระเงิน';
  return 'ลงทะเบียนฟรี';
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('th-TH', { numeric: 'auto' });

function formatRelativeTime(iso: string | null): string {
  if (!iso) {
    return '-';
  }

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
.admin-dashboard__hero-badge {
  padding: 10px 18px;
  font-size: 0.85rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.admin-dashboard__pulse {
  margin-bottom: 18px;
}

.admin-dashboard__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.admin-kpi-card {
  display: block;
  min-height: 172px;
  padding: 20px 24px;
}

.admin-kpi-card__content {
  display: grid;
  gap: 8px;
  width: 100%;
}

.admin-kpi-card__icon {
  transition: transform 0.24s ease;
}

.admin-kpi-card:hover .admin-kpi-card__icon {
  transform: scale(1.08);
}

.admin-kpi-card--gold {
  --card-tint: rgba(245, 166, 35, 0.18);
  --card-color: #92400e;
}

.admin-kpi-card--navy {
  --card-tint: rgba(26, 35, 126, 0.14);
  --card-color: #1a237e;
}

.admin-kpi-card--teal {
  --card-tint: rgba(15, 118, 110, 0.14);
  --card-color: #0f766e;
}

.admin-kpi-card--rose {
  --card-tint: rgba(225, 29, 72, 0.14);
  --card-color: #be123c;
}

.admin-kpi-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.admin-kpi-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--card-tint);
  color: var(--card-color);
}

.admin-kpi-card__delta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 900;
  background: rgba(34, 197, 94, 0.14);
  color: #15803d;
}

.admin-kpi-card__delta--negative {
  background: rgba(225, 29, 72, 0.14);
  color: #be123c;
}

.admin-kpi-card__value {
  color: var(--admin-navy);
  font-size: 1.7rem;
  font-weight: 950;
  line-height: 1;
}

.admin-kpi-card__label {
  color: var(--admin-ink);
  font-weight: 800;
}

.admin-kpi-card__description {
  margin: 0;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.admin-kpi-card__sparkline {
  margin-top: 4px;
  height: 36px;
  color: var(--card-color);
}

@keyframes sparkReveal {
  from {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
}

.admin-kpi-card__sparkline-svg {
  width: 100%;
  height: 100%;
  display: block;
  animation: sparkReveal 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: 0.2s;
}

.admin-kpi-card__delta-label {
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
}

.admin-dashboard__main-row {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
}

.admin-dashboard__mid-row,
.admin-dashboard__bottom-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.admin-dashboard__panel {
  height: 100%;
}

.admin-chart-toggle {
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

.admin-dashboard__leaderboard {
  list-style: none;
  margin: 0;
  padding: 0;
}

@keyframes leaderboardIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.admin-dashboard__leaderboard-item {
  animation: leaderboardIn 0.4s ease-out both;
  display: grid;
  grid-template-columns: 32px minmax(0, 1.4fr) minmax(140px, 1fr);
  gap: 16px;
  align-items: center;
  padding: 14px 22px;
  border-bottom: 1px solid var(--admin-line);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.admin-dashboard__leaderboard-item:hover {
  background: rgba(245, 166, 35, 0.06);
}

.admin-dashboard__leaderboard-item:last-child {
  border-bottom: none;
}

.admin-dashboard__leaderboard-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.22);
  color: #92400e;
  font-weight: 950;
  font-size: 0.85rem;
}

.admin-dashboard__leaderboard-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.admin-dashboard__leaderboard-code {
  color: #92400e;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.06em;
}

.admin-dashboard__leaderboard-title {
  color: var(--admin-navy);
  font-size: 0.92rem;
  font-weight: 850;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-dashboard__leaderboard-meta {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: #475569;
  font-size: 0.76rem;
  font-weight: 700;
}

.admin-dashboard__leaderboard-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.admin-dashboard__leaderboard-stats strong {
  color: var(--admin-navy);
  font-size: 0.95rem;
  font-weight: 900;
}

.admin-dashboard__leaderboard-stats span {
  color: #475569;
  font-size: 0.76rem;
  font-weight: 800;
}

.admin-dashboard__leaderboard-progress {
  width: 120px;
}

.admin-dashboard__registrations {
  list-style: none;
  margin: 0;
  padding: 0;
}

.admin-dashboard__registration {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px 22px;
  border-bottom: 1px solid var(--admin-line);
  transition: background-color 0.2s ease;
}

.admin-dashboard__registration:hover {
  background: rgba(245, 166, 35, 0.06);
}

.admin-dashboard__registration:last-child {
  border-bottom: none;
}

.admin-dashboard__registration-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  font-weight: 950;
  font-size: 1.05rem;
  color: var(--admin-navy);
  background: rgba(245, 166, 35, 0.18);
}

.admin-dashboard__registration-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.admin-dashboard__registration-copy strong {
  color: var(--admin-navy);
  font-size: 0.9rem;
  font-weight: 850;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-dashboard__registration-copy span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-dashboard__registration-meta {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.72rem;
}

.admin-dashboard__registration-amount {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.22);
  color: #92400e;
  font-size: 0.82rem;
  font-weight: 900;
  white-space: nowrap;
}

.admin-dashboard__registration-amount--free {
  background: rgba(34, 197, 94, 0.16);
  color: #15803d;
}

@media (max-width: 1180px) {
  .admin-dashboard__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .admin-dashboard__main-row,
  .admin-dashboard__mid-row,
  .admin-dashboard__bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .admin-dashboard__kpis {
    grid-template-columns: 1fr;
  }

  .admin-dashboard__leaderboard-item {
    grid-template-columns: 28px minmax(0, 1fr);
  }

  .admin-dashboard__leaderboard-stats {
    grid-column: 2 / -1;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .admin-dashboard__leaderboard-progress {
    width: 100%;
  }

  .admin-pulse-grid {
    grid-template-columns: 1fr;
  }
}
</style>
