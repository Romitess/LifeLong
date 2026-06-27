<template>
  <div class="instructor-home-panel">
    <div class="instructor-home-header">
      <div class="instructor-home-header__copy">
        <div class="instructor-home-header__eyebrow">{{ t('profile.instructor.header.eyebrow') }}</div>
        <div class="instructor-home-header__title-row">
          <div class="text-h5 text-weight-bolder text-primary">
            {{ t('profile.instructor.header.title') }}
          </div>
          <span>{{ t('profile.instructor.header.badge') }}</span>
        </div>
        <div class="text-caption text-grey-6 q-mt-xs"></div>
      </div>
    </div>

    <div class="instructor-overview-grid">
      <q-card
        v-for="item in instructorOverviewCards"
        :key="item.label"
        flat
        bordered
        class="instructor-overview-card"
      >
        <span
          class="instructor-overview-card__icon"
          :style="{ '--card-accent': item.color, '--card-icon-bg': item.iconBg }"
        >
          <q-icon :name="item.icon" size="26px" />
        </span>
        <div>
          <strong>{{ item.value.toLocaleString('th-TH') }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </q-card>
    </div>

    <div class="instructor-report-grid">
      <q-card flat bordered class="instructor-report-card instructor-report-card--wide">
        <div class="instructor-report-card__head">
          <div>
            <h2>{{ t('profile.instructor.reports.overviewTitle') }}</h2>
            <span>{{ t('profile.instructor.reports.overviewSubtitle') }}</span>
          </div>
          <q-icon name="insights" size="30px" color="primary" />
        </div>

        <AppAreaChart
          :series="instructorTrendSeries"
          :x-labels="reportMonthLabels"
          :height="248"
          aria-label="Instructor teaching report chart"
          :format-y-tick="formatReportNumber"
        />
      </q-card>

      <q-card flat bordered class="instructor-report-card">
        <div class="instructor-report-card__head">
          <div>
            <h2>{{ t('profile.instructor.reports.deliveryTitle') }}</h2>
            <span>{{ t('profile.instructor.reports.deliverySubtitle') }}</span>
          </div>
          <q-icon name="donut_large" size="30px" color="teal-5" />
        </div>

        <AppDonutChart
          :data="deliveryModeSegments"
          :center-label="t('profile.instructor.reports.total')"
          :center-value="scopedInstructorCourses.length.toLocaleString('th-TH')"
          :center-hint="t('profile.instructor.units.courses')"
          :size="190"
          :stroke-width="22"
        />
      </q-card>

      <q-card flat bordered class="instructor-report-card instructor-report-card--wide">
        <div class="instructor-report-card__head">
          <div>
            <h2>{{ barChartTitle }}</h2>
            <span>{{ barChartSubtitle }}</span>
          </div>
          <q-icon name="bar_chart" size="30px" color="indigo-5" />
        </div>

        <AppBarChart :items="topCourseLearnerBars" />
      </q-card>

      <q-card flat bordered class="instructor-report-card">
        <div class="instructor-report-card__head">
          <div>
            <h2>{{ t('profile.instructor.reports.summaryTitle') }}</h2>
            <span>{{ t('profile.instructor.reports.summarySubtitle') }}</span>
          </div>
          <q-icon name="summarize" size="30px" color="amber-8" />
        </div>

        <div class="instructor-report-summary">
          <div v-for="item in reportSummaryItems" :key="item.label">
            <q-icon :name="item.icon" :style="{ color: item.color }" />
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </q-card>
    </div>

    <div class="instructor-work-grid">
      <q-card flat bordered class="instructor-work-card">
        <div class="instructor-work-card__head">
          <div>
            <h2>{{ t('profile.instructor.tasks.title') }}</h2>
            <span>{{ t('profile.instructor.tasks.subtitle') }}</span>
          </div>
          <q-icon name="task_alt" size="30px" color="primary" />
        </div>

        <div class="instructor-task-list">
          <button type="button" class="instructor-task-item" @click="goToInstructorStudents">
            <q-icon name="fact_check" />
            <div>
              <strong>{{ t('profile.instructor.tasks.checkRoster') }}</strong>
              <span>
                {{
                  t('profile.instructor.tasks.registeredLearners', {
                    count: totalInstructorLearners.toLocaleString('th-TH'),
                  })
                }}
              </span>
            </div>
          </button>
          <button type="button" class="instructor-task-item" @click="goToInstructorLearningResults">
            <q-icon name="grading" />
            <div>
              <strong>{{ t('profile.instructor.tasks.recordResults') }}</strong>
              <span>
                {{
                  t('profile.instructor.tasks.pendingCourses', {
                    count: pendingResultCourses.toLocaleString('th-TH'),
                  })
                }}
              </span>
            </div>
          </button>
          <button type="button" class="instructor-task-item" @click="goToInstructorCertificates">
            <q-icon name="workspace_premium" />
            <div>
              <strong>{{ t('profile.instructor.tasks.createCertificate') }}</strong>
              <span>
                {{
                  t('profile.instructor.tasks.reviewAverage', {
                    score: averageReviewLabel,
                  })
                }}
              </span>
            </div>
          </button>
        </div>
      </q-card>

      <q-card flat bordered class="instructor-work-card">
        <div class="instructor-work-card__head">
          <div>
            <h2>{{ t('profile.instructor.systemSummary.title') }}</h2>
            <span>{{ t('profile.instructor.systemSummary.subtitle') }}</span>
          </div>
          <q-icon name="workspace_premium" size="30px" color="amber-8" />
        </div>

        <div class="certificate-status-row">
          <div>
            <strong>{{ totalInstructorLearners.toLocaleString('th-TH') }}</strong>
            <span>{{ t('profile.instructor.systemSummary.totalRegistrants') }}</span>
          </div>
          <div>
            <strong>{{ activeInstructorCoursesCount.toLocaleString('th-TH') }}</strong>
            <span>{{ t('profile.instructor.metrics.activeCourses') }}</span>
          </div>
          <div>
            <strong>{{ conversationsCount.toLocaleString('th-TH') }}</strong>
            <span>{{ t('profile.instructor.metrics.chatRooms') }}</span>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppAreaChart, { type AreaChartSeries } from 'components/common/AppAreaChart.vue';
import AppBarChart, { type BarChartItem } from 'components/common/AppBarChart.vue';
import AppDonutChart, { type DonutChartSegment } from 'components/common/AppDonutChart.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useProfileNavigation } from 'src/composables/use-profile-navigation';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { Course } from 'src/types/course';

const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
const { t, locale } = useI18n();
const { goToInstructorStudents, goToInstructorLearningResults, goToInstructorCertificates } =
  useProfileNavigation();

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);

