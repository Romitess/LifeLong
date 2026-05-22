<template>
  <q-page class="home-page">
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
                  <div class="hero-learner__eyebrow">Learner Spotlight</div>
                  <h2>{{ slide.learner.name }}</h2>
                  <p>
                    สถานะการเข้าเรียนเด่นในรายวิชา
                    <strong>{{ slide.learner.courseTitle }}</strong>
                  </p>
                  <div class="hero-learner__badges">
                    <q-badge rounded color="positive" text-color="white">
                      {{ slide.learner.statusLabel }}
                    </q-badge>
                    <q-badge rounded color="primary" text-color="white">
                      {{ slide.learner.attendanceRate }}% Attendance
                    </q-badge>
                  </div>
                </div>

                <div class="hero-learner__card">
                  <div class="hero-learner__card-top">
                    <q-avatar size="72px" class="hero-learner__avatar">
                      <img :src="slide.learner.avatarUrl" :alt="slide.learner.name" />
                    </q-avatar>

                    <div class="hero-learner__identity">
                      <div class="hero-learner__name">{{ slide.learner.name }}</div>
                      <div class="hero-learner__meta">
                        {{ slide.learner.faculty }} • {{ slide.learner.courseCode }}
                      </div>
                      <div class="hero-learner__status-note">{{ slide.learner.statusNote }}</div>
                    </div>

                    <img
                      class="hero-learner__course-image"
                      :src="slide.learner.courseImageUrl"
                      :alt="slide.learner.courseTitle"
                    />
                  </div>

                  <div class="hero-learner__metrics">
                    <div class="hero-learner__metric">
                      <q-icon name="local_fire_department" size="18px" color="deep-orange-6" />
                      <div>
                        <div class="hero-learner__metric-value">
                          {{ slide.learner.streakDays }} วัน
                        </div>
                        <div class="hero-learner__metric-label">streak</div>
                      </div>
                    </div>
                    <div class="hero-learner__metric">
                      <q-icon name="stars" size="18px" color="amber-8" />
                      <div>
                        <div class="hero-learner__metric-value">
                          {{ formatHeroXp(slide.learner.xp) }} XP
                        </div>
                        <div class="hero-learner__metric-label">
                          level {{ slide.learner.level }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="hero-learner__progress">
                    <div class="hero-learner__progress-head">
                      <span>ความคืบหน้าการเรียน</span>
                      <strong>
                        {{ slide.learner.completedLessons }}/{{ slide.learner.totalLessons }}
                        บทเรียน
                      </strong>
                    </div>
                    <q-linear-progress
                      rounded
                      size="10px"
                      color="positive"
                      track-color="grey-3"
                      :value="slide.learner.completedLessons / slide.learner.totalLessons"
                    />
                  </div>

                  <div class="hero-learner__peers">
                    <div class="hero-learner__peers-label">กำลังเรียนร่วมกับ</div>
                    <div class="hero-learner__peer-list">
                      <div
                        v-for="peer in slide.learner.peers"
                        :key="peer.id"
                        class="hero-learner__peer"
                      >
                        <q-avatar size="28px">
                          <img :src="peer.avatarUrl" :alt="peer.name" />
                        </q-avatar>
                        <span>{{ peer.name }}</span>
                      </div>
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
      <section
        ref="statsSection"
        class="stats-floating-section"
        :class="{ 'stats-floating-section--animated': isStatsVisible }"
      >
        <div class="section-container stats-floating-section__inner">
          <div class="row q-col-gutter-lg stats-grid">
            <div
              v-for="(item, index) in stats"
              :key="item.label"
              class="col-12 col-sm-6 col-lg-3"
              :style="{
                animation: isStatsVisible
                  ? `statsBounceIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both`
                  : 'none',
                animationDelay: isStatsVisible ? `${index * 0.15}s` : '0s',
              }"
            >
              <BaseInfoCard
                class="home-info-card home-info-card--stat"
                variant="stat"
                :tone="item.tone"
                :icon="item.icon"
                :title="item.label"
                :description="item.description"
                :value="item.value ?? ''"
              />
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ─── INFO CARDS ───────────────────────────────────────── -->
    <section v-if="!courseStore.selectedCategory" class="info-strip-section q-pt-lg q-pb-lg">
      <div class="section-container">
        <div class="row q-col-gutter-lg info-grid">
          <div
            v-for="(item, index) in infoCards"
            :key="item.label"
            class="col-12 col-md-4 entrance-animate"
            :style="{ '--delay': `${(index + stats.length) * 0.1}s` }"
          >
            <BaseInfoCard
              class="home-info-card home-info-card--info"
              :tone="item.tone"
              :icon="item.icon"
              :title="item.label"
              :description="item.description"
            />
          </div>
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
            <h2 class="section-title-underline section-title-with-icon">
              <span class="section-title-icon">
                <q-icon name="category" />
              </span>
              <span>{{ getTranslatedCategory(courseStore.selectedCategory) }}</span>
            </h2>
          </div>

          <!-- Default Header -->
          <div
            class="course-section-panel__header row items-center justify-between q-mb-lg"
            v-if="!courseStore.selectedCategory"
          >
            <h2 class="section-title-underline section-title-with-icon">
              <span class="section-title-icon">
                <q-icon name="local_fire_department" />
              </span>
              <span>{{ $t('activeCoursesTitle') }}</span>
            </h2>
            <q-btn
              flat
              no-caps
              :label="$t('viewAll')"
              color="primary"
              icon-right="chevron_right"
              @click="void router.push('/short-courses?availability=open')"
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

          <div v-else class="row q-col-gutter-lg">
            <div
              v-for="course in displayedActiveCourses"
              :key="course.id"
              class="col-xs-12 col-sm-6 col-md-3"
            >
              <BaseCourseCard :course="course" @click="onCourseClick" />
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
          <div class="course-section-panel__header row items-center justify-between q-mb-lg">
            <h2 class="section-title-underline section-title-with-icon">
              <span class="section-title-icon section-title-icon--secondary">
                <q-icon name="library_books" />
              </span>
              <span>{{ $t('allCoursesTitle') }}</span>
            </h2>
            <q-btn
              flat
              no-caps
              :label="$t('viewAll')"
              color="primary"
              icon-right="chevron_right"
              @click="void router.push('/short-courses')"
            />
          </div>

          <div v-if="isLoading || isCategoryLoading" class="row justify-center q-py-xl">
            <BaseSpinner />
          </div>

          <div v-else class="row q-col-gutter-lg">
            <div
              v-for="course in displayedAllCourses"
              :key="course.id"
              class="col-xs-12 col-sm-6 col-md-3"
            >
              <BaseCourseCard :course="course" @click="onCourseClick" />
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
import type { Course } from 'src/types/course';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import { useQuasar } from 'quasar';

