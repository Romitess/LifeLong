<template>
  <q-page class="instructor-dashboard">
    <div
      v-if="showGreetingBanner"
      class="instructor-greeting-banner"
      :class="{ 'instructor-greeting-banner--leaving': isGreetingBannerLeaving }"
    >
      <div class="instructor-greeting-banner__icon">{{ timeGreeting.icon }}</div>
      <div class="instructor-greeting-banner__copy">
        <div class="instructor-greeting-banner__title">
          {{ timeGreeting.label }} {{ instructorDisplayName }}
        </div>
        <div class="instructor-greeting-banner__subtitle">
          {{ t('instructor.dashboard.greetingSubtitle') }}
        </div>
      </div>
    </div>

    <section class="instructor-hero">
      <q-carousel
        v-model="heroSlide"
        animated
        infinite
        :autoplay="5000"
        transition-prev="fade"
        transition-next="fade"
        transition-duration="1000"
        class="instructor-hero__carousel"
      >
        <q-carousel-slide
          v-for="slide in heroSlides"
          :key="slide.name"
          :name="slide.name"
          :img-src="slide.imageUrl"
          class="instructor-hero__slide"
        >
          <div class="instructor-hero__overlay"></div>
          <div class="section-container instructor-hero__inner">
            <div v-if="slide.name === 'courses'" class="instructor-hero__content">
              <div class="instructor-hero__brand">
                <div class="instructor-hero__brand-top">
                  <span class="instructor-hero__brand-buu">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('buu')">
                      {{ typedHeroText.buu }}
                    </span>
                  </span>
                  <span class="instructor-hero__brand-lll">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('lll')">
                      {{ typedHeroText.lll }}
                    </span>
                  </span>
                </div>
                <div class="instructor-hero__brand-title">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('short')">
                    {{ typedHeroText.short }}
                  </span>
                  <br />
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('course')">
                    {{ typedHeroText.course }}
                  </span>
                </div>
                <div class="instructor-hero__brand-subtitle">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('subtitle')">
                    {{ typedHeroText.subtitle }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else-if="slide.name === 'instructor-entry'" class="instructor-hero__content">
              <div class="instructor-hero__welcome">
                <div class="instructor-hero__welcome-logo">
                  <span class="instructor-hero__welcome-logo-buu">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('entryBuu')">
                      {{ typedHeroText.entryBuu }}
                    </span>
                  </span>
                  <span class="instructor-hero__welcome-logo-lll">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('entryLll')">
                      {{ typedHeroText.entryLll }}
                    </span>
                  </span>
                </div>
                <div class="instructor-hero__welcome-title">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('entryTitle')">
                    {{ typedHeroText.entryTitle }}
                  </span>
                  <br />
                  <span
                    class="instructor-hero__type-line instructor-hero__welcome-title-accent"
                    :class="getTypeLineClass('entryAccent')"
                  >
                    {{ typedHeroText.entryAccent }}
                  </span>
                </div>
                <div class="instructor-hero__welcome-system">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('entrySystem')">
                    {{ typedHeroText.entrySystem }}
                  </span>
                </div>
                <div class="instructor-hero__welcome-description">
                  <span
                    class="instructor-hero__type-line"
                    :class="getTypeLineClass('entryDescription')"
                  >
                    {{ typedHeroText.entryDescription }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </section>

    <div class="section-container instructor-dashboard__content">
      <!-- ─── STATS CARDS ─── -->
      <div class="instructor-dashboard__stats row q-col-gutter-lg q-mb-xl">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <StatCard
            :icon="stat.icon"
            :value="stat.value"
            :label="stat.label"
            :icon-color="stat.color"
            :icon-tint="stat.bgColor"
          />
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- ─── ACTIVE COURSES ─── -->
        <div class="col-12 col-lg-8">
          <div class="row items-end justify-between q-mb-lg">
            <h2 class="section-title-underline q-mb-none">
              {{ t('instructor.nav.activeCourses') }}
            </h2>
            <q-btn
              unelevated
              text-color="primary"
              :label="t('viewAll')"
              no-caps
              class="dashboard-view-all-btn"
              tag="a"
              :href="resolveFullUrl('/instructor/courses')"
              @click="onViewAllCoursesClick"
            />
          </div>

          <div class="column q-gutter-y-md">
            <q-card
              v-for="course in instructorCourses"
              :key="course.id"
              flat
              bordered
              class="course-row-card"
            >
              <q-card-section horizontal>
                <q-img :src="course.imageUrl" class="col-3" style="min-width: 150px" />
                <q-card-section class="col q-pa-lg">
                  <div class="row items-center justify-between no-wrap">
                    <div>
                      <div class="text-overline text-primary">{{ course.code }}</div>
                      <div class="text-h6 text-weight-bold q-mb-xs">
                        {{ getTranslatedCourseTitle(course) }}
                      </div>
                    </div>
                    <q-badge :color="getStatusColor(course.status)" class="q-pa-sm">
                      {{ t(getStatusKey(course.status)) }}
                    </q-badge>
                  </div>

                  <div class="row items-center q-gutter-x-lg q-mt-sm text-grey-7 text-caption">
                    <div class="row items-center">
                      <q-icon name="group" class="q-mr-xs" />
                      {{ course.enrolledCount }}{{ course.maxSeats ? ` / ${course.maxSeats}` : '' }}
                      {{ t('instructor.course.learnersLabel') }}
                    </div>
                    <div class="row items-center">
                      <q-icon name="star" class="q-mr-xs text-amber" />
                      4.8 (124 {{ t('instructor.dashboard.reviews') }})
                    </div>
                    <div class="row items-center">
                      <q-icon name="update" class="q-mr-xs" />
                      {{ t('instructor.dashboard.lastUpdated') }}:
                      {{ getDaysAgoText(course.updatedAt) }}
                    </div>
                  </div>

                  <div class="row q-gutter-sm q-mt-lg">
                    <q-btn
                      unelevated
                      color="primary"
                      :label="t('instructor.dashboard.manageCourse')"
                      size="sm"
                      class="q-px-md"
                      tag="a"
                      :href="resolveFullUrl(`/instructor/courses?courseId=${course.id}`)"
                      @click="onManageCourseClick(course.id, $event)"
                    />
                    <q-btn
                      outline
                      color="primary"
                      :label="t('instructor.dashboard.gradeWork')"
                      size="sm"
                      class="q-px-md"
                      tag="a"
                      :href="
                        resolveFullUrl(`/instructor/students?courseId=${course.id}&tab=results`)
                      "
                      @click="onGradeClick(course.id, $event)"
                    />
                    <q-btn
                      flat
                      color="grey-7"
                      icon="more_horiz"
                      dense
                      :aria-label="t('instructor.dashboard.viewCourseDetail')"
                    >
                      <q-tooltip>{{ t('instructor.dashboard.viewCourseDetail') }}</q-tooltip>
                      <q-menu
                        anchor="center right"
                        self="center left"
                        :offset="[12, 0]"
                        transition-show="jump-down"
                        transition-hide="jump-up"
                        class="course-syllabus-menu"
                      >
                        <q-card class="course-syllabus-card">
                          <q-card-section class="course-syllabus-card__header">
                            <div class="course-syllabus-card__header-copy">
                              <div class="course-syllabus-card__eyebrow">Course Syllabus</div>
                              <div class="course-syllabus-card__title">
                                {{ getTranslatedCourseTitle(course) }}
                              </div>
                              <div
                                v-if="course.titleEn && course.titleEn !== course.title"
                                class="course-syllabus-card__subtitle"
                              >
                                {{ locale === 'th' ? course.titleEn : course.title }}
                              </div>
                            </div>
                            <div class="course-syllabus-card__hours">
                              <strong>{{ course.totalHours ?? 0 }}</strong>
                              <span>{{ t('instructor.dashboard.hoursAbbr') }}</span>
                            </div>
                          </q-card-section>

                          <q-card-section class="course-syllabus-card__body">
                            <div class="course-syllabus-card__quick-row">
                              <q-chip dense square class="course-syllabus-card__chip">
                                <q-icon name="confirmation_number" />
                                {{ course.code }}
                              </q-chip>
                              <q-chip dense square class="course-syllabus-card__chip">
                                <q-icon name="groups" />
                                {{ course.enrolledCount }}/{{ course.maxSeats ?? '-' }}
                                {{ t('instructor.course.learnersLabel') }}
                              </q-chip>
                              <q-chip dense square class="course-syllabus-card__chip">
                                <q-icon name="sell" />
                                {{ formatCoursePrice(course) }}
                              </q-chip>
                            </div>

                            <div class="course-syllabus-card__meta-grid">
                              <div
                                v-for="item in getCourseSyllabusMeta(course)"
                                :key="item.label"
                                class="course-syllabus-card__meta-item"
                              >
                                <q-icon :name="item.icon" />
                                <div>
                                  <span>{{ item.label }}</span>
                                  <strong>{{ item.value }}</strong>
                                </div>
                              </div>
                            </div>

                            <div
                              v-if="getCourseDetail(course.id)?.descriptionFull"
                              class="course-syllabus-card__description"
                            >
                              {{ getCourseDetail(course.id)?.descriptionFull }}
                            </div>

                            <div class="course-syllabus-card__section-label">
                              {{ t('instructor.dashboard.syllabusTopics') }}
                            </div>
                            <div
                              v-if="getCourseDetail(course.id)?.syllabus?.length"
                              class="course-syllabus-card__timeline"
                            >
                              <div
                                v-for="lesson in getCourseDetail(course.id)?.syllabus.slice(0, 4)"
                                :key="lesson.week"
                                class="course-syllabus-card__timeline-item"
                              >
                                <div class="course-syllabus-card__timeline-marker">
                                  {{ lesson.week }}
                                </div>
                                <div>
                                  <strong>{{ lesson.topic }}</strong>
                                  <span>{{ lesson.description }}</span>
                                </div>
                              </div>
                            </div>
                            <div v-else class="course-syllabus-card__empty">
                              {{ t('instructor.dashboard.noSyllabusTopics') }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </q-menu>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- ─── SIDEBAR / ACTIVITIES ─── -->
        <div class="col-12 col-lg-4">
          <div class="row items-end q-mb-lg">
            <h2 class="section-title-underline q-mb-none">
              {{ t('instructor.dashboard.todoTitle') }}
            </h2>
          </div>
          <q-card flat bordered class="activity-card">
            <q-list separator>
              <q-item
                v-for="task in todoTasks"
                :key="task.id"
                clickable
                v-ripple
                tag="a"
                :href="resolveFullUrl(task.to)"
                class="q-py-md"
                @click="onTodoTaskClick(task.to, $event)"
              >
                <q-item-section avatar>
                  <q-avatar size="40px" :color="task.color" text-color="white">
                    <q-icon :name="task.icon" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ task.title }}</q-item-label>
                  <q-item-label caption class="text-grey-8">{{ task.detail }}</q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    color="primary"
                    class="todo-task-chevron"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section class="text-center">
              <q-btn
                unelevated
                text-color="primary"
                :label="t('instructor.dashboard.viewAllTasks')"
                no-caps
                class="todo-view-all-btn"
                tag="a"
                :href="resolveFullUrl('/instructor/students')"
                @click="onViewAllTasksClick"
              />
            </q-card-section>
          </q-card>

          <h2 class="section-title-underline q-mb-lg" style="margin-top: 30px">
            {{ t('instructor.dashboard.systemAnnouncement') }}
          </h2>
          <q-banner dense rounded class="bg-blue-1 text-blue-9 q-pa-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue-9" />
            </template>
            ระบบจะมีการปิดปรับปรุงในวันที่ 1 พฤษภาคม 2569 เวลา 22:00 - 02:00 น.
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import StatCard from 'src/components/base/StatCard.vue';
import type { Course, CourseStatus } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import heroOverviewImageUrl from 'src/assets/we1.png';
import heroCourseImageUrl from 'src/assets/homepicture1.png';
import heroClassroomImageUrl from 'src/assets/homepicture2.png';
import heroInstructorImageUrl from 'src/assets/in.png';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

const { t, locale } = useI18n();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
const heroSlide = ref('overview');
const showGreetingBanner = ref(false);
const isGreetingBannerLeaving = ref(false);
let unsubscribeEnrollments: (() => void) | null = null;
const typedHeroText = ref({
  buu: '',
  lll: '',
  short: '',
  course: '',
  subtitle: '',
  entryBuu: '',
  entryLll: '',
  entryTitle: '',
  entryAccent: '',
  entrySystem: '',
  entryDescription: '',
});
const activeTypingKey = ref('');
const heroTypingTimers: ReturnType<typeof setTimeout>[] = [];
const greetingBannerTimers: ReturnType<typeof setTimeout>[] = [];

onMounted(() => {
  courseStore.init();
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
    void instructorBackend.fetchSummary(email);
    instructorBackend.connectSocket(email);
    instructorBackend.joinInstructorGlobalRoom();
    unsubscribeEnrollments = instructorBackend.subscribeToEnrollments(email);
  }

  const showTimer = setTimeout(() => {
    showGreetingBanner.value = true;
    isGreetingBannerLeaving.value = false;
  }, 260);
  const leaveTimer = setTimeout(() => {
    isGreetingBannerLeaving.value = true;
  }, 5200);
  const hideTimer = setTimeout(() => {
    showGreetingBanner.value = false;
    isGreetingBannerLeaving.value = false;
  }, 5800);

  greetingBannerTimers.push(showTimer, leaveTimer, hideTimer);
});

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user).slice(0, 6),
);

