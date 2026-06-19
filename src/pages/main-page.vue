<template>
  <q-page class="home-page ds-grain ds-grain--page">
    <!-- ─── HERO ─── -->
    <template v-if="!courseStore.selectedCategory">
      <section
        class="hero-section"
        :style="{ '--hero-slide-duration': `${heroSlideDurationMs}ms` }"
      >
        <q-carousel
          v-model="heroSlide"
          animated
          infinite
          :autoplay="heroSlideDurationMs"
          transition-prev="fade"
          transition-next="fade"
          transition-duration="1000"
          class="hero-carousel"
        >
          <q-carousel-slide
            v-for="slide in homeHeroSlides"
            :key="slide.id"
            :name="slide.id"
            :img-src="slide.imageUrl"
            class="hero-slide"
            :class="{ 'hero-slide--learner': slide.kind === 'learner' }"
            :style="getHeroSlideStyle(slide)"
          >
            <template v-if="slide.kind === 'template'">
              <div
                class="hero-slide__overlay"
                :style="{
                  backgroundColor: slide.template.overlayColor,
                  opacity: slide.template.overlayOpacity,
                }"
              />
              <div
                v-if="slide.template.textBlock.enabled"
                class="hero-copy"
                :class="{ 'hero-copy--active': heroSlide === slide.id }"
              >
                <div class="hero-copy__content" :style="getHeroTextBlockStyle(slide.template)">
                  <div
                    v-for="(line, lineIndex) in getEnabledHeroLines(slide.template)"
                    :key="line.id"
                    class="hero-type-line"
                    :class="[
                      getHeroLineEffectClass(line),
                      { 'hero-type-line--visible': isHeroLineVisible(lineIndex) },
                    ]"
                    :style="getHeroLineStyle(line)"
                  >
                    <span
                      class="hero-type-line__text"
                      :style="{ color: getHeroLineCaretColor(line) }"
                    >
                      <span
                        v-for="segment in getVisibleHeroSegments(line, lineIndex)"
                        :key="segment.id"
                        :style="{
                          color: segment.color,
                          fontWeight: segment.fontWeight ?? line.fontWeight,
                        }"
                        v-text="segment.text"
                      />
                      <span v-if="shouldShowHeroCaret(lineIndex)" class="hero-type-caret"></span>
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="hero-slide__overlay hero-slide__overlay--learner" />
              <div class="hero-learner">
                <div class="hero-learner__copy">
                  <div class="hero-learner__eyebrow">
                    <q-icon name="explore" size="18px" />
                    <span>Learner Spotlight</span>
                  </div>
                  <h2>{{ slide.learner.name }}</h2>
                  <div class="hero-learner__title-accent" />
                  <p class="hero-learner__summary">สถานะการเรียนโดดเด่นในรายวิชา</p>
                  <div
                    class="hero-learner__course-title"
                    v-html="formatHeroCourseTitle(slide.learner.courseTitle)"
                  ></div>
                  <div class="hero-learner__course-line">
                    LIFELONG LEARNING - {{ slide.learner.courseCode }}
                  </div>
                  <div class="hero-learner__badges">
                    <div class="hero-learner__pill hero-learner__pill--status">
                      <q-icon name="person" size="18px" />
                      <span>{{ slide.learner.statusLabel }}</span>
                    </div>
                    <div class="hero-learner__pill hero-learner__pill--attendance">
                      <q-icon name="star" size="18px" />
                      <span>{{ slide.learner.attendanceRate }}% Attendance</span>
                    </div>
                  </div>
                  <div class="hero-learner__route">
                    <span
                      class="hero-learner__route-marker hero-learner__route-marker--start"
                    ></span>
                    <span class="hero-learner__route-flag">
                      <q-icon name="flag" size="16px" />
                    </span>
                  </div>
                </div>
                <div class="hero-learner__card">
                  <div class="hero-learner__level-badge">
                    <q-icon name="terrain" size="22px" />
                    <span>LEVEL {{ slide.learner.level }}</span>
                  </div>
                  <div class="hero-learner__card-top">
                    <div class="hero-learner__avatar-stage">
                      <span class="hero-learner__compass hero-learner__compass--north">N</span>
                      <span class="hero-learner__compass hero-learner__compass--west">W</span>
                      <span class="hero-learner__compass hero-learner__compass--east">E</span>
                      <div class="hero-learner__avatar-orbit">
                        <q-avatar
                          size="140px"
                          class="hero-learner__avatar hero-learner__avatar--featured"
                        >
                          <img :src="slide.learner.avatarUrl" :alt="slide.learner.name" />
                        </q-avatar>
                      </div>
                      <span class="hero-learner__compass hero-learner__compass--south">
                        <q-icon name="explore" size="20px" />
                      </span>
                    </div>
                    <div class="hero-learner__metrics">
                      <div class="hero-learner__metric hero-learner__metric--streak">
                        <div class="hero-learner__metric-icon-wrap">
                          <q-icon name="local_fire_department" size="22px" />
                        </div>
                        <div class="hero-learner__metric-value">
                          {{ slide.learner.streakDays }} วัน
                        </div>
                        <div class="hero-learner__metric-label">STREAK</div>
                      </div>
                      <div class="hero-learner__metric hero-learner__metric--xp">
                        <div class="hero-learner__metric-icon-wrap">
                          <q-icon name="shield" size="22px" />
                        </div>
                        <div class="hero-learner__metric-value">
                          {{ formatHeroXp(slide.learner.xp) }} XP
                        </div>
                        <div class="hero-learner__metric-label">
                          LEVEL {{ slide.learner.level }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="hero-learner__progress">
                    <div class="hero-learner__progress-head">
                      <span>ความคืบหน้าการเรียน</span>
                      <strong
                        >{{ slide.learner.completedLessons }}/{{
                          slide.learner.totalLessons
                        }}
                        บทเรียน</strong
                      >
                    </div>
                    <div class="hero-learner__progress-track">
                      <div
                        class="hero-learner__progress-fill"
                        :style="{
                          width: `${Math.round((slide.learner.completedLessons / slide.learner.totalLessons) * 100)}%`,
                        }"
                      ></div>
                      <span
                        class="hero-learner__progress-pin"
                        :style="{
                          left: `${Math.round((slide.learner.completedLessons / slide.learner.totalLessons) * 100)}%`,
                        }"
                      >
                        <q-icon name="flag" size="18px" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </q-carousel-slide>
        </q-carousel>
        <GoldenUnderline />
      </section>

      <!-- ─── FLOATING STATS BAR ─── -->
      <section class="stats-floating-section">
        <HomeInfoStrip
          :items="stats"
          variant="stat"
          col-class="col-12 col-sm-6 col-lg-3"
          card-class="home-info-card home-info-card--stat"
        />
      </section>
    </template>

    <!-- ─── INFO CARDS ───────────────────────────────────────── -->
    <section v-if="!courseStore.selectedCategory" class="info-strip-section q-pt-lg q-pb-lg">
      <HomeInfoStrip
        :items="infoCards"
        variant="feature"
        col-class="col-12 col-md-4"
        card-class="home-info-card home-info-card--info"
      />
    </section>

    <!-- ─── MARQUEE ─── -->
    <div v-if="!courseStore.selectedCategory" class="section-container q-pb-md">
      <HomeMarquee />
    </div>

    <section
      v-if="!courseStore.selectedCategory"
      class="top-courses-section q-py-xl"
      aria-labelledby="top-courses-heading"
    >
      <div class="section-container">
        <div
          v-motion
          :initial="headingRevealVariant().initial"
          :visible-once="headingRevealVariant().visibleOnce"
          class="top-courses-header"
        >
          <div class="top-courses-header__copy">
            <span class="top-courses-kicker">
              <q-icon name="leaderboard" size="18px" />
              Top 10
            </span>
            <h2 id="top-courses-heading">{{ t('topCourses.heading') }}</h2>
          </div>
        </div>

        <div v-if="isTopCoursesLoading" class="top-courses-loading">
          <q-skeleton v-for="item in 5" :key="item" type="rect" class="top-course-skeleton" />
        </div>

        <div v-else-if="topCoursesError" class="top-courses-empty">
          <q-icon name="cloud_off" size="2.4rem" />
          <span>{{ topCoursesError }}</span>
          <q-btn
            flat
            no-caps
            color="primary"
            :label="t('retry')"
            icon="refresh"
            @click="fetchTopEnrolledCourses"
          />
        </div>

        <div v-else-if="selectedTopCourse" class="top-course-preview">
          <div class="top-course-preview__media">
            <img
              :src="getPreferredCourseImageUrl(selectedTopCourse.imageUrl)"
              :alt="selectedTopCourse.title"
            />
            <span class="top-course-preview__rank">
              #{{ selectedTopCourse.topEnrollmentRank ?? getTopCourseRank(selectedTopCourse) }}
            </span>
          </div>
          <div class="top-course-preview__content">
            <div class="top-course-preview__eyebrow">
              <q-icon name="leaderboard" size="18px" />
              {{ t('topCourses.rank') }}
              {{ selectedTopCourse.topEnrollmentRank ?? getTopCourseRank(selectedTopCourse) }}
            </div>
            <h3>
              {{
                locale === 'th'
                  ? selectedTopCourse.title
                  : selectedTopCourse.titleEn || selectedTopCourse.title
              }}
            </h3>
            <p>
              {{
                locale === 'th'
                  ? selectedTopCourse.faculty
                  : selectedTopCourse.facultyEn || selectedTopCourse.faculty
              }}
            </p>
            <div class="top-course-preview__facts">
              <span>
                <q-icon name="groups" size="17px" />
                {{ formatLearnerCount(selectedTopCourse.enrolledCount) }}
              </span>
              <span>
                <q-icon name="payments" size="17px" />
                {{ formatTopCoursePrice(selectedTopCourse) }}
              </span>
              <span v-if="selectedTopCourse.totalHours">
                <q-icon name="schedule" size="17px" />
                {{ selectedTopCourse.totalHours }} {{ t('topCourses.hours') }}
              </span>
              <span>
                <q-icon name="event_available" size="17px" />
                {{ t('topCourses.until') }}
                {{
                  locale === 'th'
                    ? selectedTopCourse.registrationEnd
                    : selectedTopCourse.registrationEndEn || selectedTopCourse.registrationEnd
                }}
              </span>
            </div>
            <div class="top-course-preview__modes">
              <span v-for="mode in selectedTopCourse.deliveryModes" :key="mode">
                {{ mode }}
              </span>
            </div>
            <div class="top-course-preview__actions">
              <q-btn
                unelevated
                no-caps
                color="primary"
                icon-right="chevron_right"
                :label="t('topCourses.viewMore')"
                :href="resolveFullUrl(`/course/${selectedTopCourse.id}`)"
                @click.prevent="onCourseClick(selectedTopCourse, $event)"
              />
              <q-btn
                flat
                no-caps
                color="secondary"
                icon="apps"
                :label="t('topCourses.backToList')"
                @click="showTopCourseList"
              />
            </div>
          </div>
        </div>

        <div
          v-else-if="topEnrolledCourses.length > 0"
          class="top-courses-rail"
          @wheel="onTopCoursesWheel"
        >
          <a
            v-for="course in topEnrolledCourses"
            :key="course.id"
            :href="resolveFullUrl(`/course/${course.id}`)"
            class="top-course-card"
            style="text-decoration: none"
            @click.prevent="selectTopCourse(course, $event)"
          >
            <span class="top-course-card__poster">
              <img :src="getPreferredCourseImageUrl(course.imageUrl)" :alt="course.title" />
              <span class="top-course-card__shade" />
              <span class="top-course-card__badge">
                <q-icon name="groups" size="16px" />
                {{ formatLearnerCount(course.enrolledCount) }}
              </span>
            </span>
            <span class="top-course-card__body">
              <span class="top-course-card__title">{{
                locale === 'th' ? course.title : course.titleEn || course.title
              }}</span>
              <span class="top-course-card__meta">{{
                locale === 'th' ? course.faculty : course.facultyEn || course.faculty
              }}</span>
            </span>
          </a>
        </div>

        <div v-else class="top-courses-empty">
          <q-icon name="leaderboard" size="2.4rem" />
          <span>{{ t('topCourses.noData') }}</span>
        </div>
      </div>
    </section>

    <!-- ─── ACTIVE COURSES ─── -->
    <section class="courses-section courses-section--active q-py-xl">
      <div class="section-container">
        <div class="course-section-panel">
          <!-- Category Header (inside panel) -->
          <div
            v-if="courseStore.selectedCategory"
            class="course-section-panel__header row items-center justify-between q-mb-lg"
          >
            <h2 class="section-title-underline">
              {{ getTranslatedCategory(courseStore.selectedCategory) }}
            </h2>
          </div>

          <!-- Default Header -->
          <div
            v-if="!courseStore.selectedCategory"
            v-motion
            :initial="headingRevealVariant().initial"
            :visible-once="headingRevealVariant().visibleOnce"
            class="course-section-panel__header row items-center justify-between q-mb-lg"
          >
            <h2 class="section-title-underline">
              {{ $t('activeCoursesTitle') }}
            </h2>
            <q-btn
              flat
              no-caps
              :label="$t('viewAll')"
              color="primary"
              icon-right="chevron_right"
              tag="a"
              :href="resolveFullUrl('/short-courses?availability=open')"
              @click="onViewActiveCoursesClick"
            />
          </div>

          <div v-if="isLoading || isCategoryLoading" class="row justify-center q-py-xl">
            <BaseSpinner />
          </div>

          <div v-else-if="error" class="column items-center q-py-xl text-grey-5">
            <q-icon name="cloud_off" size="3rem" class="q-mb-md" />
            <div class="text-body1">{{ error }}</div>
            <q-btn
              flat
              no-caps
              :label="$t('retry')"
              color="primary"
              class="q-mt-md"
              @click="fetchCourses"
            />
          </div>

          <div v-else v-auto-animate class="row q-col-gutter-lg">
            <div
              v-for="course in displayedActiveCourses"
              :key="course.id"
              v-motion
              :initial="revealVariant(0).initial"
              :visible-once="revealVariant(0).visibleOnce"
              class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
            >
              <BaseCourseCard
                :course="course"
                :href="resolveFullUrl(`/course/${course.id}`)"
                @click="onCourseClick"
              />
            </div>
          </div>

          <div
            v-if="filteredActiveCourses.length === 0 && !isLoading"
            class="column items-center q-py-xl text-grey-5"
          >
            <q-icon name="sentiment_dissatisfied" size="3rem" class="q-mb-md" />
            <div class="text-body1">{{ $t('noCoursesFound') }}</div>
            <q-btn
              flat
              no-caps
              :label="$t('showAll')"
              color="primary"
              class="q-mt-md"
              @click="courseStore.setSelectedCategory(null)"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── ALL COURSES (Hide if category selected) ─── -->
    <section
      v-if="!courseStore.selectedCategory"
      class="courses-section courses-section--all q-py-xl"
    >
      <div class="section-container">
        <div class="course-section-panel">
          <div
            v-motion
            :initial="headingRevealVariant().initial"
            :visible-once="headingRevealVariant().visibleOnce"
            class="course-section-panel__header row items-center justify-between q-mb-lg"
          >
            <h2 class="section-title-underline">
              {{ $t('allCoursesTitle') }}
            </h2>
            <q-btn
              flat
              no-caps
              :label="$t('viewAll')"
              color="primary"
              icon-right="chevron_right"
              tag="a"
              :href="resolveFullUrl('/short-courses')"
              @click="onViewAllCoursesClick"
            />
          </div>

          <div v-if="isLoading || isCategoryLoading" class="row justify-center q-py-xl">
            <BaseSpinner />
          </div>

          <div v-else v-auto-animate class="row q-col-gutter-lg">
            <div
              v-for="course in displayedAllCourses"
              :key="course.id"
              v-motion
              :initial="revealVariant(0).initial"
              :visible-once="revealVariant(0).visibleOnce"
              class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
            >
              <BaseCourseCard
                :course="course"
                :href="resolveFullUrl(`/course/${course.id}`)"
                @click="onCourseClick"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { revealVariant, headingRevealVariant } from 'src/composables/use-scroll-reveal';
