<template>
  <q-page class="admin-page admin-dashboard-page">
    <AdminPageHero
      eyebrow="BUU Lifelong Admin Console"
      eyebrow-icon="admin_panel_settings"
      title="แดชบอร์ดผู้ดูแลระบบ"
      description="ภาพรวมรายได้ ผู้ลงทะเบียน และสุขภาพของระบบ Lifelong Learning ในมุมมองเดียว"
    >
      <template #aside>
        <q-badge rounded color="positive" label="Stable" class="admin-dashboard__hero-badge" />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
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
        <article
          v-for="kpi in kpis"
          :key="kpi.id"
          class="admin-kpi-card"
          :class="`admin-kpi-card--${kpi.tone}`"
        >
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
          <strong class="admin-kpi-card__value">{{ kpi.value }}</strong>
          <span class="admin-kpi-card__label">{{ kpi.label }}</span>
          <p class="admin-kpi-card__description">{{ kpi.description }}</p>
          <div class="admin-kpi-card__sparkline">
            <svg viewBox="0 0 120 36" preserveAspectRatio="none">
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
        </article>
      </div>

      <div class="admin-dashboard__main-row">
        <AdminSurfaceCard
          eyebrow="Revenue & Enrollments"
          title="รายได้และผู้ลงทะเบียนรายเดือน"
          subtitle="เปรียบเทียบรายได้ที่เกิดขึ้นจริงกับผู้ลงทะเบียนใหม่ในช่วง 6 เดือนที่ผ่านมา"
          card-class="admin-dashboard__panel admin-dashboard__panel--chart"
        >
          <template #header-actions>
            <q-btn-toggle
              v-model="chartMetric"
              no-caps
              dense
              unelevated
              spread
              :options="chartMetricOptions"
              toggle-color="primary"
              text-color="grey-8"
              class="admin-chart-toggle"
            />
          </template>

          <AdminAreaChart
            :series="areaChartSeries"
            :x-labels="revenueSeries.months"
            :height="280"
            :format-y-tick="formatChartTick"
            aria-label="รายได้และผู้ลงทะเบียนรายเดือน"
          />
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Delivery Mix"
          title="สัดส่วนรูปแบบการเรียน"
          subtitle="ผู้ลงทะเบียนแยกตามรูปแบบการเรียนที่จัด"
          card-class="admin-dashboard__panel admin-dashboard__panel--donut"
        >
          <AdminDonutChart
            :data="deliveryBreakdown"
            center-label="ผู้ลงทะเบียน"
            :center-value="formatCount(totals.enrolledLearners)"
            center-hint="รวมทุกรูปแบบ"
          />
        </AdminSurfaceCard>
      </div>

      <div class="admin-dashboard__mid-row">
        <AdminSurfaceCard
          eyebrow="Category Performance"
          title="ผู้ลงทะเบียนตามหมวดหมู่ยอดนิยม"
          subtitle="เรียงตามจำนวนผู้ลงทะเบียนสะสมในระบบ"
          card-class="admin-dashboard__panel"
        >
          <AdminBarChart
            :items="categoryBarItems"
            :format-value="(value) => `${formatCount(value)} คน`"
          />
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Top Performing Courses"
          title="คอร์สที่ทำรายได้สูงสุด"
          subtitle="คอร์สที่สร้างรายได้และมีผู้เรียนสูงในรอบปัจจุบัน"
          body-padding="none"
          card-class="admin-dashboard__panel"
        >
          <ul class="admin-dashboard__leaderboard">
            <li
              v-for="(course, index) in topCourses"
              :key="course.id"
              class="admin-dashboard__leaderboard-item"
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
                <strong>
                  {{ course.isFree ? 'ฟรี' : formatCurrency(course.revenue) }}
                </strong>
                <span>
                  {{ formatCount(course.enrolledCount) }}/{{ formatCount(course.maxSeats) }} ที่นั่ง
                </span>
                <div class="admin-dashboard__leaderboard-progress">
                  <q-linear-progress rounded size="6px" :value="course.fillRate" color="primary" />
                </div>
              </div>
            </li>
          </ul>
        </AdminSurfaceCard>
      </div>

      <div class="admin-dashboard__bottom-row">
        <AdminSurfaceCard
          eyebrow="Live Stream"
          title="การลงทะเบียนล่าสุด"
          subtitle="ดูผู้เรียนล่าสุดที่เข้าร่วมระบบและช่องทางที่ใช้"
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
                  <q-icon :name="getChannelIcon(registration.channel)" size="14px" />
                  {{ getChannelLabel(registration.channel) }} ·
                  <q-icon name="schedule" size="14px" />
                  {{ formatRelativeTime(registration.registeredAt) }}
                </span>
              </div>
              <span
                class="admin-dashboard__registration-amount"
                :class="{ 'admin-dashboard__registration-amount--free': registration.isFree }"
              >
                {{ registration.isFree ? 'ฟรี' : formatCurrency(registration.amount) }}
              </span>
            </li>
          </ul>
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Faculty Distribution"
          title="ผู้เรียนแบ่งตามคณะ"
          subtitle="ภาพรวมผู้ลงทะเบียนสะสมตามคณะที่จัดคอร์ส"
          card-class="admin-dashboard__panel"
        >
          <AdminBarChart
            :items="facultyBarItems"
            :format-value="(value) => `${formatCount(value)} คน`"
          />
        </AdminSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import AdminAreaChart, { type AreaChartSeries } from 'components/admin/AdminAreaChart.vue';
