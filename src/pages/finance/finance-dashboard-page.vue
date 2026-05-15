<template>
  <q-page class="finance-dashboard-page bg-grey-1">
    <!-- Beautiful Premium Hero Section -->
    <section class="finance-hero">
      <div class="finance-hero__bg"></div>
      <div class="finance-hero__particles"></div>

      <div class="section-container q-px-xl q-pt-xl q-pb-lg relative-position z-top">
        <div class="row items-center justify-between q-col-gutter-xl">
          <div class="col-12 col-md-7">
            <div class="row items-center q-gutter-md q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="icon-glass-wrap">
                  <q-icon name="account_balance" size="24px" color="white" />
                </div>
                <div
                  class="text-overline text-white text-weight-bold"
                  style="letter-spacing: 0.15em; opacity: 0.95"
                >
                  {{ $t('finance.dashboard.console') }}
                </div>
              </div>

              <!-- Faculty Context Badge -->
              <template v-if="currentUserFaculty">
                <div style="width: 1px; height: 24px; background: rgba(255, 255, 255, 0.2)"></div>
                <div class="row items-center">
                  <q-badge
                    rounded
                    color="rgba(255, 255, 255, 0.15)"
                    class="q-px-md q-py-sm text-weight-bold border-glass-subtle backdrop-blur"
                    style="font-size: 0.85rem; letter-spacing: 0.5px"
                  >
                    <q-icon name="apartment" size="18px" class="q-mr-sm text-yellow-5" />
                    {{ currentUserFaculty }}
                  </q-badge>
                </div>
              </template>
            </div>

            <h1
              class="text-h3 text-weight-bolder text-white q-my-none"
              style="line-height: 1.2; letter-spacing: -0.02em"
            >
              {{ $t('finance.dashboard.title') }}
            </h1>
            <p
              class="text-h6 text-white q-mt-md text-weight-regular"
              style="opacity: 0.85; max-width: 540px; line-height: 1.5"
            >
              {{ $t('finance.dashboard.subtitle') }}
            </p>

            <div class="row q-gutter-md q-mt-xl">
              <q-btn
                unelevated
                color="white"
                text-color="primary"
                icon="receipt_long"
                :label="$t('finance.dashboard.manageReceipts')"
                class="finance-action-btn shadow-4"
                no-caps
                @click="router.push('/finance/receipts')"
              />
              <q-btn
                outline
                color="white"
                icon="file_download"
                :label="$t('finance.dashboard.exportReport')"
                class="finance-action-btn finance-action-btn--outline"
                no-caps
              />
            </div>
          </div>

          <!-- Hero Stats Card (Glassmorphism) -->
          <div class="col-12 col-md-5">
            <div class="glass-card shadow-12 q-pa-xl">
              <div class="row items-center justify-between q-mb-lg">
                <div class="text-h6 text-white text-weight-bolder">
                  {{ $t('finance.dashboard.revenuePulse') }}
                </div>
                <div class="live-badge">
                  <span class="live-dot"></span>
                  {{ $t('finance.dashboard.liveUpdate') }}
                </div>
              </div>

              <div class="row q-col-gutter-lg">
                <div class="col-6">
                  <div class="glass-stat">
                    <q-icon
                      name="trending_up"
                      size="28px"
                      class="q-mb-sm text-yellow-3 drop-shadow"
                    />
                    <div class="text-h4 text-weight-bolder text-white">
                      {{
                        financeStats.find((s) => s.label.includes('totalRevenueToday'))?.value ||
                        '฿0'
                      }}
                    </div>
                    <div
                      class="text-body2 text-white q-mt-xs"
                      style="opacity: 0.8; font-weight: 500"
                    >
                      {{ $t('finance.dashboard.totalRevenueToday') }}
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="glass-stat">
                    <q-icon
                      name="pending_actions"
                      size="28px"
                      class="q-mb-sm text-orange-3 drop-shadow"
                    />
                    <div class="text-h4 text-weight-bolder text-white">
                      {{
                        financeStats.find((s) => s.label.includes('pendingReview'))?.value || '0'
                      }}
                    </div>
                    <div
                      class="text-body2 text-white q-mt-xs"
                      style="opacity: 0.8; font-weight: 500"
                    >
                      {{ $t('finance.dashboard.pendingReview') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <GoldenUnderline />
    </section>

    <!-- Content Section -->
    <section class="section-container q-px-xl q-py-xl relative-position finance-content q-mt-xl">
      <!-- Top Metrics Grid -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div v-for="stat in financeStats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <q-card flat class="metric-card hover-lift">
            <q-card-section class="q-pa-lg">
              <div class="row items-center justify-between q-mb-lg">
                <div
                  class="metric-icon-wrap shadow-2"
                  :style="{ background: stat.tint, color: stat.color }"
                >
                  <q-icon :name="stat.icon" size="26px" />
                </div>
                <q-chip
                  v-if="stat.trend"
                  :color="stat.trendColor"
                  text-color="white"
                  size="sm"
                  dense
                  class="text-weight-bold q-px-sm shadow-1"
                >
                  {{ stat.trend }}
                </q-chip>
              </div>
              <div class="text-h4 text-weight-bolder text-dark q-mb-xs">{{ stat.value }}</div>
              <div class="text-body2 text-grey-6 text-weight-bold">{{ $t(stat.label) }}</div>
            </q-card-section>
            <q-linear-progress
              :value="stat.progress"
              :color="stat.progressColor"
              size="5px"
              class="absolute-bottom"
              track-color="transparent"
            />
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- Main Chart Area -->
        <div class="col-12 col-lg-8">
          <q-card flat bordered class="dashboard-panel shadow-soft">
            <q-card-section class="q-pa-xl">
              <div class="row items-center justify-between q-mb-xl">
                <div class="row items-center no-wrap">
                  <div class="header-icon-box q-mr-md shadow-2">
                    <q-icon name="analytics" size="24px" color="primary" />
                  </div>
                  <div>
                    <div
                      class="text-overline text-primary text-weight-bold"
                      style="letter-spacing: 1px; line-height: 1"
                    >
                      {{ $t('finance.dashboard.financialTrends') }}
                    </div>
                    <div class="text-h5 text-weight-bolder text-dark">
                      {{ $t('finance.dashboard.performanceOverview') }}
                    </div>
                  </div>
                </div>
                <div class="row q-gutter-sm">
                  <q-btn-toggle
                    v-model="trendPeriod"
                    flat
                    toggle-color="primary"
                    color="grey-7"
                    :options="[
                      { label: '7D', value: '7d' },
                      { label: '1M', value: '1m' },
                      { label: '6M', value: '6m' },
                      { label: '1Y', value: '1y' },
                    ]"
                    class="period-toggle"
                  />
                </div>
              </div>

              <div class="q-mt-xl">
                <!-- Unified Charts Flow -->
                <div class="trend-section q-mb-xl">
                  <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md row items-center">
                    <q-icon name="show_chart" color="primary" class="q-mr-sm" />
                    {{ $t('finance.dashboard.revenueTrend') }}
                  </div>
                  <RevenueTrendChart :data="trendData" :labels="trendLabels" />
                </div>

                <q-separator class="q-my-xl" />

                <div class="proportion-section">
                  <div class="text-subtitle1 text-weight-bold text-grey-8 q-mb-md row items-center">
                    <q-icon name="pie_chart" color="orange-8" class="q-mr-sm" />
                    {{ $t('finance.dashboard.revenueProportion') }}
                  </div>
                  <div class="row justify-center">
                    <div class="col-12 col-md-10">
                      <RevenueDonutChart :data="donutData" />
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- System Audit -->
          <div class="row q-col-gutter-lg q-mt-md items-stretch">
            <div class="col-12 col-md-6 row" v-for="item in healthChecks" :key="item.name">
              <q-card flat bordered class="health-card shadow-soft hover-lift full-height col">
                <q-card-section class="q-pa-lg row items-center no-wrap">
                  <div class="health-pulse-wrap q-mr-lg">
                    <div class="health-pulse" :class="`health-pulse--${item.status}`"></div>
                  </div>
                  <div class="col">
                    <div class="text-subtitle1 text-weight-bolder text-dark">
                      {{ $t(item.name) }}
                    </div>
                    <div class="text-caption text-grey-6 text-weight-medium q-mt-xs">
                      {{ $t(item.detail) }}
                    </div>
                  </div>
                  <q-badge
                    rounded
                    :color="item.color"
                    :label="$t(item.label)"
                    class="q-px-md q-py-sm text-weight-bold shadow-1"
                  />
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Sidebar Timeline -->
        <div class="col-12 col-lg-4">
          <q-card flat bordered class="dashboard-panel shadow-soft full-height">
            <q-card-section class="q-pa-lg">
              <div class="row items-center no-wrap q-mb-lg">
                <div class="header-icon-box q-mr-md shadow-2" style="background: #fff0f3">
                  <q-icon name="history" size="24px" color="pink-5" />
                </div>
                <div>
                  <div
                    class="text-overline text-pink-5 text-weight-bold"
                    style="letter-spacing: 1px; line-height: 1"
                  >
                    {{ $t('finance.dashboard.liveTransactions') }}
                  </div>
                  <div class="text-h6 text-weight-bolder text-dark">
                    {{ $t('finance.dashboard.recentActivities') }}
                  </div>
                </div>
              </div>

              <q-timeline color="primary" layout="dense" class="custom-timeline q-mt-lg">
                <q-timeline-entry
                  v-for="activity in recentActivities"
                  :key="activity.title"
                  :color="activity.color"
                  :icon="activity.icon"
                >
                  <template #title>
                    <div class="row items-center no-wrap">
                      <div
                        class="text-subtitle1 text-weight-bold text-dark q-mr-sm"
                        style="line-height: 1.3"
                      >
                        {{ $t(activity.title) }}
                      </div>
                      <q-badge
                        rounded
                        color="grey-2"
                        text-color="grey-7"
                        label="LOG"
                        v-if="activity.color === 'grey-4'"
                      />
                    </div>
                  </template>
                  <template #subtitle>
                    <div class="text-caption text-grey-5 q-mb-sm text-weight-medium">
                      {{ activity.time }}
                    </div>
                  </template>
                  <div class="text-body2 text-grey-7 q-mt-xs">{{ activity.detail }}</div>
                </q-timeline-entry>
              </q-timeline>

              <div class="text-center q-mt-xl pt-4" style="border-top: 1px dashed #e2e8f0">
                <q-btn
                  flat
                  color="primary"
                  :label="$t('finance.dashboard.viewAllHistory')"
                  icon-right="arrow_forward"
                  no-caps
                  class="text-weight-bold full-width"
                  size="md"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import RevenueTrendChart from 'src/components/finance/RevenueTrendChart.vue';
import RevenueDonutChart from 'src/components/finance/RevenueDonutChart.vue';

const router = useRouter();
const authStore = useAuthStore();

const trendPeriod = ref('6m');

interface FinanceStat {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  tint: string;
  progress: number;
  progressColor: string;
  faculty?: string;
  trend?: string;
  trendColor?: string;
}

const rawFinanceStats: FinanceStat[] = [
  {
    label: 'finance.dashboard.totalRevenueToday',
    value: 42500,
    icon: 'payments',
    color: '#0d9488',
    tint: '#ccfbf1',
    progress: 0.85,
    progressColor: 'teal',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
    trend: '+15%',
    trendColor: 'positive',
  },
  {
    label: 'finance.dashboard.pendingReview',
    value: 12,
    icon: 'hourglass_empty',
    color: '#d97706',
    tint: '#fef3c7',
    progress: 0.35,
    progressColor: 'amber-8',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
    trend: '+2',
    trendColor: 'orange',
  },
  {
    label: 'finance.dashboard.totalTransactions',
    value: 156,
    icon: 'confirmation_number',
    color: '#2563eb',
    tint: '#dbeafe',
    progress: 0.65,
    progressColor: 'blue-7',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
    trend: '+8%',
    trendColor: 'positive',
  },
  {
    label: 'finance.dashboard.receiptsIssued',
    value: '99.1%',
    icon: 'task_alt',
    color: '#059669',
    tint: '#d1fae5',
    progress: 0.99,
    progressColor: 'positive',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  // Information Sciences Faculty Data
  {
    label: 'finance.dashboard.totalRevenueToday',
    value: 128400,
    icon: 'payments',
    color: '#3aa6b9',
    tint: '#e0f2fe',
    progress: 0.72,
    progressColor: 'primary',
    faculty: 'คณะวิทยาการสารสนเทศ',
  },
  {
    label: 'finance.dashboard.pendingReview',
    value: 42,
    icon: 'hourglass_empty',
    color: '#d97706',
    tint: '#fef3c7',
    progress: 0.45,
    progressColor: 'amber-8',
    faculty: 'คณะวิทยาการสารสนเทศ',
  },
];

const currentUserFaculty = computed(() => authStore.user?.faculty);

const financeStats = computed(() => {
  const faculty = currentUserFaculty.value;
  const filtered = rawFinanceStats.filter((stat) => !faculty || stat.faculty === faculty);

  if (!faculty) {
    const aggregated: FinanceStat[] = [];
    const labels = [...new Set(rawFinanceStats.map((s) => s.label))];
    labels.forEach((label) => {
      const items = rawFinanceStats.filter((s) => s.label === label);
      const first = items[0];
      const totalValue = items.reduce((acc, curr) => {
        if (typeof curr.value === 'number') return acc + curr.value;
        return acc;
      }, 0);

      if (first) {
        aggregated.push({
          ...first,
          value: typeof first.value === 'number' ? `฿${totalValue.toLocaleString()}` : first.value,
          progress: items.reduce((acc, curr) => acc + curr.progress, 0) / items.length,
        });
      }
    });
    return aggregated;
  }

  return filtered.map((s) => ({
    ...s,
    value: typeof s.value === 'number' ? `฿${s.value.toLocaleString()}` : s.value,
  }));
});

const allTopRevenueCategories = [
  {
    name: 'Full-Stack Web Development',
    amount: 18500,
    percent: 45,
    color: '#3aa6b9',
    gradient: 'linear-gradient(90deg, #3aa6b9, #1e3a8a)',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    name: 'Data Science & Machine Learning',
    amount: 12000,
    percent: 30,
    color: '#f5a623',
    gradient: 'linear-gradient(90deg, #f5a623, #d97706)',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    name: 'Cybersecurity Essentials',
    amount: 8000,
    percent: 20,
    color: '#ec4899',
    gradient: 'linear-gradient(90deg, #ec4899, #be185d)',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    name: 'Cloud Computing (AWS/Azure)',
    amount: 4000,
    percent: 5,
    color: '#10b981',
    gradient: 'linear-gradient(90deg, #10b981, #047857)',
    faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  },
  {
    name: 'Computer and Technology',
    amount: 54200,
    percent: 42,
    color: '#3aa6b9',
    gradient: 'linear-gradient(90deg, #3aa6b9, #1e3a8a)',
    faculty: 'คณะวิทยาการสารสนเทศ',
  },
];

const topRevenueCategories = computed(() => {
  const faculty = currentUserFaculty.value;
  return allTopRevenueCategories.filter((cat) => !faculty || cat.faculty === faculty);
});

const donutData = computed(() => {
  return topRevenueCategories.value.map((cat) => ({
    name: cat.name,
    amount: cat.amount,
    percent: cat.percent,
    color: cat.color,
  }));
});

const trendData = computed(() => {
  const faculty = currentUserFaculty.value;
  if (faculty === 'คอมพิวเตอร์และเทคโนโลยี') {
    return [125000, 148000, 132000, 155000, 172000, 188000];
  }
  return [250000, 280000, 260000, 310000, 290000, 340000];
});

const trendLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'];

const healthChecks = [
  {
    name: 'finance.dashboard.paymentGateway',
    detail: 'finance.dashboard.paymentGatewayDetail',
    status: 'good',
    color: 'positive',
    label: 'finance.dashboard.online',
  },
  {
    name: 'finance.dashboard.receiptGenerator',
    detail: 'finance.dashboard.receiptGeneratorDetail',
    status: 'good',
    color: 'positive',
    label: 'finance.dashboard.ready',
  },
];

const allRecentActivities = [
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
];

const recentActivities = computed(() => {
  const faculty = currentUserFaculty.value;
  return allRecentActivities.filter((activity) => !faculty || activity.faculty === faculty);
});
</script>

<style lang="scss" scoped>
/* Core Page Styles */
.finance-dashboard-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* Premium Hero Section */
.finance-hero {
  position: relative;
  min-height: 420px;
  background: #1e3a5f;
  overflow: hidden;
  padding-top: 80px; /* Offset for transparent header */
  padding-bottom: 60px;
  z-index: 1; /* Fix for backdrop-filter overlapping q-header */
}

.finance-hero__bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f2444 100%);
  z-index: 1;
}