import HomeInfoStrip, { type HomeInfoItem } from 'src/components/home/HomeInfoStrip.vue';
import HomeMarquee from 'src/components/home/HomeMarquee.vue';
import { useCourseStore } from 'src/stores/course-store';
import { useCategoryStore } from 'src/stores/category-store';
import {
  useSystemImageStore,
  type HeroSlideTemplate,
  type HeroTextLine,
  type HeroTextSegment,
} from 'src/stores/system-image-store';
import { useCourseList } from 'src/composables/use-course-list';
import { useLearnerProgress } from 'src/composables/use-learner-progress';
import { useAuthStore } from 'src/stores/auth-store';
import { formatPriceLabel } from 'src/utils/course-format';
import type { Course } from 'src/types/course';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import { useQuasar } from 'quasar';
import learnerHeroBackgroundUrl from 'src/assets/bb.png';
import fallbackCourseImageUrl from 'src/assets/homepicture1.png';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const { learnerProgress } = useLearnerProgress();
const categoryStore = useCategoryStore();
const systemImageStore = useSystemImageStore();
const $q = useQuasar();
const { t, locale } = useI18n({ useScope: 'global' });
categoryStore.init();
void systemImageStore.init();

const heroSlide = ref(systemImageStore.activeHeroSlides[0]?.id ?? '');

