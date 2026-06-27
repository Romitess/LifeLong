<template>
  <q-card
    flat
    bordered
    class="profile-course-card"
    :class="{
      'profile-course-card--compact': isCompact,
      'profile-course-card--active': active,
    }"
  >
    <div class="profile-course-card__stripe" />

    <template v-if="isCompact">
      <CourseCoverImage
        :course="course"
        :ratio="16 / 9"
        instant
        loading="eager"
        class="profile-course-card__compact-cover"
      />

      <q-card-section class="profile-course-card__compact-body q-pa-md">
        <div class="row items-center justify-between q-gutter-sm q-mb-sm">
          <q-badge outline color="primary" class="text-weight-bold">
            {{ courseCode }}
          </q-badge>
          <div
            v-if="registeredAtLabel"
            class="row items-center q-gutter-xs text-caption text-grey-6"
          >
            <q-icon name="event" size="14px" color="grey-5" />
            <span>{{ registeredAtLabel }}</span>
          </div>
        </div>

        <div class="profile-course-card__title text-subtitle1 text-weight-bolder text-dark">
          {{ title }}
        </div>

        <div class="row items-center q-gutter-x-sm q-gutter-y-xs q-mt-sm">
          <q-badge v-if="status" :color="getStatusColor(status)" class="badge-pill">
            {{ getStatusLabel(status) }}
          </q-badge>
          <q-badge
            v-for="mode in deliveryModes"
            :key="mode"
            :color="getModeColor(mode)"
            class="badge-pill"
          >
            {{ getModeLabel(mode) }}
          </q-badge>
          <q-badge v-if="seatInfo" :color="seatInfo.color" class="badge-pill">
            {{ seatInfo.label }}
          </q-badge>
        </div>

        <div v-if="progressPercent !== null" class="profile-course-card__progress q-mt-md">
          <div class="row items-center justify-between q-gutter-sm q-mb-xs">
            <div class="text-caption text-grey-7 text-weight-medium">
              {{ progressLabel || t('profile.courses.progress') }}
            </div>
            <div class="row items-center q-gutter-xs">
              <q-badge :color="progressColor" class="badge-pill">
                {{ progressStatusLabel }}
              </q-badge>
              <span class="text-caption text-weight-bold" :class="`text-${progressColor}`">
                {{ progressPercent }}%
              </span>
            </div>
          </div>
          <q-linear-progress
            rounded
            size="8px"
            :value="progressPercent / 100"
            :color="progressColor"
            track-color="grey-2"
          />
          <div v-if="progressDetailLabel" class="text-caption text-grey-6 q-mt-xs">
            {{ progressDetailLabel }}
          </div>
        </div>

        <template v-if="hasActions">
          <q-separator class="q-my-md" />
          <div class="profile-course-card__compact-actions">
            <slot name="actions" />
          </div>
        </template>
      </q-card-section>
    </template>

    <q-card-section v-else class="profile-course-card__body row items-start q-gutter-md no-wrap">
      <div class="profile-course-card__thumb">
        <CourseCoverImage
          :course="course"
          fill
          instant
          loading="eager"
          class="profile-course-card__cover"
        />
      </div>

      <div class="profile-course-card__main col">
        <div class="row items-start justify-between no-wrap">
          <div class="col">
            <div class="profile-course-card__title text-subtitle1 text-weight-bolder text-dark">
              {{ courseCode }} : {{ title }}
            </div>
            <div class="row items-center q-gutter-x-sm q-mt-xs">
              <q-badge v-if="status" :color="getStatusColor(status)" class="badge-pill">
                {{ getStatusLabel(status) }}
              </q-badge>
              <q-badge
                v-for="mode in deliveryModes"
                :key="mode"
                :color="getModeColor(mode)"
                class="badge-pill"
              >
                {{ getModeLabel(mode) }}
              </q-badge>
              <q-badge v-if="seatInfo" :color="seatInfo.color" class="badge-pill">
                {{ seatInfo.label }}
              </q-badge>
            </div>
          </div>
        </div>

        <div
          v-if="registeredAtLabel"
          class="q-mt-md row items-center q-gutter-md text-caption text-grey-6"
        >
          <div class="row items-center q-gutter-xs">
            <q-icon name="event" size="14px" color="grey-5" />
            <span>{{ registeredAtLabel }}</span>
          </div>
        </div>

        <div v-if="progressPercent !== null" class="profile-course-card__progress q-mt-md">
          <div class="row items-center justify-between q-gutter-sm q-mb-xs">
            <div class="text-caption text-grey-7 text-weight-medium">
              {{ progressLabel || t('profile.courses.progress') }}
            </div>
            <div class="row items-center q-gutter-xs">
              <q-badge :color="progressColor" class="badge-pill">
                {{ progressStatusLabel }}
              </q-badge>
              <span class="text-caption text-weight-bold" :class="`text-${progressColor}`">
                {{ progressPercent }}%
              </span>
            </div>
          </div>
          <q-linear-progress
            rounded
            size="8px"
            :value="progressPercent / 100"
            :color="progressColor"
            track-color="grey-2"
          />
          <div v-if="progressDetailLabel" class="text-caption text-grey-6 q-mt-xs">
            {{ progressDetailLabel }}
          </div>
        </div>

        <template v-if="hasActions">
          <q-separator class="q-mt-md" />
          <div class="profile-course-card__actions row items-center q-gutter-sm q-mt-sm q-pb-xs">
            <slot name="actions" />
          </div>
        </template>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import type { CourseCover } from 'src/types/course';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