const instructorDisplayName = computed(() => {
  const user = authStore.user;
  return (
    user?.firstNameTh ||
    user?.firstNameEn ||
    user?.username ||
    user?.email?.split('@')[0] ||
    t('profile.roles.instructor')
  );
});

const timeGreeting = computed(() => {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

  if (minutesSinceMidnight >= 6 * 60 && minutesSinceMidnight <= 12 * 60) {
    return { label: t('instructor.dashboard.greeting.morning'), icon: '🌅' };
  }
  if (minutesSinceMidnight >= 12 * 60 + 1 && minutesSinceMidnight <= 15 * 60 + 59) {
    return { label: t('instructor.dashboard.greeting.afternoon'), icon: '🌞' };
  }
  if (minutesSinceMidnight >= 16 * 60 && minutesSinceMidnight <= 19 * 60 + 59) {
    return { label: t('instructor.dashboard.greeting.evening'), icon: '🌇' };
  }
  return { label: t('instructor.dashboard.greeting.night'), icon: '🌙' };
});

const stats = computed(() => [
  {
    label: t('instructor.metrics.totalLearners'),
    value: (instructorBackend.summary.value?.totalStudents ?? 0).toLocaleString('th-TH'),
    icon: 'people',
    color: 'white',
    bgColor: '#F59E0B',
  },
  {
    label: t('instructor.metrics.publishedCourses'),
    value: (
      instructorBackend.summary.value?.activeCourses ?? instructorCourses.value.length
    ).toLocaleString('th-TH'),
    icon: 'menu_book',
    color: 'white',
    bgColor: '#4F7DF3',
  },
  {
    label: t('instructor.reportLabels.avgScore'),
    value: instructorBackend.summary.value?.averageScore?.toFixed(2) ?? '-',
    icon: 'star',
    color: 'white',
    bgColor: '#18B65A',
  },
  {
    label: t('instructor.dashboard.chatRoomsMetric'),
    value: (instructorBackend.summary.value?.conversations ?? 0).toLocaleString('th-TH'),
    icon: 'forum',
    color: 'white',
    bgColor: '#D94A00',
  },
]);