interface LearnerHeroPeer {
  id: string;
  name: string;
  avatarUrl: string;
}

interface LearnerHeroSlide {
  id: string;
  name: string;
  faculty: string;
  courseTitle: string;
  courseCode: string;
  courseImageUrl: string;
  imageUrl: string;
  backgroundPosition: string;
  avatarUrl: string;
  attendanceRate: number;
  statusLabel: string;
  statusNote: string;
  streakDays: number;
  xp: number;
  level: number;
  completedLessons: number;
  totalLessons: number;
  peers: LearnerHeroPeer[];
}

type HomeHeroSlide =
  | {
      kind: 'template';
      id: string;
      imageUrl: string;
      backgroundPosition: string;
      template: HeroSlideTemplate;
    }
  | {
      kind: 'learner';
      id: string;
      imageUrl: string;
      backgroundPosition: string;
      learner: LearnerHeroSlide;
    };

const { courses, isLoading, error, activeCourses, fetchCourses } = useCourseList();

const isCategoryLoading = ref(false);
const isTopCoursesLoading = ref(false);
const topCoursesError = ref<string | null>(null);
const selectedTopCourse = ref<Course | null>(null);
const heroTypedCharCounts = ref<number[]>([]);
const heroTypingLineIndex = ref(-1);
const isHeroTypingComplete = ref(false);
let heroTypingTimer: ReturnType<typeof setTimeout> | null = null;
let heroSlideTimer: number | null = null;
const categoryMap: Record<string, string> = {
  ภาษาและการสื่อสาร: 'langComm',
  สุขภาพและการแพทย์: 'healthMed',
  การศึกษาและการฝึกอบรม: 'eduTrain',
  อาหารและโภชนาการ: 'foodNutri',
  วิศวกรรมและสถาปัตยกรรม: 'engArch',
  'สังคม การเมืองการปกครอง': 'socPol',
  คณิตศาสตร์และวิทยาศาสตร์: 'mathSci',
  คอมพิวเตอร์และเทคโนโลยี: 'compTech',
  ทักษะชีวิตและการพัฒนาตนเอง: 'lifeSkills',
  ธุรกิจและการบริหารจัดการ: 'busMgmt',
  ศิลปวัฒนธรรมและศาสนา: 'artCult',
  เกษตรและสิ่งแวดล้อม: 'agriEnv',
};
function getPreferredCourseImageUrl(imageUrl?: string | null): string {
  return imageUrl?.trim() ? imageUrl : fallbackCourseImageUrl;
}

function formatLearnerCount(value?: number | null): string {
  const num = new Intl.NumberFormat(locale.value === 'th' ? 'th-TH' : 'en-US').format(value ?? 0);
  return `${num} ${t('topCourses.enrolled')}`;
}

function formatTopCoursePrice(course: Course): string {
  return formatPriceLabel(course, locale.value === 'th' ? 'th' : 'en');
}

function getTopCourseRank(course: Course): number {
  const courseIndex = topEnrolledCourses.value.findIndex((candidate) => candidate.id === course.id);
  return courseIndex >= 0 ? courseIndex + 1 : 1;
}

function selectTopCourse(course: Course, event?: Event): void {
  if (event && isNewTabClick(event)) return;
  selectedTopCourse.value = course;
}

function showTopCourseList(): void {
  selectedTopCourse.value = null;
}

function onTopCoursesWheel(event: WheelEvent): void {
  const rail = event.currentTarget;
  if (!(rail instanceof HTMLElement) || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
    return;
  }

  const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
  if (maxScrollLeft <= 0) {
    return;
  }

  const isAtStart = rail.scrollLeft <= 0;
  const isAtEnd = rail.scrollLeft >= maxScrollLeft - 1;
  if ((event.deltaY < 0 && isAtStart) || (event.deltaY > 0 && isAtEnd)) {
    return;
  }

  event.preventDefault();
  rail.scrollBy({ left: event.deltaY, behavior: 'smooth' });
}

async function fetchTopEnrolledCourses(): Promise<void> {
  isTopCoursesLoading.value = true;
  topCoursesError.value = null;
  try {
    await courseStore.fetchTopEnrolledCourses();
  } catch {
    topCoursesError.value = t('topCourses.loadError');
  } finally {
    isTopCoursesLoading.value = false;
  }
}

function createHeroAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

watch(
  () => courseStore.selectedCategory,
  () => {
    isCategoryLoading.value = true;
    setTimeout(() => {
      isCategoryLoading.value = false;
    }, 800);
  },
);

watch(heroSlide, () => {
  if (currentHeroTypeLines.value.length > 0) {
    startHeroTyping();
  } else {
    stopHeroTyping();
  }
});

const filteredActiveCourses = computed(() => {
  return activeCourses.value.filter((c) => {
    if (!courseStore.selectedCategory) return true;
    return c.category === courseStore.selectedCategory;
  });
});

// Limit display to 2 rows based on screen size
const maxHomeItems = computed(() => {
  if ($q.screen.lt.sm) return 2; // xs: 1 col → 2 items
  if ($q.screen.lt.md) return 4; // sm: 2 cols → 4 items
  if ($q.screen.lt.lg) return 6; // md: 3 cols → 6 items (2 rows)
  return 8; // lg+: 4 cols → 8 items (2 rows)
});

const displayedActiveCourses = computed(() => {
  return filteredActiveCourses.value.slice(0, maxHomeItems.value);
});

const displayedAllCourses = computed(() => {
  return courses.value.slice(0, maxHomeItems.value);
});

const topEnrolledCourses = computed(() => courseStore.topEnrolledCourses.slice(0, 10));

const stats = computed<HomeInfoItem[]>(() => [
  {
    numericValue: 500,
    valueSuffix: '+',
    label: t('homePage.stats.onlineCourses'),
    description: t('homePage.stats.onlineCoursesSub'),
    icon: 'menu_book',
    tone: 'gold',
  },
  {
    numericValue: 50000,
    valueSuffix: '+',
    valueCommas: true,
    label: t('homePage.stats.learners'),
    description: t('homePage.stats.learnersSub'),
    icon: 'group',
    tone: 'blue',
  },
  {
    numericValue: 200,
    valueSuffix: '+',
    label: t('homePage.stats.instructors'),
    description: t('homePage.stats.instructorsSub'),
    icon: 'school',
    tone: 'positive',
  },
  {
    numericValue: 100,
    valueSuffix: '%',
    label: t('homePage.stats.certified'),
    description: t('homePage.stats.certifiedSub'),
    icon: 'verified_user',
    tone: 'accent',
  },
]);

const infoCards = computed<HomeInfoItem[]>(() => [
  {
    icon: 'schedule',
    label: t('homePage.features.anytime.title'),
    description: t('homePage.features.anytime.desc'),
    tone: 'gold',
  },
  {
    icon: 'emoji_objects',
    label: t('homePage.features.researcher.title'),
    description: t('homePage.features.researcher.desc'),
    tone: 'blue',
  },
  {
    icon: 'menu_book',
    label: t('homePage.features.popular.title'),
    description: t('homePage.features.popular.desc'),
    tone: 'positive',
  },
]);

const activeHeroSlides = computed(() => systemImageStore.activeHeroSlides);

