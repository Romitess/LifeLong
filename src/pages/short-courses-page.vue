<template>
  <q-page class="short-courses-page">
    <div class="section-container filter-container">
      <div class="row justify-center">
        <div class="col-12 col-md-8">
          <q-input
            v-model="filter.search"
            outlined
            rounded
            icon="search"
            :placeholder="$t('searchPlaceholder')"
            bg-color="white"
            class="search-input-main"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template v-slot:append>
              <q-separator vertical class="q-mx-sm" />
              <q-btn flat round color="grey-7" icon="filter_list">
                <q-menu padding class="filter-menu shadow-10" style="border-radius: 16px">
                  <div class="q-pa-md" style="min-width: 250px">
                    <div class="text-subtitle1 text-weight-bold q-mb-md">
                      {{ $t('additionalFilters') }}
                    </div>

                    <div class="filter-group q-mb-md">
                      <div class="text-caption text-grey-7 q-mb-xs">{{ $t('courseType') }}</div>
                      <div class="row q-gutter-xs">
                        <q-btn
                          v-for="opt in typeOptions"
                          :key="opt.label"
                          unelevated
                          dense
                          :color="filter.type === opt.value ? 'primary' : 'grey-2'"
                          :text-color="filter.type === opt.value ? 'white' : 'dark'"
                          :label="opt.label"
                          class="q-px-md text-caption"
                          no-caps
                          @click="filter.type = filter.type === opt.value ? null : opt.value"
                        />
                      </div>
                    </div>

                    <div class="filter-group q-mb-md">
                      <div class="text-caption text-grey-7 q-mb-xs">{{ $t('price') }}</div>
                      <div class="row q-gutter-xs">
                        <q-btn
                          unelevated
                          dense
                          :color="filter.price === 'free' ? 'primary' : 'grey-2'"
                          :text-color="filter.price === 'free' ? 'white' : 'dark'"
                          :label="$t('free')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="filter.price = filter.price === 'free' ? null : 'free'"
                        />
                        <q-btn
                          unelevated
                          dense
                          :color="filter.price === 'paid' ? 'primary' : 'grey-2'"
                          :text-color="filter.price === 'paid' ? 'white' : 'dark'"
                          :label="$t('paid')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="filter.price = filter.price === 'paid' ? null : 'paid'"
                        />
                      </div>
                    </div>

                    <div class="filter-group q-mb-md">
                      <div class="text-caption text-grey-7 q-mb-xs">{{ $t('learningMode') }}</div>
                      <div class="row q-gutter-xs">
                        <q-btn
                          v-for="mode in ['Online', 'Onsite', 'Self-Paced Learning']"
                          :key="mode"
                          unelevated
                          dense
                          :color="filter.deliveryMode === mode ? 'primary' : 'grey-2'"
                          :text-color="filter.deliveryMode === mode ? 'white' : 'dark'"
                          :label="mode"
                          class="q-px-md text-caption"
                          no-caps
                          @click="filter.deliveryMode = filter.deliveryMode === mode ? null : mode"
                        />
                      </div>
                    </div>

                    <div class="filter-group q-mb-md">
                      <div class="text-caption text-grey-7 q-mb-xs">
                        {{ $t('registerableCourses') }}
                      </div>
                      <div class="row q-gutter-xs">
                        <q-btn
                          unelevated
                          dense
                          :color="filter.availability === 'open' ? 'primary' : 'grey-2'"
                          :text-color="filter.availability === 'open' ? 'white' : 'dark'"
                          :label="$t('openRegistration')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="
                            filter.availability = filter.availability === 'open' ? null : 'open'
                          "
                        />
                        <q-btn
                          unelevated
                          dense
                          :color="filter.availability === 'closed' ? 'primary' : 'grey-2'"
                          :text-color="filter.availability === 'closed' ? 'white' : 'dark'"
                          :label="$t('closedRegistration')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="
                            filter.availability = filter.availability === 'closed' ? null : 'closed'
                          "
                        />
                      </div>
                    </div>

                    <div class="filter-group q-mb-md">
                      <div class="text-caption text-grey-7 q-mb-xs">{{ $t('dateRange') }}</div>
                      <div class="row q-gutter-sm">
                        <q-input
                          class="col"
                          v-model="filter.startDate"
                          mask="##/##/####"
                          outlined
                          dense
                          clearable
                          :hint="$t('fromDate')"
                        >
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy
                                ref="startDateProxy"
                                cover
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-date
                                  v-model="filter.startDate"
                                  mask="DD/MM/YYYY"
                                  color="primary"
                                  :locale="dateLocale"
                                  @update:model-value="() => startDateProxy?.hide()"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                        <q-input
                          class="col"
                          v-model="filter.endDate"
                          mask="##/##/####"
                          outlined
                          dense
                          clearable
                          :hint="$t('toDate')"
                        >
                          <template v-slot:append>
                            <q-icon name="event" class="cursor-pointer">
                              <q-popup-proxy
                                ref="endDateProxy"
                                cover
                                transition-show="scale"
                                transition-hide="scale"
                              >
                                <q-date
                                  v-model="filter.endDate"
                                  mask="DD/MM/YYYY"
                                  color="primary"
                                  :locale="dateLocale"
                                  @update:model-value="() => endDateProxy?.hide()"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>

                    <q-separator class="q-my-sm" />
                    <div class="row q-gutter-sm">
                      <q-btn
                        unelevated
                        :label="$t('clear')"
                        color="grey-2"
                        text-color="dark"
                        dense
                        no-caps
                        class="col q-px-md rounded-borders"
                        @click="resetFilter"
                      />
                      <q-btn
                        unelevated
                        :label="$t('ok')"
                        color="primary"
                        dense
                        no-caps
                        class="col q-px-md rounded-borders"
                        v-close-popup
                      />
                    </div>
                  </div>
                </q-menu>
              </q-btn>
            </template>
          </q-input>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="section-container q-pb-xl" style="margin-bottom: 48px">
      <div class="course-section-panel">
        <!-- Category Header -->
        <div v-if="activeFilter.category" class="course-section-panel__header q-mb-lg">
          <h1 class="section-title-underline section-title-with-icon">
            <span class="section-title-icon">
              <q-icon name="category" />
            </span>
            <span>{{ getTranslatedCategory(activeFilter.category) }}</span>
          </h1>
        </div>

        <!-- Search Header -->
        <div v-else-if="activeFilter.search" class="course-section-panel__header q-mb-lg">
          <h1 class="section-title-underline section-title-with-icon">
            <span class="section-title-icon section-title-icon--secondary">
              <q-icon name="search" />
            </span>
            <span>{{ $t('searchResult') }}: "{{ activeFilter.search }}"</span>
          </h1>
        </div>

        <!-- Active Courses Header -->
        <div v-else-if="filter.onlyActive" class="course-section-panel__header q-mb-lg">
          <h2 class="section-title-underline section-title-with-icon">
            <span class="section-title-icon">
              <q-icon name="local_fire_department" />
            </span>
            <span>{{ $t('activeCoursesTitle') }}</span>
          </h2>
        </div>

        <!-- Default Header -->
        <div v-else class="course-section-panel__header q-mb-lg">
          <h2 class="section-title-underline section-title-with-icon">
            <span class="section-title-icon section-title-icon--secondary">
              <q-icon name="library_books" />
            </span>
            <span>{{ $t('allCoursesTitle') }}</span>
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
            <BaseCourseCard :course="course" @click="onCourseClick(course)" />
          </div>
          <div
            v-for="placeholderIndex in placeholderCards"
            :key="`placeholder-${placeholderIndex}`"
            class="col-xs-12 col-sm-6 col-md-3 short-courses-grid__cell short-courses-grid__cell--placeholder"
            aria-hidden="true"
          >
            <div class="short-courses-card-placeholder"></div>
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
          class="row justify-center q-mt-xl q-mb-xl short-courses-pagination"
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
import { QPopupProxy } from 'quasar';
import { useCourseList } from 'src/composables/use-course-list';
import type { Course, DeliveryMode } from 'src/types/course';
import { useI18n } from 'vue-i18n';
import { useCategoryStore } from 'src/stores/category-store';
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const categoryStore = useCategoryStore();
categoryStore.init();

