<template>
  <div class="course-cover" :class="{ 'course-cover--fill': fill }" :style="coverStyle">
    <q-img
      v-if="course.imageUrl"
      :src="course.imageUrl"
      :ratio="imageRatio"
      :fit="fit"
      class="course-cover__image"
      :loading="loading"
      :no-transition="instant"
      :no-spinner="instant"
    >
      <template #error>
        <div class="course-cover__generated absolute-full">
          <q-icon :name="course.cover.icon" size="3rem" />
          <div class="course-cover__generated-title">{{ titleLabel }}</div>
        </div>
      </template>
    </q-img>
    <div v-else class="course-cover__generated">
      <q-icon :name="course.cover.icon" size="3rem" />
      <div class="course-cover__generated-title">{{ titleLabel }}</div>
    </div>

    <div class="course-cover__wash" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Course } from 'src/types/course';

type ImageFit = 'cover' | 'fill' | 'contain' | 'none' | 'scale-down';
type ImageLoading = 'eager' | 'lazy';

interface Props {
  course: Pick<Course, 'cover' | 'imageUrl' | 'title'>;
  ratio?: number;
  fit?: ImageFit;
  fill?: boolean;
  instant?: boolean;
  loading?: ImageLoading;
}

const props = withDefaults(defineProps<Props>(), {
  ratio: 16 / 9,
  fit: 'cover',
  fill: false,
  instant: false,
  loading: 'lazy',
});

const imageRatio = computed<number | undefined>(() => (props.fill ? undefined : props.ratio));

const coverStyle = computed<Record<string, string>>(() => ({
  '--cover-accent': props.course.cover.accentColor,
  '--cover-bg': props.course.cover.backgroundColor,
}));

const titleLabel = computed<string>(
  () => props.course.title.split('(')[0]?.trim() ?? props.course.title,
);
</script>

<style lang="scss" scoped>
.course-cover {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 14%, var(--cover-accent) 0, transparent 34%),
    linear-gradient(135deg, var(--cover-bg) 0%, #162130 100%);

  &--fill {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;

    .course-cover__image,
    .course-cover__generated {
      height: 100%;
    }
  }

  &__image {
    width: 100%;
  }

  &__generated {
    min-height: 180px;
    width: 100%;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px;
    text-align: center;
    background:
      radial-gradient(circle at 74% 24%, rgba(255, 255, 255, 0.18) 0, transparent 32%),
      linear-gradient(135deg, var(--cover-bg) 0%, #162130 100%);
  }

  &__generated-title {
    max-width: 86%;
    font-size: 0.95rem;
    font-weight: 700;
    line-height: 1.45;
    display: -webkit-box;
    overflow: hidden;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  &__wash {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(15, 23, 42, 0) 42%, rgba(15, 23, 42, 0.28) 100%),
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--cover-accent) 26%, transparent),
        transparent 46%
      );
  }
}
</style>
