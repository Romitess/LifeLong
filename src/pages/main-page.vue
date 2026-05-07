<template>
  <q-page class="home-page">
    <!-- ─── HERO ─── -->
    <template v-if="!courseStore.selectedCategory">
      <section
        class="hero-section"
        :style="{ '--hero-slide-duration': `${HERO_SLIDE_DURATION_MS}ms` }"
      >
        <q-carousel
          v-model="heroSlide"
          animated
          infinite
          :autoplay="HERO_SLIDE_DURATION_MS"
          transition-prev="fade"
          transition-next="fade"
          transition-duration="1000"
          class="hero-carousel"
        >
          <q-carousel-slide
            :name="1"
            img-src="~assets/homepicture1.png"
            class="hero-slide hero-slide--short-course"
          >
            <div
              class="section-container hero-copy"
              :class="{ 'hero-copy--active': heroSlide === 1 }"
            >
              <div class="hero-copy__content">
                <div
                  class="hero-type-line hero-type-line--title hero-type-line--title-buu"
                  :class="{ 'hero-type-line--visible': isHeroLineVisible(0) }"
                >
                  <span class="hero-type-line__text"
                    ><span class="hero-title-buu__bu">{{ heroTypedBuuPrefix }}</span
                    ><span class="hero-title-buu__u">{{ heroTypedBuuSuffix }}</span
                    ><span v-if="shouldShowHeroCaret(0)" class="hero-type-caret"></span
                  ></span>
                </div>
                <div
                  class="hero-type-line hero-type-line--title hero-type-line--title-course"
                  :class="{ 'hero-type-line--visible': isHeroLineVisible(1) }"
                >
                  <span class="hero-type-line__text"
                    ><span v-text="heroTypedLines[1]"></span
                    ><span v-if="shouldShowHeroCaret(1)" class="hero-type-caret"></span
                  ></span>
                </div>
                <div
                  class="hero-type-line hero-type-line--body hero-type-line--body-1"
                  :class="{ 'hero-type-line--visible': isHeroLineVisible(2) }"
                >
                  <span class="hero-type-line__text"
                    ><span v-text="heroTypedLines[2]"></span
                    ><span v-if="shouldShowHeroCaret(2)" class="hero-type-caret"></span
                  ></span>
                </div>
                <div
                  class="hero-type-line hero-type-line--body hero-type-line--body-2 hero-type-line--persist-caret"
                  :class="{ 'hero-type-line--visible': isHeroLineVisible(3) }"
                >
                  <span class="hero-type-line__text"
                    ><span v-text="heroTypedLines[3]"></span
                    ><span v-if="shouldShowHeroCaret(3)" class="hero-type-caret"></span
                  ></span>
                </div>
              </div>
            </div>
          </q-carousel-slide>
          <q-carousel-slide
            :name="2"
            img-src="~assets/homepicture2.png"
            class="hero-slide hero-slide--catalog"
          />
        </q-carousel>
      </section>

      <!-- ─── FLOATING STATS BAR ─── -->
      <section class="stats-floating-section">
        <div class="section-container stats-floating-section__inner">
          <div class="row q-col-gutter-lg stats-grid">
            <div
              v-for="(item, index) in stats"
              :key="item.label"
              class="col-12 col-sm-6 col-lg-3 entrance-animate"
              :style="{ '--delay': `${index * 0.1}s` }"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCourseStore } from 'src/stores/course-store';
import { useCourseList } from 'src/composables/use-course-list';
import type { Course } from 'src/types/course';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import { useQuasar } from 'quasar';

const router = useRouter();
const courseStore = useCourseStore();
const $q = useQuasar();
const { t } = useI18n({ useScope: 'global' });
const heroSlide = ref(1);
const HERO_SLIDE_DURATION_MS = 12000;
const HERO_TYPING_INITIAL_DELAY_MS = 250;
const HERO_TYPING_DURATIONS_MS = [1300, 1300, 1450, 1300] as const;
const HERO_TYPING_LINE_GAPS_MS = [120, 120, 100, 0] as const;

interface HomeInfoItem {
  icon: string;
  label: string;
  description: string;
  value?: string;
  tone: 'gold' | 'blue' | 'positive' | 'accent';
}

const { courses, isLoading, error, activeCourses, fetchCourses } = useCourseList();

const isCategoryLoading = ref(false);
const heroTypedLines = ref(['', '', '', '']);
const heroTypingLineIndex = ref(0);
const isHeroTypingComplete = ref(false);
let heroTypingTimer: ReturnType<typeof setTimeout> | null = null;
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

watch(
  () => courseStore.selectedCategory,
  () => {
    isCategoryLoading.value = true;
    setTimeout(() => {
      isCategoryLoading.value = false;
    }, 800);
  },
);