const { courses, isLoading, fetchCourses } = useCourseList();

const startDateProxy = ref<QPopupProxy | null>(null);
const endDateProxy = ref<QPopupProxy | null>(null);
const dateLocale = computed(() => {
  if (locale.value === 'th') {
    return {
      days: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
      daysShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
      months: [
        'มกราคม',
        'กุมภาพันธ์',
        'มีนาคม',
        'เมษายน',
        'พฤษภาคม',
        'มิถุนายน',
        'กรกฎาคม',
        'สิงหาคม',
        'กันยายน',
        'ตุลาคม',
        'พฤศจิกายน',
        'ธันวาคม',
      ],
      monthsShort: [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.',
      ],
      firstDayOfWeek: 0,
      format24h: true,
      pluralDay: 'วัน',
    };
  }
  return undefined;
});

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

const typeOptions = computed(() => [
  { label: t('all'), value: null },
  { label: t('statusCert'), value: 'ประกาศนียบัตร' },
  { label: t('statusCredit'), value: 'สะสมหน่วยกิต' },
  { label: t('statusOpen'), value: 'เปิดรับสมัคร' },
]);

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

    // 4. Price
    const priceMatch =
      !filter.value.price || (filter.value.price === 'free' ? c.price === 0 : c.price > 0);

    // 5. Delivery Mode (Checking if selected mode is in deliveryModes array)
    const modeMatch =
      !filter.value.deliveryMode ||
      (c.deliveryModes && c.deliveryModes.includes(filter.value.deliveryMode as DeliveryMode));

    // 6. Availability (Registration Status)
    const isWithinPeriod = c.registrationStartDate <= today && today <= c.registrationEndDate;
    const hasSeats = c.enrolledCount < c.maxSeats;
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