const todoTasks = computed(() => [
  {
    id: 'grade-work',
    title: t('instructor.dashboard.todo.gradeWork.title'),
    detail: t('instructor.dashboard.todo.gradeWork.detail', {
      count: instructorBackend.summary.value?.recentActivities.length ?? 0,
    }),
    icon: 'grading',
    color: 'primary',
    to: '/instructor/students?tab=results',
  },
  {
    id: 'approve-certificates',
    title: t('instructor.dashboard.todo.certificates.title'),
    detail: t('instructor.dashboard.todo.certificates.detail'),
    icon: 'workspace_premium',
    color: 'amber-8',
    to: '/instructor/certificates',
  },
  {
    id: 'reply-learners',
    title: t('instructor.dashboard.todo.messages.title'),
    detail: t('instructor.dashboard.todo.messages.detail', {
      count: instructorBackend.summary.value?.conversations ?? 0,
    }),
    icon: 'forum',
    color: 'teal-7',
    to: '/instructor/chat',
  },
]);

const heroSlides = [
  {
    name: 'overview',
    imageUrl: heroOverviewImageUrl,
  },
  {
    name: 'instructor-entry',
    imageUrl: heroInstructorImageUrl,
  },
  {
    name: 'courses',
    imageUrl: heroCourseImageUrl,
  },
  {
    name: 'learners',
    imageUrl: heroClassroomImageUrl,
  },
];

