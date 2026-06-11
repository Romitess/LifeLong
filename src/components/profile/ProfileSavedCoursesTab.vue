<template>
  <div>
    <!-- Section Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.courses.savedTitle') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{
            $t('profile.courses.savedTotalCount', { count: courseBookmarkStore.myBookmarks.length })
          }}
        </div>
      </div>
      <BaseSearchInput
        :model-value="savedCourseSearch"
        :placeholder="$t('profile.courses.savedSearch')"
        class="profile-search-input"
        @update:model-value="$emit('update:savedCourseSearch', $event)"
      />
    </div>

    <!-- Saved Courses List Header -->
    <div v-if="filteredSavedCourses.length > 0" class="course-list-header q-mb-sm">
      <div class="text-caption text-weight-bold text-grey-7">
        {{ $t('profile.courses.savedTitle') }}
      </div>
      <q-badge rounded color="primary" :label="filteredSavedCourses.length" />
    </div>

    <!-- Saved Courses List -->
    <div v-if="filteredSavedCourses.length > 0" class="column q-gutter-md">
      <ProfileCourseCard
        v-for="bookmark in filteredSavedCourses"
        :key="bookmark.courseId"
        :course="getHydratedBookmarkCourse(bookmark)"
        :course-code="bookmark.courseCode"
        :title="getTranslatedCourseTitle(getHydratedBookmarkCourse(bookmark))"
        :status="getHydratedBookmarkCourse(bookmark).status"
        :delivery-modes="getHydratedBookmarkCourse(bookmark).deliveryModes"
        :max-seats="getHydratedBookmarkCourse(bookmark).maxSeats"
        :enrolled-count="getHydratedBookmarkCourse(bookmark).enrolledCount"
        :registered-at-label="getSavedCourseRegisteredAtLabel(bookmark.courseId)"
        :progress-percent="getSavedCourseProgress(bookmark.courseId)?.progressPercent ?? null"
        :progress-detail-label="getSavedCourseProgress(bookmark.courseId)?.detailLabel ?? ''"
        :progress-status-label="getSavedCourseProgress(bookmark.courseId)?.statusLabel ?? ''"
        :progress-color="getSavedCourseProgress(bookmark.courseId)?.color ?? 'primary'"
      >
        <template #actions>
          <template v-if="courseRegistrationStore.isRegistered(bookmark.courseId)">
            <q-btn
              outline
              color="negative"
              :label="$t('profile.courses.unsave')"
              icon="bookmark_remove"
              no-caps
              size="md"
              class="course-action-btn"
              @click="courseBookmarkStore.removeBookmark(bookmark.courseId)"
            />
            <q-btn
              outline
              color="negative"
              :label="$t('profile.courses.unregister')"
              icon="cancel"
              no-caps
              size="md"
              class="course-action-btn"
              @click="$emit('prompt-unregister', bookmark)"
            />
            <CourseCompletionDocumentActions
              v-if="getCompletedCourseEntry(bookmark.courseId)"
              :entry="getCompletedCourseEntry(bookmark.courseId)!"
            />
            <q-space />
            <q-btn
              flat
              color="primary"
              :label="getCoursePriceLabel(getHydratedBookmarkCourse(bookmark))"
              icon="local_offer"
              no-caps
              size="md"
              disable
              class="course-action-btn text-weight-bold"
            />
            <q-btn
              v-if="getRegistrationByCourseId(bookmark.courseId)?.paymentStatus === 'pending'"
              unelevated
              color="primary"
              :label="$t('enrollment.next')"
              icon="payment"
              no-caps
              size="md"
              class="course-action-btn course-action-btn--primary"
              @click="$emit('open-pending-payment', bookmark.courseId)"
            />
            <q-btn
              v-else
              unelevated
              color="primary"
              :label="$t('profile.courses.enterClass')"
              icon="play_circle"
              no-caps
              size="md"
              class="course-action-btn course-action-btn--primary"
              @click="
                $emit(
                  'go-to-course',
                  bookmark.courseId,
                  bookmark.courseCode,
                  getHydratedBookmarkCourse(bookmark).moodleId,
                )
              "
            />
          </template>
          <template v-else>
            <q-btn
              outline
              color="negative"
              :label="$t('profile.courses.unsave')"
              icon="bookmark_remove"
              no-caps
              size="md"
              class="course-action-btn"
              @click="courseBookmarkStore.removeBookmark(bookmark.courseId)"
            />
            <q-space />
            <q-btn
              flat
              color="primary"
              :label="getCoursePriceLabel(getHydratedBookmarkCourse(bookmark))"
              icon="local_offer"
              no-caps
              size="md"
              disable
              class="course-action-btn text-weight-bold"
            />
            <BaseButton
              :color="getSavedCourseAction(bookmark).color"
              :label="getSavedCourseAction(bookmark).label"
              :icon="getSavedCourseAction(bookmark).icon"
              :disable="getSavedCourseAction(bookmark).disabled"
              no-caps
              size="md"
              class="course-action-btn"
              @click="$emit('on-enroll', bookmark)"
            />
          </template>
        </template>
      </ProfileCourseCard>
    </div>

    <!-- Empty State -->
    <q-card v-else flat class="text-center empty-state-card q-pa-xl">
      <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
        <q-icon name="bookmark" size="48px" color="amber-8" />
      </div>
      <div class="text-h6 text-weight-bolder text-dark">
        {{ $t('profile.courses.savedEmpty') }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm" style="max-width: 340px; margin: 0 auto">
        {{ $t('profile.courses.savedEmptySub') }}
      </div>
      <q-btn
        unelevated
        rounded
        color="primary"
        :label="$t('profile.courses.explore')"
        icon="explore"
        no-caps
        class="q-mt-xl"
        padding="sm xl"
        @click="navClick('/short-courses', $event)"
        @auxclick.prevent="navClick('/short-courses', $event)"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { isNewTabClick, openInNewTab } from 'src/composables/use-nav-link';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSearchInput from 'components/base/BaseSearchInput.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import { useCourseBookmarkStore, type CourseBookmark } from 'src/stores/course-bookmark-store';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';
import type { Course } from 'src/types/course';

defineProps<{
  filteredSavedCourses: CourseBookmark[];
  savedCourseSearch: string;
}>();

defineEmits<{
  'update:savedCourseSearch': [value: string];
  'prompt-unregister': [bookmark: CourseBookmark];
  'open-pending-payment': [courseId: string];
  'go-to-course': [courseId: string, courseCode: string | undefined, moodleId: number | undefined];
  'on-enroll': [bookmark: CourseBookmark];
}>();

const { t, locale } = useI18n();
const router = useRouter();

function navClick(path: string, event: Event): void {
  if (isNewTabClick(event)) {
    event.preventDefault();
    event.stopPropagation();
    openInNewTab(path);
    return;
  }
  void router.push(path);
}
const courseBookmarkStore = useCourseBookmarkStore();
const courseRegistrationStore = useCourseRegistrationStore();
const courseStore = useCourseStore();
const { getRegistrationByCourseId, getRegisteredCourseEntry } = useMyRegisteredCourses();

const DEFAULT_COVER = {
  icon: 'auto_stories',
  accentColor: '#f5a623',
  backgroundColor: '#1e3a5f',
};

function getTranslatedCourseTitle(course: { title: string; titleEn?: string }): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function getHydratedBookmarkCourse(bookmark: CourseBookmark) {
  const realCourse = courseStore.courses.find((c) => c.id === bookmark.courseId);
  return {
    ...realCourse,
    title: bookmark.courseTitle,
    imageUrl: bookmark.courseImageUrl || realCourse?.imageUrl || '',
    cover: bookmark.courseCover || realCourse?.cover || DEFAULT_COVER,
    status: realCourse?.status || '',
    deliveryModes: realCourse?.deliveryModes || ([] as string[]),
    isFree: realCourse?.isFree ?? false,
    price: realCourse?.price ?? 0,
    maxSeats: realCourse?.maxSeats ?? 0,
    enrolledCount: realCourse?.enrolledCount ?? 0,
    registrationStartDate: realCourse?.registrationStartDate || '',
    registrationEndDate: realCourse?.registrationEndDate || '',
  };
}

function getCoursePriceLabel(
  course: Pick<Course, 'isFree' | 'price'> | { isFree?: boolean; price?: number },
): string {
  return course.isFree ? t('free') : `THB ${(course.price ?? 0).toLocaleString()}`;
}

function getSavedCourseRegisteredAtLabel(courseId: string): string {
  const registration = getRegistrationByCourseId(courseId);
  if (!registration) return '';
  return `${t('profile.courses.registeredAt')} ${formatDate(registration.registeredAt)}`;
}

function getSavedCourseProgress(courseId: string): RegisteredCourseEntry['progress'] | null {
  return getRegisteredCourseEntry(courseId)?.progress ?? null;
}

function getCompletedCourseEntry(courseId: string): RegisteredCourseEntry | null {
  const entry = getRegisteredCourseEntry(courseId);
  return entry?.progress.isCompleted ? entry : null;
}

function parseLocalDate(dateText: string): Date {
  const [year, month, day] = dateText.split('-').map(Number);
  return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
}

function getEndOfLocalDate(dateText: string): Date {
  const date = parseLocalDate(dateText);
  date.setHours(23, 59, 59, 999);
  return date;
}

interface SavedCourseAction {
  label: string;
  icon: string;
  color: string;
  disabled: boolean;
}

function getSavedCourseAction(bookmark: CourseBookmark): SavedCourseAction {
  const hydrated = getHydratedBookmarkCourse(bookmark);

  if (hydrated.registrationStartDate && hydrated.registrationEndDate) {
    const today = new Date();
    const start = parseLocalDate(hydrated.registrationStartDate);
    const end = getEndOfLocalDate(hydrated.registrationEndDate);

    if (today < start) {
      return {
        label: t('courseDetail.regUpcoming'),
        icon: 'schedule',
        color: 'grey-7',
        disabled: true,
      };
    }
    if (today > end) {
      return {
        label: t('courseDetail.regClosed'),
        icon: 'event_busy',
        color: 'grey-7',
        disabled: true,
      };
    }
  }

  if (hydrated.enrolledCount >= hydrated.maxSeats && hydrated.maxSeats > 0) {
    return { label: t('courseDetail.seatsFull'), icon: 'block', color: 'grey-7', disabled: true };
  }

  return {
    label: t('courseDetail.enrollNow'),
    icon: 'how_to_reg',
    color: 'primary',
    disabled: false,
  };
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style lang="scss" scoped>
.profile-search-input {
  width: 310px;
  --base-search-height: 42px;
  --base-search-padding-x: 14px;
  --base-search-font-size: 0.92rem;
}

.course-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 8px 18px;
  background: white;
  border-radius: 10px;
  border: 1px solid rgba(17, 24, 39, 0.12);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.03);
}

.course-action-btn {
  min-height: 40px;
  border-radius: 10px !important;
  font-weight: 800;
  font-size: 0.82rem;
  padding: 0 16px !important;

  &--primary {
    min-width: 116px;
    border: 0 !important;
    box-shadow: 0 7px 18px rgba($primary, 0.24) !important;
  }
}

.empty-state-card {
  border-radius: 20px !important;
  background:
    radial-gradient(circle at 50% 0%, rgba($primary, 0.04), transparent 60%), white !important;
  border: 2px dashed rgba($primary, 0.15) !important;
  padding: 48px 24px !important;

  &__icon-wrap {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    background: rgba($primary, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .profile-search-input {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