interface ProfileCourseCardCourse {
  title: string;
  imageUrl: string;
  imageCrop?: string | null;
  cover: CourseCover;
}

interface Props {
  course: ProfileCourseCardCourse;
  courseCode: string;
  title: string;
  status?: string;
  deliveryModes?: string[];
  registeredAtLabel?: string;
  maxSeats?: number | null;
  enrolledCount?: number | null;
  progressPercent?: number | null;
  progressLabel?: string;
  progressDetailLabel?: string;
  progressStatusLabel?: string;
  progressColor?: 'primary' | 'positive' | 'warning' | 'info';
  layout?: 'default' | 'compact';
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  status: '',
  deliveryModes: () => [],
  registeredAtLabel: '',
  maxSeats: null,
  enrolledCount: null,
  progressPercent: null,
  progressLabel: '',
  progressDetailLabel: '',
  progressStatusLabel: '',
  progressColor: 'primary',
  layout: 'default',
  active: false,
});

const slots = useSlots();

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    ประกาศนียบัตร: 'blue-grey-8',
    สะสมหน่วยกิต: 'amber-8',
    เปิดรับสมัคร: 'positive',
  };
  return colorMap[status] ?? 'grey';
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    ประกาศนียบัตร: t('statusCert'),
    สะสมหน่วยกิต: t('statusCredit'),
    เปิดรับสมัคร: t('statusOpen'),
  };
  return map[status] || status;
}

function getModeColor(mode: string): string {
  const colorMap: Record<string, string> = {
    Online: 'teal-7',
    Onsite: 'red-7',
    'Self-Paced Learning': 'blue-7',
  };
  return colorMap[mode] ?? 'grey';
}

function getModeLabel(mode: string): string {
  const map: Record<string, string> = {
    Online: t('deliveryModeOnline'),
    Onsite: t('deliveryModeOnsite'),
    'Self-Paced Learning': t('deliveryModeSelfPaced'),
  };
  return map[mode] || mode;
}

const seatInfo = computed<{ label: string; color: string } | null>(() => {
  if (props.maxSeats === null || props.enrolledCount === null || props.maxSeats <= 0) {
    return null;
  }

  const remaining = props.maxSeats - props.enrolledCount;
  if (remaining <= 0) {
    return { label: t('seatFull'), color: 'red-8' };
  }
  if (remaining <= 5) {
    return { label: t('seatAlmostFull', { count: remaining }), color: 'orange-9' };
  }
  return { label: t('seatAvailable', { count: remaining }), color: 'green-6' };
});

const isCompact = computed<boolean>(() => props.layout === 'compact');
const hasActions = computed<boolean>(() => Boolean(slots.actions));

const progressStatusLabel = computed<string>(() => {
  if (props.progressStatusLabel) {
    return props.progressStatusLabel;
  }

  if (props.progressPercent === null) {
    return '';
  }

  return props.progressPercent >= 100 ? t('learning.completed') : t('profile.courses.inProgress');
});
</script>

<style lang="scss" scoped>
.profile-course-card {
  position: relative;
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  height: 100%;
  background: #ffffff;
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba($primary, 0.42) !important;
    box-shadow: 0 14px 28px rgba(17, 24, 39, 0.08);
  }

  &--active {
    border-color: rgba($primary, 0.35) !important;
    box-shadow: 0 12px 24px rgba(17, 24, 39, 0.08);
  }

  &__stripe {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 5px;
    background: linear-gradient(180deg, $primary, #c4850e);
    border-radius: 4px 0 0 4px;
  }

  &__thumb {
    width: 154px;
    height: 94px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__body {
    padding: 18px 18px 16px 26px;
  }

  &__main {
    min-width: 0;
  }

  &__cover {
    width: 100%;
    height: 100%;
  }

  &__compact-cover {
    width: 100%;
    flex-shrink: 0;
  }

  &__compact-body {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  &__compact-actions {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  &__title {
    color: #2f3137 !important;
    line-height: 1.4;
    font-size: 1.04rem;
    font-weight: 800;
  }

  &__progress {
    max-width: 500px;
  }

  &__actions {
    min-height: 56px;
    padding-top: 12px;

    :deep(.q-space) {
      flex: 1 1 auto;
    }

    :deep(.q-btn) {
      min-height: 38px;
      border-radius: 10px !important;
    }

    :deep(.q-btn .q-icon) {
      font-size: 20px;
    }
  }
}

.profile-course-card--compact {
  .profile-course-card__stripe {
    left: 0;
    right: 0;
    top: 0;
    bottom: auto;
    width: auto;
    height: 4px;
    border-radius: 4px 4px 0 0;
  }

  .profile-course-card__title {
    min-height: 2.8em;
  }

  .profile-course-card__progress {
    max-width: none;
  }
}

@media (max-width: 767px) {
  .profile-course-card {
    &__thumb {
      width: 56px;
      height: 56px;
      border-radius: 12px;
    }
  }
}
</style>