.finance-hero__bg::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 80% 20%, rgba(58, 166, 185, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 20% 80%, rgba(245, 166, 35, 0.15) 0%, transparent 40%);
  z-index: 2;
}

.finance-hero__particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0.4;
  z-index: 3;
}

.finance-hero__curve {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 4;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.icon-glass-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.backdrop-blur {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.border-glass-subtle {
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Glassmorphism Card */
.glass-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  animation: shimmer 6s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  20% {
    left: 200%;
  }
  100% {
    left: 200%;
  }
}

.glass-stat {
  padding: 16px 8px;
}

.drop-shadow {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(34, 197, 94, 0.2);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px #4ade80;
  animation: pulse-dot 1.5s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
}

/* Buttons */
.finance-action-btn {
  border-radius: 14px;
  padding: 10px 24px;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.finance-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.finance-action-btn--outline {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

/* Cards & Panels */
.metric-card {
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #ffffff;
}

.metric-icon-wrap {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08) !important;
}

.dashboard-panel {
  border-radius: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: #ffffff;
}

.shadow-soft {
  box-shadow: 0 10px 40px rgba(23, 32, 51, 0.04);
}

.h-full {
  height: 100%;
}

.finance-content {
  padding-bottom: 60px; /* Avoid sticking to footer */
}

/* Category Cards (New Design) */
.category-card {
  border-radius: 16px;
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.03);
  position: relative;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: #ffffff;
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}

.category-card__indicator {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  border-radius: 16px 0 0 16px;
}

/* Progress Bars Custom */
.progress-track {
  width: 100%;
  height: 14px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 1s ease-out;
}

/* Health Audit Card */
.health-card {
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.health-pulse-wrap {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.health-pulse {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.health-pulse--good {
  background: #10b981;
  box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.15);
}

/* Custom Timeline */
.custom-timeline {
  :deep(.q-timeline__title) {
    margin-bottom: 2px;
    font-size: 0.95rem;
    line-height: 1.3;
  }
  :deep(.q-timeline__dot) {
    color: currentColor;
  }
  :deep(.q-timeline__content) {
    padding-bottom: 24px;
    word-break: break-word;
    overflow-wrap: break-word;
  }
}

.dashboard-panel {
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.period-toggle {
  background: #f1f5f9;
  border-radius: 14px;
  padding: 4px;
  border: 1px solid #e2e8f0;

  :deep(.q-btn) {
    border-radius: 10px !important;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 8px 16px;
    min-height: unset;
    min-width: 52px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.text-primary {
      background: #ffffff !important;
      color: var(--q-primary) !important;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      transform: scale(1.02);
    }

    &:not(.text-primary) {
      color: #64748b !important;
      opacity: 0.8;

      &:hover {
        background: rgba(255, 255, 255, 0.4);
        opacity: 1;
      }
    }

    .q-focus-helper {
      display: none;
    }
  }
}

.header-icon-box {
  width: 48px;
  height: 48px;
  min-width: 48px;
  border-radius: 14px;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trend-section {
  min-height: 380px;
}

.proportion-section {
  min-height: 420px;
}

.finance-content {
  margin-top: 50px !important;
  padding-bottom: 190px;
}
</style>