type HeroTypingEntry = {
  key:
    | 'buu'
    | 'lll'
    | 'short'
    | 'course'
    | 'subtitle'
    | 'entryBuu'
    | 'entryLll'
    | 'entryTitle'
    | 'entryAccent'
    | 'entrySystem'
    | 'entryDescription';
  text: string;
  speed: number;
  delayBefore?: number;
};

const emptyTypedHeroText = {
  buu: '',
  lll: '',
  short: '',
  course: '',
  subtitle: '',
  entryBuu: '',
  entryLll: '',
  entryTitle: '',
  entryAccent: '',
  entrySystem: '',
  entryDescription: '',
};

const heroTypingSequences: Record<string, HeroTypingEntry[]> = {
  courses: [
    { key: 'buu', text: 'BUU', speed: 85 },
    { key: 'lll', text: 'LLL', speed: 85, delayBefore: 120 },
    { key: 'short', text: 'SHORT', speed: 70, delayBefore: 140 },
    { key: 'course', text: 'COURSE', speed: 70, delayBefore: 70 },
    {
      key: 'subtitle',
      text: t('instructor.dashboard.heroSubtitle'),
      speed: 32,
      delayBefore: 220,
    },
  ],
  'instructor-entry': [
    { key: 'entryBuu', text: 'BUU', speed: 85 },
    { key: 'entryLll', text: 'LLL', speed: 85, delayBefore: 90 },
    { key: 'entryTitle', text: t('instructor.dashboard.heroWelcome'), speed: 70, delayBefore: 140 },
    { key: 'entryAccent', text: t('profile.roles.instructor'), speed: 70, delayBefore: 70 },
    {
      key: 'entrySystem',
      text: t('instructor.dashboard.heroSystem'),
      speed: 32,
      delayBefore: 220,
    },
  ],
};

