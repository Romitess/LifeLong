<template>
  <q-card
    class="course-card cursor-pointer"
    flat
    bordered
    :style="{ '--cat-color': categoryColor }"
    @click="emit('click', course)"
  >
    <CourseCoverImage :course="course" :ratio="16 / 9" class="course-card__cover" />

    <q-card-section class="course-card__body q-pa-md">
      <div class="course-card__code q-mb-xs">{{ course.code }}</div>

      <div class="course-card__title text-body2 text-weight-medium text-dark">
        {{ getTranslatedTitle(course) }}
      </div>

      <div class="row items-center q-mt-sm q-gutter-x-xs text-grey-6">
        <q-icon name="event" size="13px" />
        <span class="text-caption">
          {{ $t('registrationDate') }} {{ getTranslatedRegStart(course) }} –
          {{ getTranslatedRegEnd(course) }}
        </span>
      </div>

      <div class="row items-center justify-between q-mt-sm">
        <span v-if="course.isFree" class="text-positive text-weight-bold text-body2">{{
          $t('free')
        }}</span>
        <span v-else class="text-negative text-weight-bold text-body2">
          {{ $t('price') }} {{ formatPrice(course.price) }} {{ $t('thb') }}
        </span>
        <div class="row items-center q-gutter-x-xs text-grey-5">
          <q-icon name="visibility" size="13px" />
          <span class="text-caption">{{ formatViews(course.views) }} {{ $t('views') }}</span>
        </div>
      </div>

      <div class="q-mt-sm row q-gutter-xs">
        <q-badge :color="getStatusColor(course.status)" class="badge-pill">
          {{ $t(getStatusKey(course.status)) }}
        </q-badge>
        <q-badge
          v-for="mode in course.deliveryModes"
          :key="mode"
          :color="getModeColor(mode)"
          class="badge-pill"
        >
          {{ getModeLabel(mode) }}
        </q-badge>

        <!-- Seat Availability Badge -->
        <q-badge :color="seatInfo.color" class="badge-pill">
          {{ seatInfo.label }}
        </q-badge>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import type { Course, CourseStatus, DeliveryMode } from 'src/types/course';
import { useI18n } from 'vue-i18n';
import {
  formatPrice as formatPriceShared,
  formatViews as formatViewsShared,
} from 'src/utils/course-format';
import { useCategoryStore } from 'src/stores/category-store';

const { locale, t } = useI18n({ useScope: 'global' });
const categoryStore = useCategoryStore();

interface Props {
  course: Course;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [course: Course];
}>();

const categoryColor = computed<string>(() => {
  const cat = categoryStore.activeCategories.find((c) => c.name === props.course.category);
  return cat?.color ?? 'transparent';
});

function getTranslatedTitle(course: Course): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function parseLocalDate(dateText: string | null | undefined): Date {
  if (!dateText) return new Date(NaN);
  const parts = dateText.split('-').map(Number);
  if (parts.length < 3 || parts.some(isNaN)) return new Date(NaN);
  return new Date(parts[0] as number, (parts[1] as number) - 1, parts[2]);
}

function formatRegistrationDateByLocale(dateText: string | null | undefined): string {
  if (!dateText) return '—';
  const date = parseLocalDate(dateText);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTranslatedRegStart(course: Course): string {
  if (locale.value === 'th') {
    return course.registrationStart;
  }
  return course.registrationStartEn || formatRegistrationDateByLocale(course.registrationStartDate);
}

function getTranslatedRegEnd(course: Course): string {
  if (locale.value === 'th') {
    return course.registrationEnd;
  }
  return course.registrationEndEn || formatRegistrationDateByLocale(course.registrationEndDate);
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

function formatPrice(price: number): string {
  return formatPriceShared(price, locale.value === 'th' ? 'th' : 'en');
}

function formatViews(views: number): string {
  return formatViewsShared(views, locale.value === 'th' ? 'th' : 'en');
}

function getStatusColor(status: CourseStatus): string {
  const colorMap: Record<CourseStatus, string> = {
    ประกาศนียบัตร: 'blue-grey-8',
    สะสมหน่วยกิต: 'amber-8',
    เปิดรับสมัคร: 'positive',
    ปิดรับสมัคร: 'red-7',
    เร็วๆนี้: 'orange-8',
  };
  return colorMap[status] ?? 'grey';
}

function getModeColor(mode: DeliveryMode): string {
  const colorMap: Record<DeliveryMode, string> = {
    Online: 'teal-7',
    Onsite: 'red-7',
    'Self-Paced Learning': 'blue-7',
  };
  return colorMap[mode] ?? 'grey';
}

function getModeLabel(mode: DeliveryMode): string {
  const map: Record<DeliveryMode, string> = {
    Online: t('deliveryModeOnline'),
    Onsite: t('deliveryModeOnsite'),
    'Self-Paced Learning': t('deliveryModeSelfPaced'),
  };
  return map[mode] || mode;
}

const seatInfo = computed(() => {
  const remaining = (props.course.maxSeats ?? 0) - props.course.enrolledCount;
  if (remaining <= 0) {
    return { label: t('seatFull'), color: 'red-8' };
  }
  if (remaining <= 5) {
    return { label: t('seatAlmostFull', { count: remaining }), color: 'orange-9' };
  }
  return { label: t('seatAvailable', { count: remaining }), color: 'green-6' };
});
</script>

<style lang="scss" scoped>
.course-card {
  --cat-color: #{$primary};

  border-radius: 16px !important;
  border: 1px solid rgba(18, 33, 74, 0.08) !important;
  background: #ffffff;
  position: relative; // required for z-index
  box-shadow:
    0 2px 10px -4px rgba(18, 33, 74, 0.12),
    0 1px 3px rgba(17, 24, 39, 0.05);

  transition:
    transform 0.42s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.42s ease,
    border-color 0.42s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (hover: hover) {
    &:hover {
      transform: translateY(-7px) !important;
      border-color: rgba($primary, 0.36) !important;
      box-shadow:
        0 18px 48px -16px rgba(18, 33, 74, 0.26),
        0 4px 12px rgba(17, 24, 39, 0.07) !important;
      z-index: 2;
    }
  }

  &:active {
    transform: translateY(-2px) scale(0.99) !important;
  }

  &__cover {
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__code {
    color: #6b7280;
    font-size: 0.73rem;
    font-weight: 700;
    letter-spacing: 0;
  }

  &__title {
    line-height: 1.45;
    overflow: hidden;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    min-height: 2.9em;
  }
}

.badge-pill {
  border-radius: 999px !important;
  padding: 2px 10px !important;
  font-size: 0.68rem !important;
  font-weight: 500 !important;
}
</style>
