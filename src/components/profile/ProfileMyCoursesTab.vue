<template>
  <div class="student-course-panel">
    <!-- Section Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.courses.title') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ $t('profile.courses.totalCount', { count: myRegistrationsCount }) }}
        </div>
      </div>
      <BaseSearchInput
        :model-value="courseSearch"
        :placeholder="$t('profile.courses.search')"
        class="profile-search-input"
        @update:model-value="$emit('update:courseSearch', $event)"
      />
    </div>

    <!-- Registered Courses Table Header -->
    <div v-if="filteredRegistrations.length > 0" class="course-list-header q-mb-sm">
      <div class="text-caption text-weight-bold text-grey-7">
        {{ $t('profile.courses.registeredTitle') }}
      </div>
      <q-badge rounded color="primary" :label="filteredRegistrations.length" />
    </div>

    <!-- Course List -->
    <div v-if="filteredRegistrations.length > 0" class="student-course-list">
      <ProfileCourseCard
        v-for="entry in filteredRegistrations"
        :key="entry.registration.id"
        :course="entry.course"
        :course-code="entry.course.code"
        :title="getTranslatedCourseTitle(entry.course)"
        :status="entry.course.status"
        :delivery-modes="entry.course.deliveryModes"
        :max-seats="entry.course.maxSeats"
        :enrolled-count="entry.course.enrolledCount"
        :registered-at-label="`${$t('profile.courses.registeredAt')} ${formatDate(entry.registration.registeredAt)}`"
        :progress-percent="entry.progress.progressPercent"
        :progress-detail-label="entry.progress.detailLabel"
        :progress-status-label="
          entry.registration.paymentStatus === 'pending'
            ? $t('courseDetail.pendingPayment')
            : entry.progress.statusLabel
        "
        :progress-color="
          entry.registration.paymentStatus === 'pending' ? 'warning' : entry.progress.color
        "
      >
        <template #actions>
          <q-btn
            outline
            :color="
              courseBookmarkStore.isBookmarked(entry.registration.courseId) ? 'negative' : 'primary'
            "
            :label="
              courseBookmarkStore.isBookmarked(entry.registration.courseId)
                ? $t('profile.courses.unsave')
                : $t('profile.courses.save')
            "
            :icon="
              courseBookmarkStore.isBookmarked(entry.registration.courseId)
                ? 'bookmark_remove'
                : 'bookmark_add'
            "
            no-caps
            size="md"
            class="course-action-btn"
            @click="$emit('toggle-bookmark', entry.registration)"
          />
          <q-btn
            outline
            color="negative"
            :label="$t('profile.courses.unregister')"
            icon="cancel"
            no-caps
            size="md"
            class="course-action-btn"
            @click="$emit('prompt-unregister', entry.registration)"
          />
          <q-space />
          <q-btn
            flat
            color="primary"
            :label="getCoursePriceLabel(entry.course)"
            icon="local_offer"
            no-caps
            size="md"
            disable
            class="course-action-btn text-weight-bold"
          />
          <q-btn
            v-if="entry.registration.paymentStatus === 'pending'"
            unelevated
            color="primary"
            :label="$t('enrollment.next')"
            icon="payment"
            no-caps
            size="md"
            class="course-action-btn course-action-btn--primary"
            @click="$emit('open-pending-payment', entry.registration.courseId)"
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
            :href="resolveFullUrl(`/course/${entry.registration.courseId}/learn`)"
            @click.prevent="
              $emit(
                'go-to-course',
                entry.registration.courseId,
                entry.course.code,
                entry.course.moodleId,
              )
            "
          />
          <q-btn
            v-if="entry.registration.paymentStatus === 'paid' && !entry.course.isFree"
            flat
            :color="entry.registration.hasReceipt ? 'primary' : 'grey-7'"
            :label="
              entry.registration.hasReceipt
                ? locale === 'th'
                  ? 'ดาวน์โหลดใบเสร็จ'
                  : 'Download Receipt'
                : locale === 'th'
                  ? 'รอเจ้าหน้าที่ออกใบเสร็จ'
                  : 'Waiting for Receipt'
            "
            :icon="entry.registration.hasReceipt ? 'receipt_long' : 'schedule'"
            no-caps
            size="md"
            :disable="!entry.registration.hasReceipt"
            class="course-action-btn"
            @click="
              entry.registration.hasReceipt &&
              $emit('download-receipt', entry.registration.courseId)
            "
          >
            <q-tooltip v-if="!entry.registration.hasReceipt">
              {{
                locale === 'th'
                  ? 'กรุณารอให้เจ้าหน้าที่การเงินออกใบเสร็จให้ก่อน'
                  : 'Please wait for finance staff to issue the receipt'
              }}
            </q-tooltip>
          </q-btn>
        </template>
      </ProfileCourseCard>
    </div>

    <!-- Empty State -->
    <q-card v-else flat class="text-center empty-state-card q-pa-xl">
      <div class="empty-state-card__icon-wrap q-mx-auto q-mb-lg">
        <q-icon name="school" size="48px" color="primary" />
      </div>
      <div class="text-h6 text-weight-bolder text-dark">
        {{ $t('profile.courses.empty') }}
      </div>
      <div class="text-body2 text-grey-6 q-mt-sm" style="max-width: 340px; margin: 0 auto">
        {{ $t('profile.courses.emptySub') }}
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
        @click="router.push('/short-courses')"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import BaseSearchInput from 'components/base/BaseSearchInput.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import { useCourseBookmarkStore } from 'src/stores/course-bookmark-store';
import type { RegisteredCourseEntry } from 'src/composables/use-my-registered-courses';
import type { CourseRegistration } from 'src/stores/course-registration-store';
import type { Course } from 'src/types/course';
import { resolveFullUrl } from 'src/composables/use-nav-link';

defineProps<{
  filteredRegistrations: RegisteredCourseEntry[];
  courseSearch: string;
  myRegistrationsCount: number;
}>();

defineEmits<{
  'update:courseSearch': [value: string];
  'toggle-bookmark': [registration: CourseRegistration];
  'prompt-unregister': [registration: CourseRegistration];
  'open-pending-payment': [courseId: string];
  'go-to-course': [courseId: string, courseCode: string | undefined, moodleId: number | undefined];
  'download-receipt': [courseId: string];
}>();

const { t, locale } = useI18n();
const router = useRouter();
const courseBookmarkStore = useCourseBookmarkStore();

function getTranslatedCourseTitle(course: { title: string; titleEn?: string }): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getCoursePriceLabel(course: Pick<Course, 'isFree' | 'price'>): string {
  return course.isFree ? t('free') : `THB ${(course.price ?? 0).toLocaleString()}`;
}
</script>

<style lang="scss" scoped>
.student-course-panel {
  max-width: 1004px;
}

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

.student-course-list {
  display: grid;
  gap: 18px;
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