onBeforeUnmount(() => {
  clearHeroTypingTimers();
  greetingBannerTimers.forEach((timer) => clearTimeout(timer));
  greetingBannerTimers.length = 0;
  unsubscribeEnrollments?.();
  instructorBackend.disconnectSocket();
});

watch(
  heroSlide,
  (currentSlide) => {
    if (currentSlide in heroTypingSequences) {
      startHeroTypewriter(currentSlide);
      return;
    }

    clearHeroTypingTimers();
    activeTypingKey.value = '';
    typedHeroText.value = { ...emptyTypedHeroText };
  },
  { immediate: true },
);

function clearHeroTypingTimers() {
  heroTypingTimers.forEach((timer) => clearTimeout(timer));
  heroTypingTimers.length = 0;
}

function startHeroTypewriter(slideName: string) {
  clearHeroTypingTimers();
  typedHeroText.value = { ...emptyTypedHeroText };

  let accumulatedDelay = 0;
  const typingSequence = heroTypingSequences[slideName] ?? [];

  typingSequence.forEach((entry, entryIndex) => {
    accumulatedDelay += entry.delayBefore ?? 0;

    for (let characterIndex = 1; characterIndex <= entry.text.length; characterIndex += 1) {
      const timer = setTimeout(() => {
        activeTypingKey.value = entry.key;
        typedHeroText.value = {
          ...typedHeroText.value,
          [entry.key]: entry.text.slice(0, characterIndex),
        };
      }, accumulatedDelay);

      heroTypingTimers.push(timer);
      accumulatedDelay += entry.speed;
    }

    const settleTimer = setTimeout(() => {
      const nextEntry = typingSequence[entryIndex + 1];
      activeTypingKey.value = nextEntry?.key ?? '';
    }, accumulatedDelay + 120);

    heroTypingTimers.push(settleTimer);
  });

  const endTimer = setTimeout(() => {
    activeTypingKey.value = '';
  }, accumulatedDelay + 280);

  heroTypingTimers.push(endTimer);
}

function getTypeLineClass(key: string) {
  return {
    'instructor-hero__type-line--active': activeTypingKey.value === key,
  };
}

function getCourseDetail(courseId: string): CourseDetail | undefined {
  return courseStore.getCourseDetailById(courseId);
}

function getTranslatedCourseTitle(course: Course): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function getStatusKey(status: CourseStatus): string {
  const map: Record<CourseStatus, string> = {
    ประกาศนียบัตร: 'statusCert',
    สะสมหน่วยกิต: 'statusCredit',
    เปิดรับสมัคร: 'statusOpen',
    ปิดรับสมัคร: 'statusClosed',
    เร็วๆนี้: 'statusSoon',
  };
  return map[status] ?? status;
}

function getStatusColor(status: CourseStatus): string {
  const colorMap: Record<CourseStatus, string> = {
    ประกาศนียบัตร: 'blue-grey-8',
    สะสมหน่วยกิต: 'amber-8',
    เปิดรับสมัคร: 'positive',
    ปิดรับสมัคร: 'red-7',
    เร็วๆนี้: 'orange-8',
  };
  return colorMap[status] ?? 'grey-7';
}

function formatDeliveryModes(course: Course): string {
  return course.deliveryModes.length > 0 ? course.deliveryModes.join(', ') : '-';
}

function formatCoursePrice(course: Course): string {
  if (course.isFree || course.price === 0) {
    return t('free');
  }

  return `${course.price.toLocaleString('th-TH')} บาท`;
}