// Show only logged-in student's profile on HERO section
const learnerHeroSlides = computed<LearnerHeroSlide[]>(() => {
  // Only show learner spotlight if user is logged in and is a student role
  if (!authStore.isLoggedIn || !authStore.user || authStore.user.role !== 'student') {
    return [];
  }

  const user = authStore.user;
  const progress = learnerProgress.value;

  // Get the primary active course for the student
  const primaryCourse = activeCourses.value[0] ??
    courses.value[0] ?? {
      title: 'เส้นทางการเรียนรู้ดิจิทัล',
      code: 'BUU-LLL-001',
      imageUrl: fallbackCourseImageUrl,
    };

  const courseImageUrl = getPreferredCourseImageUrl(primaryCourse?.imageUrl);
  const fullName = `${user.firstNameTh} ${user.lastNameTh}`.trim() || user.firstNameTh;

  return [
    {
      id: 'learner-spotlight-current',
      name: fullName,
      faculty: user.faculty,
      courseTitle: primaryCourse?.title ?? 'เส้นทางการเรียนรู้ดิจิทัล',
      courseCode: primaryCourse?.code ?? 'BUU-LLL-001',
      courseImageUrl,
      imageUrl: learnerHeroBackgroundUrl,
      backgroundPosition: 'center 56%',
      avatarUrl: user.avatar || createHeroAvatar(user.email),
      attendanceRate: 92,
      statusLabel: 'ผู้เรียนที่ใช้งาน',
      statusNote: `กำลังศึกษา ${primaryCourse?.title ?? 'คอร์สปัจจุบัน'}`,
      streakDays: progress?.streakDays ?? 5,
      xp: progress?.xp ?? 1250,
      level: progress?.level ?? 7,
      completedLessons: 18,
      totalLessons: 20,
      peers: [], // Show no peers to keep focus on current user
    },
  ];
});
const homeHeroSlides = computed<HomeHeroSlide[]>(() => {
  const templateSlides: HomeHeroSlide[] = activeHeroSlides.value.map((slide) => ({
    kind: 'template',
    id: slide.id,
    imageUrl: slide.imageUrl,
    backgroundPosition: slide.backgroundPosition,
    template: slide,
  }));

  const learnerSlides: HomeHeroSlide[] = learnerHeroSlides.value.map((slide) => ({
    kind: 'learner',
    id: slide.id,
    imageUrl: slide.imageUrl,
    backgroundPosition: slide.backgroundPosition,
    learner: slide,
  }));

  // Merge template slides with learner profile (keep carousel rotation)
  if (learnerSlides.length === 0) {
    return templateSlides;
  }

  const mergedSlides: HomeHeroSlide[] = [];
  templateSlides.forEach((slide, index) => {
    mergedSlides.push(slide);
    if (learnerSlides[index]) {
      mergedSlides.push(learnerSlides[index]);
    }
  });

  if (learnerSlides.length > templateSlides.length) {
    mergedSlides.push(...learnerSlides.slice(templateSlides.length));
  }

  return mergedSlides;
});
const heroSlideDurationMs = computed(() =>
  Math.max(systemImageStore.heroConfig.slideDurationMs, 10000),
);
const currentHeroSlide = computed<HeroSlideTemplate | null>(() => {
  const activeSlide =
    homeHeroSlides.value.find((slide) => slide.id === heroSlide.value) ?? homeHeroSlides.value[0];
  if (!activeSlide || activeSlide.kind !== 'template') {
    return null;
  }

  return activeSlide.template;
});
const currentHeroTypeLines = computed<HeroTextLine[]>(() =>
  currentHeroSlide.value ? getEnabledHeroLines(currentHeroSlide.value) : [],
);

watch(
  homeHeroSlides,
  (slides) => {
    if (!slides.some((slide) => slide.id === heroSlide.value)) {
      heroSlide.value = slides[0]?.id ?? '';
    }
    restartHeroSlideTimer();
  },
  { immediate: true },
);

watch(
  () => JSON.stringify(currentHeroTypeLines.value),
  () => {
    if (currentHeroTypeLines.value.length > 0) {
      startHeroTyping();
      return;
    }

    stopHeroTyping();
  },
);

watch(heroSlideDurationMs, () => {
  if (currentHeroTypeLines.value.length > 0) {
    startHeroTyping();
  }
  restartHeroSlideTimer();
});

function clearHeroSlideTimer(): void {
  if (heroSlideTimer) {
    window.clearInterval(heroSlideTimer);
    heroSlideTimer = null;
  }
}

function restartHeroSlideTimer(): void {
  clearHeroSlideTimer();

  const slides = homeHeroSlides.value;

  if (slides.length < 2) {
    return;
  }

  heroSlideTimer = window.setInterval(() => {
    const currentIndex = slides.findIndex((slide) => slide.id === heroSlide.value);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % slides.length : 0;
    heroSlide.value = slides[nextIndex]?.id ?? slides[0]?.id ?? '';
  }, heroSlideDurationMs.value);
}

function clearHeroTypingTimer(): void {
  if (heroTypingTimer) {
    clearTimeout(heroTypingTimer);
    heroTypingTimer = null;
  }
}

function stopHeroTyping(): void {
  clearHeroTypingTimer();
  heroTypingLineIndex.value = -1;
  heroTypedCharCounts.value = [];
  isHeroTypingComplete.value = false;
}

function startHeroTyping(): void {
  clearHeroTypingTimer();
  const lineCount = currentHeroTypeLines.value.length;
  heroTypedCharCounts.value = Array.from({ length: lineCount }, () => 0);
  heroTypingLineIndex.value = -1;
  isHeroTypingComplete.value = lineCount === 0;

  if (lineCount === 0) {
    return;
  }

  heroTypingTimer = setTimeout(() => {
    playHeroLine(0);
  }, systemImageStore.heroConfig.initialDelayMs);
}

type IntlSegmenterConstructor = new (
  locale?: string,
  options?: { granularity?: 'grapheme' },
) => {
  segment(input: string): Iterable<{ segment: string }>;
};

function getHeroTextSegments(text: string): string[] {
  const Segmenter = (Intl as typeof Intl & { Segmenter?: IntlSegmenterConstructor }).Segmenter;
  if (!Segmenter) {
    return Array.from(text);
  }

  return Array.from(
    new Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
    (part) => part.segment,
  );
}

function playHeroLine(lineIndex: number): void {
  const lines = currentHeroTypeLines.value;
  const currentLine = lines[lineIndex];

  if (lineIndex >= lines.length || currentLine === undefined) {
    heroTypingLineIndex.value = lines.length - 1;
    isHeroTypingComplete.value = true;
    heroTypingTimer = null;
    return;
  }

  heroTypingLineIndex.value = lineIndex;

  if (currentLine.effect === 'typewriter') {
    typeHeroLine(lineIndex, 0);
    return;
  }

  heroTypedCharCounts.value[lineIndex] = getHeroLineCharacterLength(currentLine);
  const effectDuration = currentLine.effect === 'none' ? 0 : currentLine.durationMs;
  heroTypingTimer = setTimeout(() => {
    playHeroLine(lineIndex + 1);
  }, effectDuration + currentLine.gapMs);
}

function typeHeroLine(lineIndex: number, characterIndex: number): void {
  const lines = currentHeroTypeLines.value;
  const currentLine = lines[lineIndex];

  if (lineIndex >= lines.length || currentLine === undefined) {
    playHeroLine(lineIndex);
    return;
  }

  const totalCharacters = getHeroLineCharacterLength(currentLine);
  const duration = currentLine.durationMs;
  const interval = Math.max(Math.round(duration / Math.max(totalCharacters, 1)), 24);

  if (characterIndex < totalCharacters) {
    heroTypedCharCounts.value[lineIndex] = characterIndex + 1;
    heroTypingTimer = setTimeout(() => {
      typeHeroLine(lineIndex, characterIndex + 1);
    }, interval);
    return;
  }

  heroTypingTimer = setTimeout(() => {
    playHeroLine(lineIndex + 1);
  }, currentLine.gapMs);
}

function isHeroLineVisible(lineIndex: number): boolean {
  return (
    isHeroTypingComplete.value ||
    heroTypingLineIndex.value >= lineIndex ||
    (heroTypedCharCounts.value[lineIndex] ?? 0) > 0
  );
}

function shouldShowHeroCaret(lineIndex: number): boolean {
  if (!currentHeroSlide.value?.textBlock.enabled) {
    return false;
  }

  const line = currentHeroTypeLines.value[lineIndex];
  return (
    !isHeroTypingComplete.value &&
    line?.effect === 'typewriter' &&
    heroTypingLineIndex.value === lineIndex
  );
}

function getEnabledHeroLines(slide: HeroSlideTemplate): HeroTextLine[] {
  return slide.textBlock.lines.filter(
    (line) => line.enabled && line.segments.some((segment) => segment.text.length > 0),
  );
}

function getHeroLineCharacterLength(line: HeroTextLine): number {
  return line.segments.reduce(
    (total, segment) => total + getHeroTextSegments(segment.text).length,
    0,
  );
}

function getVisibleHeroSegments(line: HeroTextLine, lineIndex: number): HeroTextSegment[] {
  if (!isHeroLineVisible(lineIndex)) {
    return [];
  }

  if (line.effect !== 'typewriter') {
    return line.segments;
  }

  let remainingCharacters = heroTypedCharCounts.value[lineIndex] ?? 0;

  if (isHeroTypingComplete.value || heroTypingLineIndex.value > lineIndex) {
    remainingCharacters = getHeroLineCharacterLength(line);
  }

  return line.segments
    .map((segment) => {
      if (remainingCharacters <= 0) {
        return {
          ...segment,
          text: '',
        };
      }

      const segmentCharacters = getHeroTextSegments(segment.text);
      const visibleCharacters = segmentCharacters.slice(0, remainingCharacters);
      remainingCharacters -= visibleCharacters.length;

      return {
        ...segment,
        text: visibleCharacters.join(''),
      };
    })
    .filter((segment) => segment.text.length > 0);
}