const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const { learnerProgress } = useLearnerProgress();
const categoryStore = useCategoryStore();
const systemImageStore = useSystemImageStore();
const $q = useQuasar();
const { t, locale } = useI18n({ useScope: 'global' });
categoryStore.init();
systemImageStore.init();

const heroSlide = ref(systemImageStore.activeHeroSlides[0]?.id ?? '');
const statsSection = ref<HTMLElement | null>(null);
const isStatsVisible = ref(false);

interface HomeInfoItem {
  icon: string;
  label: string;
  description: string;
  value?: string;
  tone: 'gold' | 'blue' | 'positive' | 'accent';
}

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
const heroPublicBaseUrl = (
  import.meta.env.VITE_BACKEND_PUBLIC_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000'
)
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');

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
  if ($q.screen.lt.sm) return 2; // xs: 1 column -> 2 items
  if ($q.screen.lt.md) return 4; // sm: 2 columns -> 4 items
  return 8; // md+: 4 columns -> 8 items
});

const displayedActiveCourses = computed(() => {
  return filteredActiveCourses.value.slice(0, maxHomeItems.value);
});

const displayedAllCourses = computed(() => {
  return courses.value.slice(0, maxHomeItems.value);
});

const stats = computed<HomeInfoItem[]>(() => [
  {
    value: '500+',
    label: t('homePage.stats.onlineCourses'),
    description: t('homePage.stats.onlineCoursesSub'),
    icon: 'menu_book',
    tone: 'gold',
  },
  {
    value: '50,000+',
    label: t('homePage.stats.learners'),
    description: t('homePage.stats.learnersSub'),
    icon: 'group',
    tone: 'blue',
  },
  {
    value: '200+',
    label: t('homePage.stats.instructors'),
    description: t('homePage.stats.instructorsSub'),
    icon: 'school',
    tone: 'positive',
  },
  {
    value: '100%',
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
      imageUrl: `${heroPublicBaseUrl}/uploads/system/homepicture1.png`,
    };

  const fullName = `${user.firstNameTh} ${user.lastNameTh}`.trim() || user.firstNameTh;

  return [
    {
      id: 'learner-spotlight-current',
      name: fullName,
      faculty: user.faculty,
      courseTitle: primaryCourse?.title ?? 'เส้นทางการเรียนรู้ดิจิทัล',
      courseCode: primaryCourse?.code ?? 'BUU-LLL-001',
      courseImageUrl:
        primaryCourse?.imageUrl ?? `${heroPublicBaseUrl}/uploads/system/homepicture1.png`,
      imageUrl: primaryCourse?.imageUrl ?? `${heroPublicBaseUrl}/uploads/system/homepicture1.png`,
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
const heroSlideDurationMs = computed(() => systemImageStore.heroConfig.slideDurationMs);
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

function onCourseClick(course: Course): void {
  void router.push(`/course/${course.id}`);
}

onMounted(() => {
  void fetchCourses();
  startHeroTyping();
  restartHeroSlideTimer();

  // Intersection Observer for stats animation
  setTimeout(() => {
    if (statsSection.value) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isStatsVisible.value) {
              isStatsVisible.value = true;
              console.log('[Stats Animation] Triggered!');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -50px 0px' },
      );
      observer.observe(statsSection.value);
    }
  }, 100);
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
  overflow: hidden;
  background: #f8f6f1;
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
    rgba(15, 23, 42, 0.72) 0%,
    rgba(15, 23, 42, 0.18) 44%,
    rgba(15, 23, 42, 0.56) 100%
  );
}

.hero-learner {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 520px);
  align-items: end;
  gap: 28px;
  height: 100%;
  padding: clamp(28px, 4vw, 56px) clamp(28px, 4vw, 72px);
}

.hero-learner__copy {
  max-width: 560px;
  color: #ffffff;
  align-self: center;
}

.hero-learner__eyebrow {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-learner__copy h2 {
  margin: 18px 0 10px;
  font-size: clamp(2.4rem, 4vw, 4.2rem);
  line-height: 0.98;
  font-weight: 800;
}

.hero-learner__copy p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: clamp(1rem, 1.4vw, 1.24rem);
  line-height: 1.6;
}

.hero-learner__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.hero-learner__card {
  align-self: center;
  padding: 22px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(12px);
}

.hero-learner__card-top {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 92px;
  gap: 16px;
  align-items: center;
}

.hero-learner__avatar {
  outline: 4px solid rgba(255, 255, 255, 0.72);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
}

.hero-learner__identity {
  min-width: 0;
}

.hero-learner__name {
  color: #10213f;
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1.2;
}

.hero-learner__meta,
.hero-learner__status-note {
  color: #5f6b7a;
  font-size: 0.82rem;
  line-height: 1.45;
}

.hero-learner__status-note {
  margin-top: 6px;
}

.hero-learner__course-image {
  width: 92px;
  height: 92px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.12);
}