function getDaysAgoText(updatedAt?: string): string {
  if (!updatedAt) return '-';
  const updatedDate = new Date(updatedAt);
  if (Number.isNaN(updatedDate.getTime())) return '-';

  const now = new Date();
  const diffTime = now.getTime() - updatedDate.getTime();
  const diffDays = Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale.value === 'th' ? 'วันนี้' : 'Today';
  return t('instructor.dashboard.daysAgo', { count: diffDays });
}

function getCourseSyllabusMeta(course: Course) {
  return [
    {
      icon: 'account_balance',
      label: t('instructor.dashboard.syllabusMetaFaculty'),
      value: course.faculty || '-',
    },
    {
      icon: 'category',
      label: t('instructor.dashboard.syllabusMetaCategory'),
      value: course.category || '-',
    },
    {
      icon: 'schedule',
      label: t('instructor.dashboard.syllabusMetaHours'),
      value: `${course.totalHours ?? 0} ${t('instructor.dashboard.syllabusHoursUnit')}`,
    },
    {
      icon: 'devices',
      label: t('instructor.dashboard.syllabusMetaMode'),
      value: formatDeliveryModes(course),
    },
    {
      icon: 'event',
      label: t('instructor.dashboard.syllabusMetaRegistration'),
      value: `${course.registrationStart} - ${course.registrationEnd}`,
    },
    {
      icon: 'payments',
      label: t('instructor.dashboard.syllabusMetaFee'),
      value: formatCoursePrice(course),
    },
  ];
}

function goToCourseManagement(courseId: string) {
  void router.push({
    path: '/instructor/courses',
    query: { courseId },
  });
}

function onViewAllCoursesClick(event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push('/instructor/courses');
}

function onManageCourseClick(courseId: string, event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  goToCourseManagement(courseId);
}

function onGradeClick(courseId: string, event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push({
    path: '/instructor/students',
    query: { courseId, tab: 'results' },
  });
}

function onTodoTaskClick(to: string, event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push(to);
}

function onViewAllTasksClick(event: Event) {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push('/instructor/students');
}
</script>

<style lang="scss" scoped>
.instructor-dashboard {
  min-height: 100vh;
}

.instructor-greeting-banner {
  position: fixed;
  top: 84px;
  right: 124px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 320px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 14px 18px;
  border: 1px solid rgba(255, 199, 44, 0.45);
  border-radius: 18px;
  background: rgba(255, 252, 243, 0.96);
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.14),
    0 6px 20px rgba(255, 199, 44, 0.16);
  backdrop-filter: blur(12px);
  animation: instructorGreetingBannerIn 0.72s cubic-bezier(0.22, 1, 0.36, 1);
}

.instructor-greeting-banner--leaving {
  animation: instructorGreetingBannerOut 0.45s ease forwards;
}

.instructor-greeting-banner__icon {
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 199, 44, 0.18), rgba(255, 255, 255, 0.95));
  font-size: 1.5rem;
}

.instructor-greeting-banner__copy {
  min-width: 0;
}

.instructor-greeting-banner__title {
  color: #163b73;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.instructor-greeting-banner__subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
}

.instructor-hero {
  position: relative;
  width: 100%;
}

.instructor-hero__carousel {
  width: 100%;
  height: auto;
  aspect-ratio: 1920 / 600;
  overflow: hidden;
  background: #f6efe3;
}

.instructor-hero__inner {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 100%;
}

.instructor-hero__carousel :deep(.q-carousel__slide) {
  padding: 0;
  background-position: center 50%;
}

.instructor-hero__slide {
  position: relative;
}

.instructor-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 28%),
    radial-gradient(circle at 74% 18%, rgba(255, 215, 120, 0.12) 0%, rgba(255, 215, 120, 0) 22%),
    radial-gradient(circle at 64% 82%, rgba(255, 248, 230, 0.08) 0%, rgba(255, 248, 230, 0) 20%),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 250, 240, 0.03) 42%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(180deg, rgba(255, 212, 102, 0.08) 0%, rgba(255, 212, 102, 0) 42%);
}

.instructor-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 680px;
  padding: 40px 48px 56px;
  color: #1f2937;
}

.instructor-hero__brand {
  max-width: 620px;
}

.instructor-hero__brand-top {
  display: flex;
  align-items: baseline;
  gap: 12px;
  line-height: 0.9;
}

.instructor-hero__brand-buu {
  color: #ffc72c;
  font-size: clamp(4rem, 7vw, 6.5rem);
  font-weight: 800;
}