function getHeroTextBlockStyle(slide: HeroSlideTemplate): CSSProperties {
  const block = slide.textBlock;

  return {
    left: `${block.xPercent}%`,
    top: `${block.yPercent}%`,
    width: `${block.widthPercent}%`,
    gap: `${block.gapPx}px`,
    textAlign: block.textAlign,
    background: block.backgroundEnabled ? block.backgroundColor : 'transparent',
    paddingTop: `${block.paddingTopPx}px`,
    paddingRight: `${block.paddingRightPx}px`,
    paddingBottom: `${block.paddingBottomPx}px`,
    paddingLeft: `${block.paddingLeftPx}px`,
    borderRadius: `${block.borderRadiusPx}px`,
  };
}

function getHeroSlideStyle(slide: HomeHeroSlide): CSSProperties {
  return {
    backgroundImage: `url("${slide.imageUrl}")`,
    backgroundPosition: slide.backgroundPosition,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
  };
}

function formatHeroXp(value: number): string {
  return value.toLocaleString('en-US');
}

function formatHeroCourseTitle(value: string): string {
  const escaped = value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

  return escaped.replace(/python/gi, '<span class="hero-learner__course-highlight">$&</span>');
}

function getHeroLineStyle(line: HeroTextLine): CSSProperties {
  return {
    fontFamily: line.fontFamily,
    fontSize: `${line.fontSizePx}px`,
    fontWeight: line.fontWeight,
    lineHeight: line.lineHeight,
    letterSpacing: line.letterSpacing,
    '--hero-line-duration': `${line.durationMs}ms`,
  };
}

function getHeroLineEffectClass(line: HeroTextLine): string {
  return `hero-type-line--effect-${line.effect}`;
}

function getHeroLineCaretColor(line: HeroTextLine): string {
  return line.segments.find((segment) => segment.color)?.color ?? '#1a237e';
}

function getTranslatedCategory(category: string | null): string {
  if (!category) {
    return '';
  }

  const matchedCategory = categoryStore.findByName(category);
  if (matchedCategory) {
    const categoryKey = categoryMap[matchedCategory.name];
    if (categoryKey) {
      return t(categoryKey);
    }

    if (locale.value !== 'th' && matchedCategory.nameEn?.trim()) {
      return matchedCategory.nameEn;
    }

    return matchedCategory.name;
  }

  const categoryKey = categoryMap[category];
  return categoryKey ? t(categoryKey) : category;
}

function onCourseClick(course: Course, event?: Event): void {
  if (event && isNewTabClick(event)) {
    return; // Let browser natively open href in a new tab
  }
  void router.push(`/course/${course.id}`);
}

function onViewActiveCoursesClick(event: Event): void {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push('/short-courses?availability=open');
}

function onViewAllCoursesClick(event: Event): void {
  if (isNewTabClick(event)) return;
  event.preventDefault();
  void router.push('/short-courses');
}

onMounted(() => {
  void fetchCourses();
  void fetchTopEnrolledCourses();
  startHeroTyping();
  restartHeroSlideTimer();
});

onBeforeUnmount(() => {
  clearHeroTypingTimer();
  clearHeroSlideTimer();
});
</script>

<style lang="scss" scoped>
// ── Entrance Animations ───────────────────────────────────────
@keyframes premiumEntrance {
  0% {
    opacity: 0;
    transform: translateY(40px) rotateX(-12deg) scale(0.92);
    filter: blur(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0) scale(1);
    filter: blur(0);
  }
}

.entrance-animate {
  opacity: 0;
  perspective: 1000px;
  backface-visibility: hidden;
  animation: premiumEntrance 1s cubic-bezier(0.2, 0.9, 0.3, 1) forwards;
  animation-delay: var(--delay, 0s);
}

.home-page {
  position: relative;
}

.stats-floating-section,
.info-strip-section,
.courses-section,
.section-container {
  position: relative;
}

// ── Category Header ──────────────────────────────────────────
.category-header-section {
  background: transparent;
  border-bottom: 0;
}

// ── Hero ──────────────────────────────────────────────────────
.hero-section {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 1920 / 600;
  overflow: hidden;
  background: #111827;
}

.hero-carousel {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.hero-copy {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.hero-copy__content {
  position: absolute;
  display: grid;
  max-width: calc(100% - 48px);
  transform: translateZ(0);
}

.hero-slide__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.hero-slide__overlay--learner {
  background: linear-gradient(
    90deg,
    rgba(255, 250, 238, 0.88) 0%,
    rgba(255, 248, 232, 0.52) 42%,
    rgba(255, 249, 240, 0.72) 100%
  );
}

.hero-learner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 500px);
  align-items: center;
  gap: clamp(18px, 2vw, 28px);
  height: 100%;
  padding: clamp(22px, 3vw, 40px) clamp(20px, 4vw, 64px);
  overflow: hidden;
}

.hero-learner::before,
.hero-learner::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

.hero-learner::before {
  right: -12px;
  top: -6px;
  width: 220px;
  height: 220px;
  border-radius: 999px;
  background:
    radial-gradient(
      circle at center,
      transparent 54%,
      rgba(245, 166, 35, 0.14) 54.8%,
      transparent 56%
    ),
    radial-gradient(
      circle at center,
      transparent 67%,
      rgba(245, 166, 35, 0.1) 67.8%,
      transparent 69%
    ),
    radial-gradient(
      circle at center,
      transparent 80%,
      rgba(245, 166, 35, 0.08) 80.8%,
      transparent 82%
    );
  opacity: 0.86;
}

.hero-learner::after {
  left: 40%;
  bottom: 20px;
  width: 220px;
  height: 120px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(245, 166, 35, 0.18) 0%, transparent 72%);
  filter: blur(16px);
  opacity: 0.8;
}
.hero-learner__copy {
  position: relative;
  align-self: center;
  max-width: 560px;
  margin-left: clamp(24px, 3vw, 56px);
  color: #1f2937;
  padding: 8px 0 32px clamp(34px, 2.6vw, 48px);
}
.hero-learner__copy::before {
  content: '';
  position: absolute;
  left: -16px;
  top: -12px;
  width: 48px;
  height: 48px;
  background-image: radial-gradient(circle, rgba(245, 166, 35, 0.92) 0 2px, transparent 2.8px);
  background-size: 16px 16px;
  opacity: 0.9;
}
.hero-learner__copy::after {
  content: '';
  position: absolute;
  left: 0;
  right: 8%;
  bottom: 0;
  height: 132px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 248, 230, 0.88) 100%),
    radial-gradient(circle at 18% 96%, rgba(245, 166, 35, 0.22), transparent 28%),
    radial-gradient(circle at 72% 82%, rgba(245, 166, 35, 0.16), transparent 24%);
  clip-path: polygon(
    0 100%,
    0 78%,
    12% 62%,
    22% 74%,
    36% 44%,
    49% 72%,
    61% 38%,
    74% 68%,
    88% 32%,
    100% 66%,
    100% 100%
  );
  opacity: 0.92;
  pointer-events: none;
}
.hero-learner__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(245, 166, 35, 0.72);
  box-shadow: 0 14px 30px rgba(245, 166, 35, 0.12);
  color: #5c4300;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.hero-learner__copy h2 {
  margin: 20px 0 10px;
  color: #1f2937;
  font-size: clamp(2.8rem, 4.2vw, 4.35rem);
  line-height: 0.98;
  font-weight: 900;
  text-shadow: 0 10px 24px rgba(255, 255, 255, 0.4);
}
.hero-learner__title-accent {
  width: 72px;
  height: 8px;
  margin-bottom: 24px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    #f3b400 0 78%,
    rgba(243, 180, 0, 0.7) 78% 88%,
    transparent 88%
  );
  box-shadow: 0 10px 18px rgba(243, 180, 0, 0.18);
}
.hero-learner__summary {
  margin: 0;
  max-width: 15ch;
  color: #566273;
  font-size: clamp(1rem, 1.16vw, 1.2rem);
  line-height: 1.42;
  font-weight: 500;
}