.hero-learner__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.hero-learner__metric {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  background: #f8fafc;
}

.hero-learner__metric-value {
  color: #10213f;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.1;
}

.hero-learner__metric-label {
  margin-top: 4px;
  color: #748092;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1;
  text-transform: uppercase;
}

.hero-learner__progress {
  margin-top: 18px;
  padding: 16px;
  border-radius: 18px;
  background: #f8fafc;
}

.hero-learner__progress-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  color: #5f6b7a;
  font-size: 0.8rem;
  font-weight: 700;
}

.hero-learner__progress-head strong {
  color: #10213f;
  font-weight: 800;
}

.hero-learner__peers {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.hero-learner__peers-label {
  color: #7a8698;
  font-size: 0.74rem;
  font-weight: 700;
}

.hero-learner__peer-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.hero-learner__peer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border-radius: 999px;
  background: #eef2f7;
  color: #405065;
  font-size: 0.72rem;
  font-weight: 700;
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
  padding: 0 0 18px;
  background: transparent;
}

.stats-floating-section__inner {
  position: relative;
  z-index: 30;
  margin-top: -52px;
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

@media (max-width: 767px) {
  .hero-section {
    aspect-ratio: 16 / 10;
  }

  .hero-learner {
    grid-template-columns: 1fr;
    align-items: end;
    gap: 16px;
    padding: 24px 18px;
  }

  .hero-learner__copy {
    max-width: 100%;
  }

  .hero-learner__copy h2 {
    font-size: 2rem;
  }

  .hero-learner__card {
    padding: 16px;
    border-radius: 20px;
  }

  .hero-learner__card-top {
    grid-template-columns: 56px minmax(0, 1fr);
  }

  .hero-learner__course-image {
    display: none;
  }

  .hero-learner__metrics {
    grid-template-columns: 1fr;
  }

  .hero-learner__peers {
    display: grid;
    justify-content: stretch;
  }

  .hero-learner__peer-list {
    justify-content: flex-start;
  }

  .hero-copy {
    padding: 0;
  }

  .hero-copy__content {
    left: 24px !important;
    top: auto !important;
    bottom: 84px;
    width: calc(100% - 48px) !important;
    max-width: 460px;
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
    margin-top: 16px;
  }

  .course-section-panel {
    padding: 18px;
  }

  .course-section-panel__header {
    gap: 12px;
  }
}

.skeleton-card {
  border-radius: 14px !important;
}
</style>