.instructor-hero__brand-lll {
  color: #6b7280;
  font-size: clamp(4rem, 7vw, 6.5rem);
  font-weight: 800;
}

.instructor-hero__brand-title {
  margin-top: 16px;
  color: #1f2f97;
  font-size: clamp(3rem, 5.5vw, 5.4rem);
  font-weight: 800;
  line-height: 0.95;
}

.instructor-hero__brand-subtitle {
  margin-top: 20px;
  max-width: 520px;
  color: #64748b;
  font-size: clamp(1rem, 1.8vw, 1.7rem);
  font-weight: 600;
  line-height: 1.45;
}

.instructor-hero__welcome {
  max-width: 720px;
}

.instructor-hero__welcome-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 28px;
  line-height: 1;
}

.instructor-hero__welcome-logo-buu {
  color: #ffc72c;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 800;
}

.instructor-hero__welcome-logo-lll {
  color: #153a78;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 800;
}

.instructor-hero__welcome-title {
  color: #0b376e;
  font-size: clamp(3rem, 5.4vw, 5.6rem);
  font-weight: 800;
  line-height: 1.05;
}

.instructor-hero__welcome-title-accent {
  color: #ffc20e;
}

.instructor-hero__welcome-system {
  margin-top: 42px;
  color: #64748b;
  font-size: clamp(1.2rem, 2vw, 1.9rem);
  font-weight: 800;
}

.instructor-hero__welcome-description {
  margin-top: 16px;
  max-width: 680px;
  color: #64748b;
  font-size: clamp(0.95rem, 1.2vw, 1.2rem);
  font-weight: 500;
  line-height: 1.6;
}

.instructor-hero__type-line {
  display: inline-block;
  min-height: 1em;
}

.instructor-hero__type-line--active::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 0.82em;
  margin-left: 0.06em;
  background: currentColor;
  vertical-align: -0.06em;
  animation: instructorHeroCaretBlink 0.75s step-end infinite;
}

.instructor-dashboard__content {
  position: relative;
  margin-top: -32px;
  padding: 0 24px 48px;
  z-index: 3;
}

.instructor-dashboard__stats {
  position: relative;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 600;
}

.course-row-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    border-color: $primary;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
}

.course-syllabus-menu {
  border-radius: 14px;
  overflow: visible;
  box-shadow: 0 22px 58px rgba(15, 23, 42, 0.2);
}

.course-syllabus-card {
  position: relative;
  width: min(420px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 16px;
  background: #ffffff;
}

.course-syllabus-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 5px;
  background: linear-gradient(180deg, $primary, #4f7df3 56%, #18b65a);
}

.course-syllabus-card__header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.9);
  background:
    radial-gradient(circle at 88% 10%, rgba(79, 125, 243, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(255, 247, 230, 0.98), rgba(255, 255, 255, 0.98) 54%), #ffffff;
}

.course-syllabus-card__header-copy {
  min-width: 0;
}

.course-syllabus-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.13);
  color: $primary;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0;
  text-transform: uppercase;
}

.course-syllabus-card__title {
  margin-top: 8px;
  color: #111827;
  font-size: 1.04rem;
  font-weight: 800;
  line-height: 1.35;
}

.course-syllabus-card__subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.35;
}

.course-syllabus-card__hours {
  display: grid;
  place-items: center;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  border: 1px solid rgba(79, 125, 243, 0.18);
  border-radius: 50%;
  background:
    linear-gradient(#ffffff, #ffffff) padding-box,
    linear-gradient(145deg, #4f7df3, $primary) border-box;
  box-shadow: 0 10px 24px rgba(79, 125, 243, 0.16);
  color: #163b73;
  line-height: 1;
}

.course-syllabus-card__hours strong {
  font-size: 1.05rem;
  font-weight: 900;
}

.course-syllabus-card__hours span {
  margin-top: 2px;
  color: #64748b;
  font-size: 0.64rem;
  font-weight: 800;
}

.course-syllabus-card__body {
  padding: 16px 18px 18px;
}

.course-syllabus-card__quick-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.course-syllabus-card__chip {
  margin: 0;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 800;
}

.course-syllabus-card__chip .q-icon {
  margin-right: 5px;
  color: $primary;
  font-size: 16px;
}

.course-syllabus-card__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.course-syllabus-card__meta-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  padding: 11px 10px;
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 12px;
  background: linear-gradient(180deg, #fbfdff, #f8fafc);
  transition:
    border-color 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.course-syllabus-card__meta-item:hover {
  border-color: rgba(245, 166, 35, 0.55);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
  transform: translateY(-1px);
}

.course-syllabus-card__meta-item .q-icon {
  flex: 0 0 auto;
  margin-top: 2px;
  color: $primary;
  font-size: 18px;
}

.course-syllabus-card__meta-item span {
  display: block;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
}

.course-syllabus-card__meta-item strong {
  display: block;
  margin-top: 3px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.course-syllabus-card__description {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-left: 4px solid $primary;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.1), rgba(255, 255, 255, 0.96)), #ffffff;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.55;
}

.course-syllabus-card__section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: #0f172a;
  font-size: 0.86rem;
  font-weight: 800;
}

.course-syllabus-card__section-label::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #18b65a;
  box-shadow: 0 0 0 4px rgba(24, 182, 90, 0.12);
}