.hero-learner__course-title {
  max-width: min(48vw, 720px);
  margin-top: 10px;
  color: #1f2937;
  font-size: clamp(1.18rem, 1.55vw, 1.72rem);
  line-height: 1.18;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero-learner__course-title :deep(.hero-learner__course-highlight) {
  color: #f2a900;
}
.hero-learner__course-line {
  margin-top: 14px;
  color: #7a8593;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.hero-learner__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}
.hero-learner__pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid rgba(245, 166, 35, 0.26);
  background: rgba(255, 255, 255, 0.88);
  color: #4a5b00;
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 12px 28px rgba(245, 166, 35, 0.08);
}
.hero-learner__pill--status {
  color: #5d7f1d;
}
.hero-learner__pill--attendance {
  color: #f0a300;
}
.hero-learner__route {
  position: relative;
  width: min(420px, 88%);
  height: 64px;
  margin-top: 22px;
  border-bottom: 3px dashed #f4b400;
  border-radius: 50% 50% 38% 42%;
  opacity: 0.96;
}

.hero-learner__route::after {
  content: '';
  position: absolute;
  inset: auto 20% -10px 18%;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(245, 166, 35, 0.42) 0 2px, transparent 2.6px);
  background-size: 22px 10px;
  opacity: 0.72;
}
.hero-learner__route-marker,
.hero-learner__route-flag {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 999px;
}
.hero-learner__route-marker--start {
  left: 18px;
  bottom: -12px;
  width: 28px;
  height: 28px;
  background: #ffffff;
  border: 4px solid #f4b400;
  box-shadow: 0 10px 22px rgba(245, 166, 35, 0.18);
}
.hero-learner__route-flag {
  right: 60px;
  top: -12px;
  width: 30px;
  height: 30px;
  color: #f4b400;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(245, 166, 35, 0.16);
  animation: heroLearnerFlagFloat 3.4s ease-in-out infinite;
}
.hero-learner__card {
  position: relative;
  justify-self: end;
  align-self: center;
  width: min(100%, 500px);
  transform: translateY(-48px);
  padding: 20px 18px 16px;
  border-radius: 26px;
  background:
    radial-gradient(circle at 92% 18%, rgba(245, 166, 35, 0.1), transparent 22%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0) 28%),
    radial-gradient(circle at 18% 14%, rgba(245, 166, 35, 0.16), transparent 22%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 251, 240, 0.96));
  border: 1px solid rgba(245, 166, 35, 0.14);
  box-shadow:
    0 28px 54px rgba(15, 23, 42, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.94);
  overflow: hidden;
}
.hero-learner__card::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 22px;
  border: 1px solid rgba(245, 166, 35, 0.18);
  background: radial-gradient(
    circle at 14px 14px,
    rgba(245, 166, 35, 0.1) 0 1.4px,
    transparent 2px
  );
  background-size: 18px 18px;
  opacity: 0.55;
  pointer-events: none;
}
.hero-learner__card::after {
  content: '';
  position: absolute;
  right: -42px;
  bottom: -20px;
  width: 130px;
  height: 88px;
  border-radius: 0 0 24px 24px;
  background:
    radial-gradient(circle at 16px 16px, rgba(245, 166, 35, 0.24) 0 2px, transparent 2.8px),
    linear-gradient(180deg, rgba(255, 250, 235, 0.9), rgba(255, 244, 210, 0.9));
  background-size:
    20px 20px,
    auto;
  border: 1px solid rgba(245, 166, 35, 0.22);
  box-shadow: 0 16px 30px rgba(245, 166, 35, 0.14);
  clip-path: polygon(
    12% 100%,
    0 36%,
    24% 56%,
    32% 30%,
    48% 46%,
    58% 24%,
    72% 44%,
    84% 18%,
    100% 38%,
    100% 100%
  );
  opacity: 0.95;
}
.hero-learner__level-badge {
  position: absolute;
  top: 0;
  right: 16px;
  z-index: 4;
  display: grid;
  justify-items: center;
  gap: 6px;
  width: 76px;
  padding: 9px 7px 10px;
  background: linear-gradient(180deg, #ffc331 0%, #d89a00 100%);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1;
  clip-path: polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%);
  box-shadow: 0 18px 34px rgba(216, 154, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.34);
}

.hero-learner__level-badge span {
  display: block;
  white-space: nowrap;
}
.hero-learner__card-top {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) minmax(96px, 0.76fr);
  gap: 12px;
  align-items: center;
}
.hero-learner__avatar-stage {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 178px;
}
.hero-learner__avatar-stage::before,
.hero-learner__avatar-stage::after {
  content: '';
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
}
.hero-learner__avatar-stage::before {
  width: 164px;
  height: 164px;
  background:
    radial-gradient(
      circle,
      transparent 0 59%,
      rgba(255, 248, 221, 0.92) 59.5% 67%,
      transparent 67.5%
    ),
    conic-gradient(
      from 200deg,
      rgba(245, 166, 35, 0.95),
      rgba(255, 210, 92, 0.78),
      rgba(245, 166, 35, 0.95)
    );
  box-shadow:
    inset 0 0 0 16px rgba(255, 255, 255, 0.72),
    0 18px 36px rgba(245, 166, 35, 0.14);
}
.hero-learner__avatar-stage::after {
  width: 194px;
  height: 194px;
  border: 2px dashed rgba(245, 166, 35, 0.36);
  animation: heroLearnerCompassSpin 24s linear infinite;
}
.hero-learner__avatar-orbit {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 126px;
  height: 126px;
  border-radius: 999px;
  background: radial-gradient(circle, #fffdf4 0%, #ffeeb0 100%);
  box-shadow:
    inset 0 0 0 10px rgba(255, 255, 255, 0.92),
    0 20px 40px rgba(245, 166, 35, 0.18);
}
.hero-learner__avatar {
  outline: 5px solid rgba(255, 255, 255, 0.92);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
}
.hero-learner__avatar--featured {
  outline: 7px solid rgba(255, 255, 255, 0.98);
  width: 96px !important;
  height: 96px !important;
}
.hero-learner__compass {
  position: absolute;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #ffbe1b;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 900;
  box-shadow: 0 12px 24px rgba(245, 166, 35, 0.18);
  animation: heroLearnerCompassPulse 4s ease-in-out infinite;
}
.hero-learner__compass--north {
  top: 12px;
}
.hero-learner__compass--west {
  left: 6px;
}
.hero-learner__compass--east {
  right: 6px;
}
.hero-learner__compass--south {
  bottom: 6px;
  background: #ffffff;
  color: #d29a00;
  border: 3px solid #d29a00;
}
.hero-learner__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.hero-learner__metric {
  position: relative;
  min-height: 98px;
  padding: 13px 10px 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 249, 235, 0.96));
  border: 1px solid rgba(245, 166, 35, 0.2);
  box-shadow: 0 16px 30px rgba(245, 166, 35, 0.08);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  text-align: center;
  overflow: hidden;
}

.hero-learner__metric--streak::before,
.hero-learner__metric--xp::before {
  content: '';
  position: absolute;
  top: 18px;
  right: 18px;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.2);
  box-shadow:
    -18px 10px 0 -3px rgba(245, 166, 35, 0.16),
    -8px 22px 0 -5px rgba(245, 166, 35, 0.12);
}
.hero-learner__metric::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 34px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 236, 176, 0.55));
  clip-path: polygon(
    0 100%,
    0 72%,
    12% 84%,
    28% 52%,
    46% 74%,
    63% 44%,
    82% 78%,
    100% 62%,
    100% 100%
  );
}
.hero-learner__metric-icon-wrap {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 2px solid rgba(245, 166, 35, 0.28);
  color: #f4aa00;
  background: rgba(255, 255, 255, 0.92);
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
}
.hero-learner__metric-value {
  position: relative;
  z-index: 1;
  display: block;
  max-width: 6.5ch;
  color: #1f2937;
  font-size: clamp(0.98rem, 1.08vw, 1.28rem);
  font-weight: 900;
  line-height: 1.08;
  text-wrap: balance;
}
.hero-learner__metric-label {
  position: relative;
  z-index: 1;
  color: #7c8490;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.1;
  text-transform: uppercase;
}
.hero-learner__progress {
  position: relative;
  margin-top: 12px;
  padding: 14px 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(245, 166, 35, 0.16);
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
}
.hero-learner__progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
  color: #1f2937;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
}
.hero-learner__progress-head span {
  color: #1f2937;
  min-width: 0;
}
.hero-learner__progress-head strong {
  color: #162033;
  font-size: clamp(0.92rem, 1.08vw, 1.12rem);
  line-height: 1.1;
  white-space: nowrap;
}
.hero-learner__progress-track {
  position: relative;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff4dc, #fff9ef);
  border: 1px solid rgba(245, 166, 35, 0.16);
  overflow: visible;
}

.hero-learner__progress-track::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 18px;
  width: 96px;
  height: 8px;
  transform: translateY(-50%);
  background: radial-gradient(circle, rgba(212, 154, 0, 0.26) 0 2px, transparent 2.6px);
  background-size: 16px 8px;
  opacity: 0.7;
}
.hero-learner__progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ffbb00 0%, #f4a300 100%);
  box-shadow: 0 10px 18px rgba(245, 166, 35, 0.22);
}
.hero-learner__progress-pin {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -56%);
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #2f3d4e;
  color: #ffbe1b;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.16);
}