watch(heroSlide, (value) => {
  if (value === 1) {
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

const heroCopy = computed(() => ({
  title: t('homePage.hero.title'),
  body1: t('homePage.hero.body1'),
  body2: t('homePage.hero.body2'),
}));

const heroTypeLines = computed(() => [
  'BUU',
  heroCopy.value.title,
  heroCopy.value.body1,
  heroCopy.value.body2,
]);
const heroTypedBuuPrefix = computed(() => heroTypedLines.value[0]?.slice(0, 2) ?? '');
const heroTypedBuuSuffix = computed(() => heroTypedLines.value[0]?.slice(2) ?? '');

watch(heroTypeLines, () => {
  if (heroSlide.value === 1) {
    startHeroTyping();
  }
});

function clearHeroTypingTimer(): void {
  if (heroTypingTimer) {
    clearTimeout(heroTypingTimer);
    heroTypingTimer = null;
  }
}

function stopHeroTyping(): void {
  clearHeroTypingTimer();
  isHeroTypingComplete.value = false;
}

function startHeroTyping(): void {
  clearHeroTypingTimer();
  heroTypedLines.value = ['', '', '', ''];
  heroTypingLineIndex.value = 0;
  isHeroTypingComplete.value = false;

  heroTypingTimer = setTimeout(() => {
    typeHeroLine(0, 0);
  }, HERO_TYPING_INITIAL_DELAY_MS);
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

function typeHeroLine(lineIndex: number, characterIndex: number): void {
  const lines = heroTypeLines.value;
  const currentLine = lines[lineIndex];

  if (lineIndex >= lines.length || currentLine === undefined) {
    heroTypingLineIndex.value = lines.length - 1;
    isHeroTypingComplete.value = true;
    heroTypingTimer = null;
    return;
  }

  heroTypingLineIndex.value = lineIndex;
  const segments = getHeroTextSegments(currentLine);
  const duration = HERO_TYPING_DURATIONS_MS[lineIndex] ?? 1300;
  const interval = Math.max(Math.round(duration / Math.max(segments.length, 1)), 24);

  if (characterIndex < segments.length) {
    heroTypedLines.value[lineIndex] = segments.slice(0, characterIndex + 1).join('');
    heroTypingTimer = setTimeout(() => {
      typeHeroLine(lineIndex, characterIndex + 1);
    }, interval);
    return;
  }

  heroTypingTimer = setTimeout(() => {
    typeHeroLine(lineIndex + 1, 0);
  }, HERO_TYPING_LINE_GAPS_MS[lineIndex] ?? 0);
}

function isHeroLineVisible(lineIndex: number): boolean {
  return (
    isHeroTypingComplete.value ||
    heroTypingLineIndex.value >= lineIndex ||
    (heroTypedLines.value[lineIndex]?.length ?? 0) > 0
  );
}

function shouldShowHeroCaret(lineIndex: number): boolean {
  if (heroSlide.value !== 1) {
    return false;
  }

  if (isHeroTypingComplete.value) {
    return lineIndex === heroTypeLines.value.length - 1;
  }

  return heroTypingLineIndex.value === lineIndex;
}

function getTranslatedCategory(category: string | null): string {
  if (!category) {
    return '';
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
});

onBeforeUnmount(clearHeroTypingTimer);
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

.hero-section::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: #f7d046;
  z-index: 3;
}

.hero-carousel {
  height: 100%;
  width: 100%;
}

.hero-copy {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
}

.hero-copy__content {
  display: grid;
  gap: 10px;
  width: min(58vw, 880px);
  max-width: min(58vw, 880px);
  padding-top: 24px;
}

.hero-type-line {
  position: relative;
  display: inline-block;
  max-width: 100%;
  opacity: 0;
  vertical-align: top;
  transition: opacity 0.12s ease;
}

.hero-type-line__text {
  display: inline-block;
  max-width: 100%;
  white-space: nowrap;
  vertical-align: top;
}

.hero-type-line--visible {
  opacity: 1;
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

.hero-type-line--title {
  font-weight: 800;
  letter-spacing: 0;
  line-height: 0.95;
}

.hero-type-line--title-buu {
  font-size: clamp(3.8rem, 7vw, 6.6rem);
}

.hero-title-buu__bu {
  color: #f7d046;
}

.hero-title-buu__u {
  color: #7c7c7c;
}

.hero-type-line--title-course {
  color: #1a237e;
  font-size: clamp(2.6rem, 5vw, 4.9rem);
}

.hero-type-line--body {
  color: #667085;
  font-size: clamp(1rem, 1.5vw, 1.35rem);
  font-weight: 500;
  line-height: 1.45;
}

.hero-type-line--body .hero-type-caret {
  height: 0.88em;
  vertical-align: -0.12em;
}

.hero-type-line--body-1 {
}

.hero-type-line--body-2 {
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

  .hero-copy {
    align-items: flex-end;
    padding-bottom: 88px;
  }

  .hero-copy__content {
    max-width: min(100%, 460px);
    gap: 8px;
    padding-top: 0;
  }

  .hero-type-line {
    max-width: none;
    opacity: 0;
  }

  .hero-type-line__text {
    max-width: none;
    white-space: normal;
  }

  .hero-type-line--title-buu {
    font-size: clamp(2.8rem, 12vw, 3.6rem);
  }

  .hero-type-line--title-course {
    font-size: clamp(2rem, 9vw, 2.8rem);
  }

  .hero-type-line--body {
    font-size: 0.96rem;
    line-height: 1.5;
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