onMounted(() => {
  const email = authStore.user?.email;
  if (!email) return;
  void instructorBackend.fetchSummary(email);
  void courseStore.fetchInstructorCourses(email);
});

const selectedCourseId = ref('all');

const selectedCourse = computed<Course | null>(
  () => instructorCourses.value.find((course) => course.id === selectedCourseId.value) ?? null,
);

const scopedInstructorCourses = computed<Course[]>(() =>
  selectedCourse.value ? [selectedCourse.value] : instructorCourses.value,
);

watch(instructorCourses, (courses) => {
  if (selectedCourseId.value === 'all') return;
  if (!courses.some((course) => course.id === selectedCourseId.value)) {
    selectedCourseId.value = 'all';
  }
});

const activeInstructorCoursesCount = computed<number>(
  () => scopedInstructorCourses.value.filter((course) => course.isActive).length,
);

const totalInstructorLearners = computed<number>(() =>
  selectedCourse.value
    ? selectedCourse.value.enrolledCount
    : (instructorBackend.summary.value?.totalStudents ??
      scopedInstructorCourses.value.reduce((sum, course) => sum + course.enrolledCount, 0)),
);

const pendingResultCourses = computed<number>(
  () => scopedInstructorCourses.value.filter((course) => course.enrolledCount > 0).length,
);

const averageReviewScore = computed<number | null>(() =>
  selectedCourse.value
    ? selectedCourse.value.reviewCount
      ? (selectedCourse.value.reviewAverage ?? 0)
      : null
    : instructorBackend.summary.value?.averageScore ?? null,
);

const averageReviewLabel = computed(() =>
  averageReviewScore.value != null ? averageReviewScore.value.toFixed(2) : '-',
);
const conversationsCount = computed(() => instructorBackend.summary.value?.conversations ?? 0);

const reportMonthLabels = computed<string[]>(() => {
  const formatter = new Intl.DateTimeFormat(locale.value === 'th' ? 'th-TH' : 'en-US', {
    month: 'short',
  });
  const now = new Date();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return formatter.format(date);
  });
});