@keyframes heroLearnerCompassSpin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes heroLearnerCompassPulse {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes heroLearnerFlagFloat {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}
.hero-type-line {
  position: relative;
  display: inline-block;
  max-width: 100%;
  opacity: 0;
  transform: translateY(0);
  vertical-align: top;
  transition:
    opacity var(--hero-line-duration, 420ms) ease,
    transform var(--hero-line-duration, 420ms) cubic-bezier(0.2, 0.9, 0.2, 1);
  will-change: opacity, transform;
}

.hero-type-line__text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  vertical-align: top;
}

.hero-type-line--visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-type-line--effect-slide-up {
  transform: translateY(18px);
}

.hero-type-line--effect-slide-up.hero-type-line--visible {
  transform: translateY(0);
}

.hero-type-line--effect-typewriter {
  transition: none;
}

.hero-type-line--effect-none {
  transition: none;
}

.hero-type-caret {
  display: inline-block;
  width: 2px;
  height: 0.78em;
  margin-left: 0.05em;
  background: currentColor;
  vertical-align: -0.04em;
  animation: heroCaretBlink 0.75s step-end infinite;
}

.hero-carousel :deep(.q-carousel__slide) {
  background-position: center 54%;
  overflow: hidden;
}

.hero-carousel :deep(.hero-slide--catalog) {
  background-position: center 58%;
}

.hero-carousel :deep(.hero-slide--short-course) {
  background-position: center 60%;
}

.hero-carousel :deep(.hero-slide--flow) {
  background-position: center 57%;
}

.hero-carousel :deep(.hero-slide--classroom) {
  background-position: center 56%;
}

.hero-carousel :deep(.hero-slide--laptop) {
  background-position: center 57%;
}

.hero-pagination-wrapper {
  position: absolute;
  bottom: 40px; /* ลดความสูงลงมา ให้ไม่บังภาพเยอะไป */
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none;
}

.hero-pagination {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px; /* ทรง Pill เหมือนปุ่มเปลี่ยนภาษา */
  background: rgba(248, 250, 252, 0.82);
  border: 1px solid rgba(226, 232, 240, 0.86);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
  pointer-events: auto;
  transition: all 0.22s ease;

  &:hover {
    border-color: rgba($primary, 0.42);
    background: rgba(248, 250, 252, 0.92);
    box-shadow: 0 10px 24px rgba(17, 24, 39, 0.09);
  }

  &:active {
    transform: none;
  }
}

.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  background: #cbd5e1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    background: #94a3b8;
  }

  &:active {
    transform: translateY(-1px);
  }
}

.hero-dot.is-active {
  width: 36px;
  background: rgba($primary, 0.15);

  &:hover {
    transform: translateY(-4px);
  }
}

.dot-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background: $primary;
  border-radius: 8px;
  animation: slideProgress var(--hero-slide-duration) linear forwards;
}

@keyframes slideProgress {
  0% {
    width: 0;
    opacity: 1;
  }
  95% {
    width: 100%;
    opacity: 1;
  }
  100% {
    width: 100%;
    opacity: 0.8;
  }
}

@keyframes heroCaretBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes statsBounceIn {
  0% {
    opacity: 0;
    transform: translateY(60px) scale(0.5);
  }
  50% {
    opacity: 1;
    transform: translateY(-12px) scale(1.1);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes flameFlicker {
  0% {
    opacity: 0;
    transform: scale(0) rotate(-360deg) translateY(20px);
  }
  60% {
    opacity: 1;
    transform: scale(1.3) rotate(20deg) translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg) translateY(0);
  }
}

// ── Stats Bar ─────────────────────────────────────────────────
.stats-floating-section {
  padding: 20px 0 18px;
  background: transparent;
}

.stats-floating-section__inner {
  position: relative;
  z-index: 30;
  margin-top: clamp(-52px, -4vw, -24px);
}

.stats-grid {
  &--animated {
    .stats-item {
      animation: statsBounceIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
      animation-delay: var(--stats-delay, 0s);

      :deep(.q-icon) {
        animation: flameFlicker 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        animation-delay: var(--stats-delay, 0s);
      }
    }
  }
}

.stats-item {
  opacity: 1;
}

.home-info-card {
  height: 100%;
}

.stats-grid :deep(.base-info-card) {
  min-height: 92px;
}

.stats-grid :deep(.base-info-card__value) {
  font-size: 1.58rem;
  line-height: 1.1;
}

.stats-grid :deep(.base-info-card__title),
.info-grid :deep(.base-info-card__title) {
  font-weight: 800;
}

.stats-grid :deep(.base-info-card__description),
.info-grid :deep(.base-info-card__description) {
  display: block;
  font-size: 0.78rem;
}

.info-grid :deep(.base-info-card) {
  min-height: 98px;
}

// ── Info Cards ────────────────────────────────────────────────
.info-strip-section {
  background: transparent;
}

.info-grid :deep(.base-info-card__title) {
  font-size: 1.02rem;
}

// ── Course Sections ───────────────────────────────────────────
.top-courses-section {
  background: transparent;
  color: $secondary;
  overflow: hidden;
}

.top-courses-section .section-container {
  padding: clamp(18px, 2.4vw, 30px);
  border: 1px solid rgba($primary, 0.1);
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(255, 250, 238, 0.96) 0%, rgba(255, 255, 255, 0.98) 42%), #ffffff;
  box-shadow:
    0 0 0 1px rgba($primary, 0.04),
    0 10px 28px rgba(17, 24, 39, 0.04);
}

.top-courses-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.top-courses-header__copy {
  min-width: 0;
}

.top-courses-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: $primary;
  font-size: 0.86rem;
  font-weight: 900;
  text-transform: uppercase;
}

.top-courses-header h2 {
  margin: 0;
  color: $secondary;
  font-size: clamp(1.55rem, 2.6vw, 2.35rem);
  font-weight: 900;
  line-height: 1.1;
}

.top-courses-rail,
.top-courses-loading {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(260px, 330px);
  gap: 18px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 2px 18px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  scrollbar-color: rgba($primary, 0.72) rgba($primary, 0.12);
}

.top-courses-rail::-webkit-scrollbar,
.top-courses-loading::-webkit-scrollbar {
  height: 8px;
}

.top-courses-rail::-webkit-scrollbar-track,
.top-courses-loading::-webkit-scrollbar-track {
  background: rgba($primary, 0.12);
  border-radius: 999px;
}

.top-courses-rail::-webkit-scrollbar-thumb,
.top-courses-loading::-webkit-scrollbar-thumb {
  background: $primary;
  border-radius: 999px;
}

.top-course-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(168px, 1fr) auto;
  gap: 0;
  min-height: 248px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  scroll-snap-align: start;
  text-align: left;
  transform-origin: center;
  transition:
    transform 0.22s ease,
    filter 0.22s ease;
}

.top-course-card:hover,
.top-course-card:focus-visible {
  transform: translateY(-6px) scale(1.02);
  filter: drop-shadow(0 18px 26px rgba(245, 166, 35, 0.18));
  outline: none;
}

.top-course-card__poster {
  position: relative;
  z-index: 1;
  display: block;
  min-width: 0;
  min-height: 168px;
  overflow: hidden;
  border-radius: 8px;
  background: #26364d;
  box-shadow:
    0 16px 34px rgba(17, 24, 39, 0.1),
    0 0 0 1px rgba($primary, 0.12);
}

.top-course-card__poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.32s ease;
}

.top-course-card:hover .top-course-card__poster img,
.top-course-card:focus-visible .top-course-card__poster img {
  transform: scale(1.08);
}

.top-course-card__shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 42%, rgba(38, 54, 77, 0.74) 100%);
}

.top-course-card__badge {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: calc(100% - 20px);
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba($primary, 0.94);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}

.top-course-card__body {
  display: grid;
  gap: 5px;
  padding-top: 11px;
  min-width: 0;
}

.top-course-card__title,
.top-course-card__meta {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
}

.top-course-card__title {
  color: $secondary;
  font-size: 0.98rem;
  font-weight: 900;
  line-height: 1.28;
  line-clamp: 2;
}

.top-course-card__meta {
  color: rgba($secondary, 0.66);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.25;
  line-clamp: 1;
}

.top-course-preview {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: clamp(18px, 2.6vw, 30px);
  align-items: stretch;
  padding: clamp(16px, 2vw, 22px);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba($primary, 0.12);
  box-shadow: inset 0 0 0 1px rgba($primary, 0.04);
}

.top-course-preview__media {
  position: relative;
  min-height: 220px;
  overflow: hidden;
  border-radius: 8px;
  background: #26364d;
  box-shadow:
    0 16px 34px rgba(17, 24, 39, 0.12),
    0 0 0 1px rgba($primary, 0.14);
}

.top-course-preview__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.top-course-preview__rank {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba($primary, 0.94);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1;
}

.top-course-preview__content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.top-course-preview__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  margin-bottom: 10px;
  color: $primary;
  font-size: 0.88rem;
  font-weight: 900;
}

