<template>
  <q-page class="short-courses-page">
    <div class="section-container filter-container">
      <div class="row justify-center">
        <div class="col-12 col-md-8">
          <div class="row items-center no-wrap q-gutter-sm short-courses-page__search-row">
            <BaseSearchInput
              v-model="filter.search"
              :placeholder="$t('searchPlaceholder')"
              class="col"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="section-container q-pb-lg" style="margin-bottom: 32px">
      <div class="course-section-panel">
        <!-- Category Header -->
        <div v-if="activeFilter.category" class="course-section-panel__header q-mb-lg">
          <h1 class="section-title-underline">
            {{ getTranslatedCategory(activeFilter.category) }}
          </h1>
        </div>

        <!-- Search Header -->
        <div v-else-if="activeFilter.search" class="course-section-panel__header q-mb-lg">
          <h1 class="section-title-underline">
            {{ $t('searchResult') }}: "{{ activeFilter.search }}"
          </h1>
        </div>

        <!-- Active Courses Header -->
        <div v-else-if="filter.onlyActive" class="course-section-panel__header q-mb-lg">
          <h2 class="section-title-underline">
            {{ $t('activeCoursesTitle') }}
          </h2>
        </div>

        <!-- Default Header -->
        <div v-else class="course-section-panel__header q-mb-lg">
          <h2 class="section-title-underline">
            {{ $t('allCoursesTitle') }}
          </h2>
        </div>

        <!-- Course Grid -->
        <BaseSpinner v-if="isLoading" />

        <div v-else class="row q-col-gutter-lg short-courses-grid">
          <div
            v-for="course in paginatedCourses"
            :key="course.id"
            class="col-xs-12 col-sm-6 col-md-3 short-courses-grid__cell"
          >
            <BaseCourseCard
              :course="course"
              :href="resolveFullUrl(`/course/${course.id}`)"
              @click="onCourseClick"
            />
          </div>
          <div v-if="filteredCourses.length === 0" class="col-12 text-center q-py-xl">
            <q-icon name="search_off" size="4rem" color="grey-4" />
            <div class="text-h6 text-grey-5 q-mt-md">{{ $t('noCoursesFoundShort') }}</div>
            <q-btn flat color="primary" :label="$t('clearSearch')" @click="resetFilter" />
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="filteredCourses.length > 0 && (totalPages > 1 || Boolean(activeFilter.category))"
          class="row justify-center q-mt-xl q-mb-md short-courses-pagination"
        >
          <BasePagination
            :model-value="currentPage"
            :max="totalPages"
            :max-pages="7"
            gutter="md"
            @update:model-value="handlePageChange"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCourseList } from 'src/composables/use-course-list';
import type { Course, DeliveryMode } from 'src/types/course';
import { useI18n } from 'vue-i18n';
import { useCategoryStore } from 'src/stores/category-store';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import BaseSearchInput from 'components/base/BaseSearchInput.vue';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const categoryStore = useCategoryStore();
categoryStore.init();

const { courses, isLoading, fetchCourses } = useCourseList();

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

function getTranslatedCategory(label: string): string {
  const matchedCategory = categoryStore.findByName(label);
  if (matchedCategory) {
    const key = categoryMap[matchedCategory.name];
    if (key) {
      return t(key);
    }

    if (locale.value !== 'th' && matchedCategory.nameEn?.trim()) {
      return matchedCategory.nameEn;
    }

    return matchedCategory.name;
  }

  const key = categoryMap[label];
  return key ? t(key) : label;
}

const ITEMS_PER_PAGE = 12; // 3 rows × 4 columns
const currentPage = ref(1);

const filter = ref({
  type: null as string | null,
  faculty: null as string | null,
  category: route.query.category as string | null,
  search: (route.query.search as string) || '',
  price: null as 'free' | 'paid' | null,
  deliveryMode: null as string | null,
  availability: (route.query.availability as 'open' | 'closed' | null) ?? null,
  startDate: null as string | null,
  endDate: null as string | null,
  onlyActive: route.query.active === 'true',
});

const activeFilter = ref({
  type: null as string | null,
  faculty: null as string | null,
  category: route.query.category as string | null,
  search: (route.query.search as string) || '',
  price: null as 'free' | 'paid' | null,
  deliveryMode: null as string | null,
  availability: (route.query.availability as 'open' | 'closed' | null) ?? null,
  startDate: null as string | null,
  endDate: null as string | null,
});

function parseDateString(dateStr: string | null): string | null {
  if (!dateStr || dateStr.length !== 10) return null;
  const parts = dateStr.split('/');
  if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
    let year = parseInt(parts[2]);
    if (year > 2400) year -= 543; // Convert BE to CE
    return `${year}-${parts[1]}-${parts[0]}`;
  }
  return null;
}

