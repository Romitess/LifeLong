<template>
  <q-page>
    <!-- ─── HERO ─── -->
    <template v-if="!courseStore.selectedCategory">
      <section class="hero-section">
        <q-carousel
          v-model="heroSlide"
          animated
          infinite
          :autoplay="8000"
          transition-prev="slide-right"
          transition-next="slide-left"
          transition-duration="1000"
          class="hero-carousel"
        >
          <q-carousel-slide :name="1" img-src="~assets/homepicture1.png" />
          <q-carousel-slide :name="2" img-src="~assets/homepicture2.png" />
        </q-carousel>

        <!-- Custom Pagination -->
        <div class="hero-pagination-wrapper">
          <div class="section-container">
            <div class="hero-pagination">
              <div
                v-for="n in 2"
                :key="n"
                class="hero-dot cursor-pointer"
                :class="{ 'is-active': heroSlide === n }"
                @click="heroSlide = n"
              >
                <div v-if="heroSlide === n" class="dot-progress"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── FLOATING STATS BAR ─── -->
      <section class="stats-floating-section">
        <div class="section-container stats-floating-section__inner">
          <BaseInfoStrip :items="stats" variant="stat" floating />
        </div>
      </section>
    </template>

    <!-- ─── CATEGORY HEADER (Visible when filtering) ─── -->
    <section v-if="courseStore.selectedCategory" class="category-header-section q-py-lg">
      <div class="section-container">
        <h1 class="text-h4 text-weight-bold text-blue-grey-9 q-mb-none">
          {{ getTranslatedCategory(courseStore.selectedCategory) }}
        </h1>
      </div>
    </section>

    <!-- ─── FEATURES BAR (Style synced with Stats) ─── -->
    <section v-if="!courseStore.selectedCategory" class="feature-strip-section q-pt-lg q-pb-lg">
      <div class="section-container">
        <BaseInfoStrip :items="featureStrip" variant="feature" />
      </div>
    </section>

    <!-- ─── ACTIVE COURSES ─── -->
    <section class="courses-section q-py-xl">
      <div class="section-container">
        <div class="row items-center justify-between q-mb-lg" v-if="!courseStore.selectedCategory">
          <h2 class="section-title-underline">{{ $t('activeCoursesTitle') }}</h2>
          <q-btn
            flat
            no-caps
            :label="$t('viewAll')"
            color="primary"
            icon-right="chevron_right"
            @click="void router.push('/short-courses?active=true')"
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
            v-for="course in filteredActiveCourses"
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
    </section>

    <!-- ─── ALL COURSES (Hide if category selected) ─── -->
    <section v-if="!courseStore.selectedCategory" class="courses-section q-py-xl">
      <div class="section-container">
        <div class="row items-center justify-between q-mb-lg">
          <h2 class="section-title-underline">{{ $t('allCoursesTitle') }}</h2>
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
          <div v-for="course in courses" :key="course.id" class="col-xs-12 col-sm-6 col-md-3">
            <BaseCourseCard :course="course" @click="onCourseClick" />
          </div>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCourseStore } from 'src/stores/course-store';
import { useCourseList } from 'src/composables/use-course-list';
import type { Course } from 'src/types/course';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BaseInfoStrip from 'components/base/BaseInfoStrip.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';

const router = useRouter();
const courseStore = useCourseStore();
const { t } = useI18n({ useScope: 'global' });
const heroSlide = ref(1);

interface HomeInfoItem {
  icon: string;
  label: string;
  description: string;
  value?: string;
  color: string;
  iconBg: string;
}

const { courses, isLoading, error, activeCourses, fetchCourses } = useCourseList();

const isCategoryLoading = ref(false);
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
    }, 400);
  },
);

const filteredActiveCourses = computed(() => {
  if (!courseStore.selectedCategory) return activeCourses.value;
  return courses.value.filter((c) => c.category === courseStore.selectedCategory);
});

const stats = computed<HomeInfoItem[]>(() => [
  {
    value: '500+',
    label: t('homePage.stats.onlineCourses'),
    description: t('homePage.stats.onlineCoursesSub'),
    icon: 'menu_book',
    color: '#f5a623',
    iconBg: '#FFF4D6',
  },
  {
    value: '50,000+',
    label: t('homePage.stats.learners'),
    description: t('homePage.stats.learnersSub'),
    icon: 'group',
    color: '#1A237E',
    iconBg: '#E8EAF6',
  },
  {
    value: '200+',
    label: t('homePage.stats.instructors'),
    description: t('homePage.stats.instructorsSub'),
    icon: 'school',
    color: '#f5a623',
    iconBg: '#FFF4D6',
  },
  {
    value: '100%',
    label: t('homePage.stats.certified'),
    description: t('homePage.stats.certifiedSub'),
    icon: 'verified_user',
    color: '#1A237E',
    iconBg: '#E8EAF6',
  },
]);

const featureStrip = computed<HomeInfoItem[]>(() => [
  {
    icon: 'schedule',
    label: t('homePage.features.anytime.title'),
    description: t('homePage.features.anytime.desc'),
    color: '#D4AF37',
    iconBg: 'rgba(212, 175, 55, 0.15)',
  },
  {
    icon: 'emoji_objects',
    label: t('homePage.features.researcher.title'),
    description: t('homePage.features.researcher.desc'),
    color: '#5C6BC0',
    iconBg: 'rgba(92, 107, 192, 0.15)',
  },
  {
    icon: 'menu_book',
    label: t('homePage.features.popular.title'),
    description: t('homePage.features.popular.desc'),
    color: '#66BB6A',
    iconBg: 'rgba(102, 187, 106, 0.15)',
  },
]);

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

onMounted(fetchCourses);
</script>

<style lang="scss" scoped>
// ── Category Header ──────────────────────────────────────────
.category-header-section {
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

// ── Hero ──────────────────────────────────────────────────────
.hero-section {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 1920 / 540;
  overflow: hidden;
}

.hero-carousel {
  height: 100%;
  width: 100%;
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
  background: #ffffff; /* พื้นหลังสีขาว */
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
  pointer-events: auto;
  transition: all 0.22s ease;

  &:hover {
    border-color: rgba($primary, 0.42);
    box-shadow: 0 10px 24px rgba(17, 24, 39, 0.1);
  }
}

.hero-dot {
  width: 8px;
  height: 8px;
  border-radius: 8px;
  background: #e5e7eb; /* สีเทาอ่อนให้เห็นบนพื้นขาว */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &:hover {
    background: #d1d5db; /* เทาเข้มขึ้นตอน Hover */
  }
}

.hero-dot.is-active {
  width: 36px;
  background: rgba($primary, 0.15); /* ฐานสีทองอ่อนๆ ตอน Active */
  &:hover {
    transform: none;
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
  animation: slideProgress 8s linear forwards;
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

// ── Stats Bar ─────────────────────────────────────────────────
.stats-floating-section {
  background: #ffffff;
}

.stats-floating-section__inner {
  position: relative;
  z-index: 10;
  margin-top: -24px;
}

// ── Feature Strip ─────────────────────────────────────────────
.feature-strip-section {
  background: #ffffff;
}

// ── Course Sections ───────────────────────────────────────────
.courses-section {
  background: #ffffff;
  padding: 40px 0;
}

.skeleton-card {
  border-radius: 14px !important;
}
</style>