import AdminBarChart, { type BarChartItem } from 'components/admin/AdminBarChart.vue';
import AdminDonutChart from 'components/admin/AdminDonutChart.vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import { useAdminDashboardMetrics } from 'src/composables/use-admin-dashboard-metrics';
import type { RecentRegistration } from 'src/composables/use-admin-dashboard-metrics';
import {
  formatCompactCurrency,
  formatCount,
  formatCurrency,
  formatViews,
} from 'src/utils/course-format';

type ChartMetric = 'both' | 'revenue' | 'enrollments';

const {
  kpis,
  revenueSeries,
  categoryUsage,
  deliveryBreakdown,
  topCourses,
  facultyShare,
  recentRegistrations,
  totals,
} = useAdminDashboardMetrics();

const chartMetric = ref<ChartMetric>('both');
const chartMetricOptions: { label: string; value: ChartMetric }[] = [
  { label: 'รวม', value: 'both' },
  { label: 'รายได้', value: 'revenue' },
  { label: 'ผู้เรียน', value: 'enrollments' },
];

type PulseTone = 'gold' | 'secondary' | 'positive' | 'indigo';

const systemPulse = computed<
  { icon: string; value: string; label: string; description: string; tone: PulseTone }[]
>(() => [
  {
    icon: 'menu_book',
    value: formatCount(totals.value.courses),
    label: 'รายวิชาในระบบ',
    description: `${formatCount(totals.value.activeCourses)} กำลังเปิดรับ`,
    tone: 'gold',
  },
  {
    icon: 'groups',
    value: formatCount(totals.value.enrolledLearners),
    label: 'ผู้เรียนสะสม',
    description: `จาก ${formatCount(totals.value.totalSeats)} ที่นั่ง`,
    tone: 'secondary',
  },
  {
    icon: 'visibility',
    value: formatViews(totals.value.totalViews),
    label: 'ยอดเข้าชมสะสม',
    description: 'ดึงจาก course.views ทุกรายวิชา',
    tone: 'positive',
  },
  {
    icon: 'category',
    value: formatCount(totals.value.categories),
    label: 'หมวดหมู่ที่ใช้งาน',
    description: 'ใช้ชุดเดียวกับหน้าหลัก',
    tone: 'indigo',
  },
]);