const instructorOverviewCards = computed(() => [
  {
    label: t('profile.instructor.metrics.totalCourses'),
    value: scopedInstructorCourses.value.length,
    icon: 'menu_book',
    color: '#F5A623',
    iconBg: '#F59E0B',
  },
  {
    label: t('profile.instructor.metrics.activeCourses'),
    value: activeInstructorCoursesCount.value,
    icon: 'campaign',
    color: '#4F7DF3',
    iconBg: '#4F7DF3',
  },
  {
    label: t('profile.instructor.metrics.totalLearners'),
    value: totalInstructorLearners.value,
    icon: 'groups',
    color: '#18B65A',
    iconBg: '#18B65A',
  },
  {
    label: t('profile.instructor.metrics.chatRooms'),
    value: conversationsCount.value,
    icon: 'forum',
    color: '#D94A00',
    iconBg: '#D94A00',
  },
]);

function buildTrendValues(total: number, seed: number): number[] {
  const safeTotal = Math.max(total, 0);
  if (safeTotal === 0) {
    return reportMonthLabels.value.map(() => 0);
  }

  return reportMonthLabels.value.map((_, index) => {
    const progressRatio = 0.42 + index * 0.12;
    const courseBoost = Math.max(1, scopedInstructorCourses.value.length) * seed * (index + 1);
    return Math.max(0, Math.round(safeTotal * progressRatio + courseBoost));
  });
}

function formatReportNumber(value: number): string {
  return Math.round(value).toLocaleString('th-TH');
}

const instructorTrendSeries = computed<AreaChartSeries[]>(() => [
  {
    id: 'learners',
    label: t('profile.instructor.chart.learners'),
    color: '#31B7C8',
    values: buildTrendValues(totalInstructorLearners.value, 1.4),
    totalLabel: t('profile.instructor.units.peopleCount', {
      count: totalInstructorLearners.value.toLocaleString('th-TH'),
    }),
    unit: t('profile.instructor.units.people'),
  },
  {
    id: 'reviews',
    label: t('profile.instructor.metrics.averageReview'),
    color: '#F5A623',
    values: buildTrendValues(averageReviewScore.value ?? 0, 0.2),
    totalLabel: averageReviewLabel.value,
    unit: t('profile.instructor.units.score'),
  },
]);

const deliveryModeSegments = computed<DonutChartSegment[]>(() => {
  const countMode = (mode: Course['deliveryModes'][number]) =>
    scopedInstructorCourses.value.filter((course) => course.deliveryModes.includes(mode)).length;

  return [
    { id: 'online', label: 'Online', value: countMode('Online'), color: '#31B7C8' },
    { id: 'onsite', label: 'Onsite', value: countMode('Onsite'), color: '#49B37D' },
    {
      id: 'self-paced',
      label: 'Self-Paced',
      value: countMode('Self-Paced Learning'),
      color: '#F5A623',
    },
  ];
});

const topCourseLearnerBars = computed<BarChartItem[]>(() =>
  selectedCourse.value
    ? buildSelectedCourseBars(selectedCourse.value)
    : [...scopedInstructorCourses.value]
        .sort((a, b) => b.enrolledCount - a.enrolledCount)
        .slice(0, 5)
        .map((course, index) => ({
          id: course.id,
          label: course.titleEn || course.title,
          sublabel: course.code,
          value: course.enrolledCount,
          helperLabel: course.maxSeats
            ? t('profile.instructor.chart.fromSeats', {
                count: course.maxSeats.toLocaleString('th-TH'),
              })
            : '',
          color: ['#F5A623', '#31B7C8', '#49B37D', '#5B7CFA', '#E05F2C'][index] ?? '#F5A623',
          icon: 'groups',
        })),
);

const barChartTitle = computed<string>(() =>
  selectedCourse.value
    ? t('profile.instructor.chart.selectedCourseTitle')
    : t('profile.instructor.chart.topCoursesTitle'),
);

const barChartSubtitle = computed<string>(() =>
  selectedCourse.value
    ? t('profile.instructor.chart.selectedCourseSubtitle')
    : t('profile.instructor.chart.topCoursesSubtitle'),
);