.top-course-preview__content h3 {
  margin: 0;
  color: $secondary;
  font-size: clamp(1.35rem, 2.2vw, 2rem);
  font-weight: 900;
  line-height: 1.18;
}

.top-course-preview__content p {
  margin: 9px 0 0;
  color: rgba($secondary, 0.68);
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
}

.top-course-preview__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.top-course-preview__facts span,
.top-course-preview__modes span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 34px;
  padding: 8px 11px;
  border-radius: 999px;
  background: rgba($primary, 0.1);
  color: $secondary;
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.1;
}

.top-course-preview__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.top-course-preview__modes span {
  background: rgba($secondary, 0.08);
}

.top-course-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.top-courses-empty {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  color: rgba($secondary, 0.66);
  text-align: center;
}

.top-course-skeleton {
  height: 220px;
  border-radius: 8px;
  background: rgba($primary, 0.12);
}

.courses-section {
  padding: 16px 0 28px;
  background: transparent;

  .section-title-underline {
    color: $secondary;
  }
}

.section-title-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.section-title-icon {
  display: inline-grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  color: $primary;
  background: #fff4d6;
  box-shadow: inset 0 0 0 1px rgba($primary, 0.16);
  font-size: 22px;
}

.section-title-icon--secondary {
  color: $secondary;
  background: #e8eaf6;
  box-shadow: inset 0 0 0 1px rgba($secondary, 0.14);
}

.courses-section--active {
  padding-top: 22px;
  background: transparent;
}

.courses-section--all {
  background: transparent;
}

.course-section-panel {
  padding: clamp(18px, 2.4vw, 30px);
  border: 1px solid rgba($primary, 0.1);
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 0 0 1px rgba($primary, 0.04),
    0 10px 28px rgba(17, 24, 39, 0.04);
}

.course-section-panel__header {
  padding-bottom: 16px;
  border-bottom: 1px solid rgba($primary, 0.08);
}

.course-section-panel__header + .row {
  padding-top: 4px;
}

@media (max-width: 1199px) {
  .hero-section {
    height: auto;
    aspect-ratio: 16 / 6.2;
  }

  .hero-learner {
    grid-template-columns: minmax(0, 1fr) minmax(260px, 420px);
    gap: 16px;
    padding: 22px 24px 28px;
  }

  .hero-learner__copy {
    max-width: 100%;
    margin-left: clamp(12px, 2vw, 24px);
    padding-bottom: 20px;
    padding-left: 24px;
  }

  .hero-learner__card {
    width: min(100%, 420px);
    transform: translateY(0);
  }
}

@media (max-width: 767px) {
  .hero-section {
    min-height: 0;
    height: auto;
  }

  .hero-learner {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
    height: auto;
    padding: 20px 16px 28px;
  }

  .hero-learner::before {
    right: -40px;
    top: 10px;
    width: 160px;
    height: 160px;
    opacity: 0.45;
  }

  .hero-learner::after {
    left: 50%;
    bottom: 12px;
    width: 160px;
    height: 72px;
    transform: translateX(-50%);
  }

  .hero-learner__copy {
    max-width: 100%;
    margin-left: 0;
    padding: 0;
  }

  .hero-learner__copy::before,
  .hero-learner__copy::after {
    display: none;
  }

  .hero-learner__eyebrow {
    gap: 8px;
    padding: 10px 18px;
    font-size: 0.76rem;
  }

  .hero-learner__copy h2 {
    margin: 18px 0 10px;
    font-size: clamp(2.35rem, 12vw, 3.5rem);
    line-height: 1;
  }

  .hero-learner__title-accent {
    width: 58px;
    height: 6px;
    margin-bottom: 18px;
  }

  .hero-learner__summary,
  .hero-learner__course-title {
    max-width: none;
  }

  .hero-learner__summary {
    font-size: 1rem;
  }

  .hero-learner__course-title {
    max-width: 100%;
    font-size: clamp(1.05rem, 4.6vw, 1.5rem);
  }

  .hero-learner__course-line {
    font-size: 0.78rem;
  }

  .hero-learner__badges {
    gap: 10px;
    margin-top: 16px;
  }

  .hero-learner__pill {
    min-height: 42px;
    padding: 0 14px;
    font-size: 0.8rem;
  }

  .hero-learner__route {
    width: min(280px, 82%);
    height: 42px;
    margin-top: 14px;
  }

  .hero-learner__route::after {
    display: none;
  }

  .hero-learner__route-marker--start {
    width: 20px;
    height: 20px;
    bottom: -8px;
    border-width: 3px;
  }

  .hero-learner__route-flag {
    right: 36px;
    top: -10px;
    width: 24px;
    height: 24px;
  }

  .hero-learner__card {
    justify-self: stretch;
    width: 100%;
    max-width: 100%;
    transform: none;
    padding: 20px 16px 16px;
    border-radius: 22px;
  }

  .hero-learner__card::before {
    inset: 10px;
    border-radius: 18px;
  }

  .hero-learner__card::after {
    display: none;
  }

  .hero-learner__level-badge {
    right: 12px;
    width: 72px;
    padding: 9px 6px 10px;
    font-size: 0.68rem;
    gap: 5px;
  }

  .hero-learner__card-top {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .hero-learner__avatar-stage {
    min-height: 168px;
  }

  .hero-learner__avatar-stage::before {
    width: 142px;
    height: 142px;
    box-shadow: inset 0 0 0 10px rgba(255, 245, 211, 0.84);
  }

  .hero-learner__avatar-stage::after {
    width: 168px;
    height: 168px;
  }

  .hero-learner__avatar-orbit {
    width: 118px;
    height: 118px;
    box-shadow:
      inset 0 0 0 8px rgba(255, 255, 255, 0.92),
      0 16px 28px rgba(245, 166, 35, 0.14);
  }

  .hero-learner__avatar--featured {
    width: 92px !important;
    height: 92px !important;
    outline-width: 5px;
  }

  .hero-learner__compass {
    width: 28px;
    height: 28px;
    font-size: 0.76rem;
  }

  .hero-learner__compass--north {
    top: 8px;
  }

  .hero-learner__compass--west {
    left: 10px;
  }

  .hero-learner__compass--east {
    right: 10px;
  }

  .hero-learner__compass--south {
    bottom: 10px;
    border-width: 2px;
  }

  .hero-learner__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .hero-learner__metric {
    min-height: 98px;
    padding: 14px 10px 13px;
    border-radius: 16px;
    gap: 6px;
  }

  .hero-learner__metric::after {
    height: 28px;
  }

  .hero-learner__metric-icon-wrap {
    width: 40px;
    height: 40px;
  }

  .hero-learner__metric-value {
    max-width: 7ch;
    font-size: 0.98rem;
    line-height: 1.1;
  }

  .hero-learner__metric-label {
    font-size: 0.72rem;
    line-height: 1.1;
  }

  .hero-learner__progress {
    margin-top: 12px;
    padding: 14px 14px 16px;
    border-radius: 18px;
  }

  .hero-learner__progress-head {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    margin-bottom: 12px;
    font-size: 0.86rem;
  }

  .hero-learner__progress-head strong {
    font-size: 1rem;
    white-space: normal;
  }

  .hero-learner__progress-track {
    height: 18px;
  }

  .hero-learner__progress-track::after {
    width: 64px;
  }

  .hero-learner__progress-pin {
    width: 24px;
    height: 24px;
  }

  .hero-type-line {
    max-width: none;
    opacity: 0;
  }

  .hero-type-line__text {
    max-width: none;
    white-space: normal;
  }

  .hero-carousel :deep(.q-carousel__slide) {
    background-position: 64% 58%;
  }

  .hero-carousel :deep(.hero-slide--short-course) {
    background-position: 36% 60%;
  }

  .stats-grid :deep(.base-info-card__value) {
    font-size: 1.4rem;
  }

  .stats-floating-section__inner {
    margin-top: 14px;
  }

  .course-section-panel {
    padding: 18px;
  }

  .course-section-panel__header {
    gap: 12px;
  }

  .top-courses-header {
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .top-courses-rail,
  .top-courses-loading {
    grid-auto-columns: minmax(226px, 78vw);
    gap: 14px;
  }

  .top-course-card {
    min-height: 218px;
  }

  .top-course-card__poster {
    min-height: 148px;
  }

  .top-course-preview {
    grid-template-columns: minmax(0, 1fr);
    padding: 14px;
  }

  .top-course-preview__media {
    min-height: 180px;
  }

  .top-course-preview__content h3 {
    font-size: 1.24rem;
  }

  .top-course-preview__actions {
    flex-direction: column;
  }

  .top-course-preview__actions .q-btn {
    width: 100%;
  }
}

.skeleton-card {
  border-radius: 14px !important;
}
</style>