const areaChartSeries = computed<AreaChartSeries[]>(() => {
  const all: AreaChartSeries[] = [
    {
      id: 'revenue',
      label: 'รายได้ (บาท)',
      color: '#F5A623',
      values: revenueSeries.value.revenue,
      totalLabel: formatCompactCurrency(revenueSeries.value.totalRevenue),
      formatValue: (value) => formatCurrency(value),
    },
    {
      id: 'enrollments',
      label: 'ผู้ลงทะเบียน (คน)',
      color: '#1A237E',
      values: revenueSeries.value.enrollments,
      totalLabel: `${formatCount(revenueSeries.value.totalEnrollments)} คน`,
      formatValue: (value) => `${formatCount(Math.round(value))} คน`,
    },
  ];

  if (chartMetric.value === 'revenue') return [all[0]!];
  if (chartMetric.value === 'enrollments') return [all[1]!];
  return all;
});

function formatChartTick(value: number): string {
  if (chartMetric.value === 'enrollments') {
    return formatCount(Math.round(value));
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }
  return formatCount(Math.round(value));
}

const categoryBarItems = computed<BarChartItem[]>(() =>
  categoryUsage.value.slice(0, 6).map((category) => ({
    id: category.id,
    label: category.name,
    sublabel: `${category.courseCount} รายวิชา`,
    value: category.enrolledLearners,
    helperLabel: `${category.courseCount} วิชา`,
    color: category.color,
    icon: category.icon,
  })),
);

const facultyBarItems = computed<BarChartItem[]>(() =>
  facultyShare.value.slice(0, 6).map((faculty) => ({
    id: faculty.id,
    label: faculty.label,
    value: faculty.value,
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

function getChannelIcon(channel: RecentRegistration['channel']): string {
  if (channel === 'onsite') return 'place';
  if (channel === 'self-paced') return 'self_improvement';
  return 'cast_for_education';
}

function getChannelLabel(channel: RecentRegistration['channel']): string {
  if (channel === 'onsite') return 'Onsite';
  if (channel === 'self-paced') return 'Self-Paced';
  return 'Online';
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('th-TH', { numeric: 'auto' });

function formatRelativeTime(iso: string): string {
  const target = new Date(iso).getTime();
  const now = new Date('2026-05-08T16:30:00+07:00').getTime();
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
  position: relative;
  display: grid;
  gap: 8px;
  padding: 22px 22px 18px;
  border-radius: var(--admin-radius-lg);
  border: 1px solid var(--admin-line);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-sm);
  overflow: hidden;
}

.admin-kpi-card:hover .admin-kpi-card__icon {
  transform: scale(1.08);
}

.admin-kpi-card__icon {
  transition: transform 0.24s ease;
}

.admin-kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 130px;
  height: 130px;
  border-radius: 999px;
  background: radial-gradient(circle, var(--card-glow), transparent 70%);
  filter: blur(24px);
  pointer-events: none;
}

.admin-kpi-card--gold {
  --card-tint: rgba(245, 166, 35, 0.18);
  --card-color: #92400e;
  --card-glow: rgba(245, 166, 35, 0.22);
}

.admin-kpi-card--navy {
  --card-tint: rgba(26, 35, 126, 0.14);
  --card-color: #1a237e;
  --card-glow: rgba(26, 35, 126, 0.2);
}

.admin-kpi-card--teal {
  --card-tint: rgba(15, 118, 110, 0.14);
  --card-color: #0f766e;
  --card-glow: rgba(15, 118, 110, 0.18);
}

.admin-kpi-card--rose {
  --card-tint: rgba(225, 29, 72, 0.14);
  --card-color: #be123c;
  --card-glow: rgba(225, 29, 72, 0.18);
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

.admin-kpi-card__sparkline svg {
  width: 100%;
  height: 100%;
  display: block;
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
}

.admin-chart-toggle :deep(.q-btn) {
  border-radius: 8px !important;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0 14px;
  min-height: 32px;
}

.admin-dashboard__leaderboard {
  list-style: none;
  margin: 0;
  padding: 0;
}

.admin-dashboard__leaderboard-item {
  display: grid;
  grid-template-columns: 32px minmax(0, 1.4fr) minmax(140px, 1fr);
  gap: 16px;
  align-items: center;
  padding: 14px 22px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
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
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
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