const filteredCourses = computed(() => {
  const today = new Date().toISOString().substring(0, 10);
  return courses.value.filter((c) => {
    // 0. Active only filter (from ?active=true)
    const activeMatch = !filter.value.onlyActive || c.isActive;

    // 1. Search text (Live search)
    const searchMatch =
      !filter.value.search ||
      c.title.toLowerCase().includes(filter.value.search.toLowerCase()) ||
      c.code.toLowerCase().includes(filter.value.search.toLowerCase());

    // 2. Category (from URL or active filter)
    const catMatch = !filter.value.category || c.category === filter.value.category;

    // 3. Type
    const typeMatch = !filter.value.type || c.status === filter.value.type;

    // 4. Price (treat null price as 0/free)
    const effectivePrice = c.price ?? 0;
    const priceMatch =
      !filter.value.price ||
      (filter.value.price === 'free' ? effectivePrice === 0 : effectivePrice > 0);

    // 5. Delivery Mode (Checking if selected mode is in deliveryModes array)
    const modeMatch =
      !filter.value.deliveryMode ||
      (c.deliveryModes && c.deliveryModes.includes(filter.value.deliveryMode as DeliveryMode));

    // 6. Availability (Registration Status) — null maxSeats means unlimited
    const isWithinPeriod = c.registrationStartDate <= today && today <= c.registrationEndDate;
    const hasSeats = c.maxSeats == null || c.enrolledCount < c.maxSeats;
    const canRegister = isWithinPeriod && hasSeats;

    const availabilityMatch =
      !filter.value.availability ||
      (filter.value.availability === 'open' ? canRegister : !canRegister);

    // 7. Date Range Match
    let dateMatch = true;
    const filterStart = filter.value.startDate;
    const filterEnd = filter.value.endDate;

    if (filterStart || filterEnd) {
      const parsedStart = parseDateString(filterStart);
      const parsedEnd = parseDateString(filterEnd);

      if (c.registrationStartDate && c.registrationEndDate) {
        const cStart = c.registrationStartDate;
        const cEnd = c.registrationEndDate;

        if (parsedStart && parsedEnd) {
          dateMatch = cStart >= parsedStart && cEnd <= parsedEnd;
        } else if (parsedStart) {
          dateMatch = cStart >= parsedStart;
        } else if (parsedEnd) {
          dateMatch = cEnd <= parsedEnd;
        }
      } else {
        dateMatch = false;
      }
    }

    return (
      activeMatch &&
      searchMatch &&
      catMatch &&
      typeMatch &&
      priceMatch &&
      modeMatch &&
      availabilityMatch &&
      dateMatch
    );
  });
});

const totalPages = computed(() => Math.ceil(filteredCourses.value.length / ITEMS_PER_PAGE));

const paginatedCourses = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return filteredCourses.value.slice(start, start + ITEMS_PER_PAGE);
});

// Reset to page 1 when filters change
watch(filteredCourses, () => {
  currentPage.value = 1;
});

watch(
  () => route.query,
  (newQuery) => {
    filter.value.category = (newQuery.category as string) || null;
    filter.value.search = (newQuery.search as string) || '';
    filter.value.onlyActive = newQuery.active === 'true';
    filter.value.availability = (newQuery.availability as 'open' | 'closed' | null) ?? null;
    activeFilter.value.category = (newQuery.category as string) || null;
    activeFilter.value.search = (newQuery.search as string) || '';
    activeFilter.value.availability = (newQuery.availability as 'open' | 'closed' | null) ?? null;
  },
  { immediate: true },
);

function handleSearch() {
  activeFilter.value = { ...filter.value };
}

function resetFilter() {
  filter.value = {
    type: null,
    faculty: null,
    category: null,
    search: '',
    price: null,
    deliveryMode: null,
    availability: null,
    startDate: null,
    endDate: null,
    onlyActive: false,
  };
  currentPage.value = 1;
  handleSearch();
  void router.push('/short-courses');
}

function handlePageChange(page: number): void {
  const previousScrollY = window.scrollY;
  currentPage.value = page;

  void nextTick(() => {
    const restoreScroll = () => {
      window.scrollTo({
        top: previousScrollY,
        behavior: 'auto',
      });
    };

    restoreScroll();
    requestAnimationFrame(() => {
      restoreScroll();
      requestAnimationFrame(restoreScroll);
    });

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  });
}

function onCourseClick(course: Course, event?: Event): void {
  if (event && isNewTabClick(event)) {
    return; // Browser handles href in new tab
  }
  void router.push(`/course/${course.id}`);
}

onMounted(fetchCourses);
</script>

<style lang="scss" scoped>
.border-top-yellow {
  border-top: 4px solid #f5a623;
}

.filter-container {
  padding-top: 64px;
  padding-bottom: 40px;
}

.skeleton-card {
  border-radius: 14px !important;
}

.section-title {
  position: relative;
  padding-left: 16px;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 24px;
    background: $primary;
    border-radius: 4px;
  }
}

// ── Page & Panel (matching main-page) ──
.course-section-panel {
  display: flex;
  flex-direction: column;
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

  .section-title-underline {
    color: $secondary;
  }
}

.short-courses-grid {
  flex: 1;
  align-content: start;
}

.short-courses-grid__cell {
  display: flex;
}

.short-courses-grid__cell :deep(.course-card) {
  width: 100%;
  min-height: 390px;
}

.short-courses-pagination {
  min-height: 72px;
  align-items: center;
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

@media (max-width: 1023px) {
  .course-section-panel {
    min-height: 0;
  }

  .short-courses-grid {
    min-height: 0;
  }
}
</style>