function buildSelectedCourseBars(course: Course): BarChartItem[] {
  const availableSeats = course.maxSeats ? Math.max(0, course.maxSeats - course.enrolledCount) : 0;
  const reviewCount = course.reviewCount ?? 0;
  const reviewAverage = course.reviewAverage ?? 0;

  return [
    {
      id: `${course.id}-learners`,
      label: t('profile.instructor.chart.courseLearners'),
      sublabel: course.code,
      value: course.enrolledCount,
      helperLabel: course.maxSeats
        ? t('profile.instructor.chart.fromSeats', {
            count: course.maxSeats.toLocaleString('th-TH'),
          })
        : t('profile.instructor.chart.unlimitedSeats'),
      color: '#31B7C8',
      icon: 'groups',
    },
    {
      id: `${course.id}-reviews`,
      label: t('profile.instructor.chart.reviewCount'),
      value: reviewCount,
      helperLabel:
        reviewCount > 0
          ? t('profile.instructor.chart.averageScoreValue', { score: reviewAverage.toFixed(2) })
          : t('profile.instructor.chart.noReviews'),
      color: '#F5A623',
      icon: 'star',
    },
    ...(course.maxSeats
      ? [
          {
            id: `${course.id}-available`,
            label: t('profile.instructor.chart.availableSeats'),
            value: availableSeats,
            color: '#5B7CFA',
            icon: 'event_seat',
          },
        ]
      : []),
  ];
}

const reportSummaryItems = computed(() => [
  {
    label: t('profile.instructor.metrics.averageReview'),
    value: averageReviewLabel.value,
    icon: 'star',
    color: '#F5A623',
  },
  {
    label: t('profile.instructor.metrics.averageLearnersPerCourse'),
    value: Math.round(
      totalInstructorLearners.value / Math.max(scopedInstructorCourses.value.length, 1),
    ).toLocaleString('th-TH'),
    icon: 'groups',
    color: '#31B7C8',
  },
  {
    label: t('profile.instructor.metrics.activeCourses'),
    value: activeInstructorCoursesCount.value.toLocaleString('th-TH'),
    icon: 'campaign',
    color: '#49B37D',
  },
]);

defineExpose({
  instructorCourses,
  selectedCourseId,
  scopedInstructorCourses,
  activeInstructorCoursesCount,
  totalInstructorLearners,
  averageReviewScore,
  conversationsCount,
});
</script>

<style lang="scss" scoped>
.instructor-home-panel {
  display: grid;
  gap: 22px;
}

.instructor-home-header,
.instructor-work-card,
.instructor-report-card,
.instructor-overview-card {
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.96);
  transition:
    border-color 0.22s ease,
    box-shadow 0.22s ease,
    transform 0.22s ease;
}

.instructor-home-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  overflow: hidden;
  padding: 22px 24px;
  border: 1px solid rgba(245, 166, 35, 0.16);
  box-shadow: 0 18px 42px rgba(16, 24, 40, 0.07);
  background:
    radial-gradient(circle at 8% 0%, rgba(245, 166, 35, 0.18), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
}

.instructor-home-header::after {
  content: '';
  position: absolute;
  top: -60%;
  right: 10%;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(49, 183, 200, 0.18), transparent 68%);
  pointer-events: none;
}

.instructor-home-header__copy {
  position: relative;
  z-index: 1;
}

.instructor-home-header__eyebrow {
  color: #9a6400;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.instructor-home-header__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  span {
    padding: 5px 10px;
    border-radius: 999px;
    color: #0f766e;
    background: rgba(49, 183, 200, 0.12);
    font-size: 0.72rem;
    font-weight: 800;
  }
}

.instructor-home-header__filter {
  position: relative;
  z-index: 1;
  width: min(100%, 360px);
  flex: 0 1 360px;
}

.instructor-home-header__filter :deep(.q-field__control) {
  min-height: 46px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.08);
}

.instructor-home-header__filter :deep(.q-field__native) {
  color: #101828;
  font-weight: 800;
}

.instructor-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.instructor-overview-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 14px;
  border-color: rgba(17, 24, 39, 0.08) !important;
  border-radius: 14px;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
}

.instructor-overview-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--card-accent, #f5a623);
  opacity: 0;
  transition: opacity 0.22s ease;
}

.instructor-overview-card::after {
  content: '';
  position: absolute;
  right: -36px;
  bottom: -46px;
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--card-accent, #f5a623) 20%, transparent),
    transparent 68%
  );
  pointer-events: none;
}