const placeholderCards = computed(() => {
  if (filteredCourses.value.length === 0) {
    return [];
  }

  return Array.from(
    { length: Math.max(0, ITEMS_PER_PAGE - paginatedCourses.value.length) },
    (_, index) => index,
  );
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

function onCourseClick(course: Course): void {
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

.search-input-main {
  :deep(.q-field__control) {
    height: 60px;
    padding: 0 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 2px solid #edf2f7;
    border-radius: 30px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: white !important;

    &:hover {
      border-color: rgba($primary, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    }

    &.q-field__control--focused {
      border-color: $primary;
      box-shadow: 0 15px 35px rgba($primary, 0.15);
      transform: translateY(-2px);
    }

    &::before,
    &::after {
      display: none;
    }
  }

  :deep(.q-field__native) {
    font-size: 1.2rem;
    font-weight: 500;
    color: #000;
    opacity: 1;
  }

  :deep(.q-field__native::placeholder) {
    color: #9e9e9e;
    opacity: 1;
  }

  :deep(.q-field__marginal) {
    height: 60px;
  }
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
.short-courses-page {
  background: #f8f6f1;
}

.course-section-panel {
  min-height: 1180px;
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
  min-height: 920px;
}

.short-courses-grid__cell {
  display: flex;
}

.short-courses-grid__cell :deep(.course-card) {
  width: 100%;
  min-height: 390px;
}

.short-courses-grid__cell--placeholder {
  pointer-events: none;
}

.short-courses-card-placeholder {
  width: 100%;
  min-height: 390px;
  visibility: hidden;
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