.course-syllabus-card__timeline {
  position: relative;
  display: grid;
  gap: 10px;
  margin-top: 10px;
  padding-left: 3px;
}

.course-syllabus-card__timeline::before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 17px;
  width: 2px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(245, 166, 35, 0.75), rgba(79, 125, 243, 0.42));
}

.course-syllabus-card__timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr);
  gap: 10px;
  align-items: flex-start;
  padding: 10px 10px 10px 0;
  border-radius: 12px;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.course-syllabus-card__timeline-item:hover {
  background: rgba(248, 250, 252, 0.92);
  transform: translateX(2px);
}

.course-syllabus-card__timeline-marker {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, $primary, #4f7df3);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  box-shadow: 0 8px 16px rgba(245, 166, 35, 0.22);
}

.course-syllabus-card__timeline-item strong {
  display: block;
  color: #1f2937;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.35;
}

.course-syllabus-card__timeline-item span {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.45;
}

.course-syllabus-card__empty {
  margin-top: 10px;
  padding: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.65);
  border-radius: 10px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.activity-card {
  border-radius: 16px;
}

.dashboard-view-all-btn {
  background: #ffffff !important;
  border: 1px solid rgba($primary, 0.28);
  border-radius: 12px;
  box-shadow: none !important;
  font-weight: 700;
}

.todo-task-chevron {
  background: #ffffff;
  border: 1px solid rgba($primary, 0.28);
}

.todo-view-all-btn {
  background: #ffffff !important;
  border: 1px solid rgba($primary, 0.28);
  border-radius: 12px;
  box-shadow: none !important;
  font-weight: 700;
}

.section-title-underline {
  display: inline-block;
  padding-bottom: 8px;
  font-size: 1.5rem;
  font-weight: 700;
  color: $blue-grey-9;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

@keyframes instructorHeroCaretBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes instructorGreetingBannerIn {
  0% {
    opacity: 0;
    transform: translate3d(0, -18px, 0) scale(0.94);
  }
  62% {
    opacity: 1;
    transform: translate3d(0, 4px, 0) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes instructorGreetingBannerOut {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -10px, 0) scale(0.96);
  }
}

@media (max-width: 1023px) {
  .instructor-greeting-banner {
    top: 76px;
    right: 88px;
    min-width: 280px;
  }

  .instructor-dashboard__content {
    margin-top: -20px;
    padding: 0 20px 40px;
  }

  .instructor-hero__content {
    max-width: 100%;
    padding: 88px 28px 28px;
  }
}

@media (max-width: 599px) {
  .instructor-greeting-banner {
    top: 74px;
    right: 16px;
    left: 16px;
    min-width: 0;
    max-width: none;
    padding: 12px 14px;
  }

  .instructor-hero__carousel {
    aspect-ratio: 16 / 10;
  }

  .instructor-hero__inner {
    display: block;
  }

  .instructor-hero__title {
    font-size: 2rem;
  }

  .instructor-dashboard__content {
    margin-top: -8px;
    padding: 0 16px 32px;
  }

  .instructor-hero__content {
    padding: 32px 20px 24px;
  }

  .instructor-hero__brand-title {
    margin-top: 12px;
  }

  .instructor-hero__brand-subtitle {
    margin-top: 14px;
    max-width: 320px;
    font-size: 0.95rem;
  }

  .instructor-hero__welcome-logo {
    margin-bottom: 16px;
  }

  .instructor-hero__welcome-title {
    font-size: 2.2rem;
  }

  .instructor-hero__welcome-system {
    margin-top: 16px;
    font-size: 1rem;
  }

  .instructor-hero__welcome-description {
    display: none;
  }
}
</style>