.instructor-overview-card__icon {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 12px;
  color: #ffffff;
  background: var(--card-icon-bg, #f59e0b);
  box-shadow: 0 12px 22px color-mix(in srgb, var(--card-icon-bg, #f59e0b) 24%, transparent);
}

.instructor-overview-card__icon :deep(.q-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #ffffff !important;
  line-height: 1;
  text-align: center;
  transform: translateY(1px);
}

.instructor-overview-card > div {
  position: relative;
  z-index: 1;
}

.instructor-overview-card strong,
.instructor-overview-card span {
  display: block;
}

.instructor-overview-card strong {
  color: #101828;
  font-size: 1.48rem;
  font-weight: 800;
  line-height: 1.1;
}

.instructor-overview-card span {
  margin-top: 4px;
  color: #667085;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.instructor-report-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(340px, 0.75fr);
  gap: 18px;
}

.instructor-report-card {
  position: relative;
  overflow: hidden;
  min-width: 0;
  padding: 22px;
  border-color: rgba(17, 24, 39, 0.08) !important;
  box-shadow: 0 14px 34px rgba(16, 24, 40, 0.06);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at 100% 0%, rgba(49, 183, 200, 0.12), transparent 32%);
}

.instructor-report-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 3px;
  background: linear-gradient(90deg, #f5a623, #31b7c8, #49b37d);
  opacity: 0.76;
}

.instructor-report-card--wide {
  min-height: 330px;
}

.instructor-report-card__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h2 {
    margin: 0 0 4px;
    color: #101828;
    font-size: 1.1rem;
    font-weight: 800;
  }

  span {
    color: #667085;
    font-size: 0.85rem;
  }

  > .q-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: rgba(245, 166, 35, 0.1);
    box-shadow: inset 0 0 0 1px rgba(245, 166, 35, 0.14);
  }
}

.instructor-report-summary {
  display: grid;
  gap: 12px;

  div {
    display: grid;
    grid-template-columns: 34px 1fr auto;
    gap: 10px;
    align-items: center;
    min-height: 58px;
    padding: 12px;
    border: 1px solid rgba(17, 24, 39, 0.06);
    border-radius: 14px;
    background: #f8fafc;
  }

  .q-icon {
    font-size: 23px;
  }

  span {
    color: #667085;
    font-size: 0.84rem;
    font-weight: 700;
  }

  strong {
    color: #101828;
    font-size: 1.2rem;
    line-height: 1;
  }
}

.instructor-work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.instructor-work-card {
  position: relative;
  overflow: hidden;
  padding: 18px;
  border-color: rgba(17, 24, 39, 0.08) !important;
  box-shadow: 0 14px 34px rgba(16, 24, 40, 0.055);
  background:
    radial-gradient(circle at 96% 8%, rgba(245, 166, 35, 0.12), transparent 26%),
    linear-gradient(180deg, #ffffff, #fbfdff);
}

.instructor-work-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, #f5a623, #31b7c8);
  opacity: 0.72;
}

.instructor-work-card__head {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h2 {
    margin: 0 0 4px;
    color: #101828;
    font-size: 1.1rem;
    font-weight: 800;
  }

  span {
    color: #667085;
    font-size: 0.85rem;
  }

  > .q-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    background: rgba(245, 166, 35, 0.1);
  }
}

.instructor-task-list {
  display: grid;
  gap: 10px;
}

.instructor-task-item {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 12px;
  color: #344054;
  background: #fffaf2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(245, 166, 35, 0.48);
    box-shadow: 0 14px 28px rgba(245, 166, 35, 0.16);
    transform: translateY(-1px);
  }

  .q-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 11px;
    color: $primary;
    font-size: 22px;
    background: rgba(245, 166, 35, 0.12);
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 0.95rem;
  }

  span {
    margin-top: 2px;
    color: #667085;
    font-size: 0.82rem;
  }
}

.certificate-status-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  div {
    padding: 14px 10px;
    border-radius: 12px;
    background: linear-gradient(180deg, #f8fafc, #ffffff);
    box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.04);
    text-align: center;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 1.35rem;
  }

  span {
    color: #667085;
    font-size: 0.8rem;
    font-weight: 700;
  }
}

@media (hover: hover) and (pointer: fine) {
  .instructor-overview-card:hover,
  .instructor-report-card:hover,
  .instructor-work-card:hover {
    border-color: rgba(245, 166, 35, 0.92) !important;
    outline: 1px solid rgba(245, 166, 35, 0.82);
    outline-offset: -1px;
    box-shadow:
      0 28px 58px rgba(16, 24, 40, 0.26),
      0 14px 30px rgba(245, 166, 35, 0.32),
      0 4px 12px rgba(16, 24, 40, 0.12);
    transform: translateY(-4px);
  }
}

@media (max-width: 1100px) {
  .instructor-report-grid,
  .instructor-work-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .instructor-home-header,
  .instructor-report-card__head,
  .instructor-work-card__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .instructor-home-header__filter {
    width: 100%;
    flex-basis: auto;
  }

  .instructor-overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .instructor-report-card,
  .instructor-work-card {
    padding: 14px;
  }
}

@media (max-width: 560px) {
  .instructor-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
