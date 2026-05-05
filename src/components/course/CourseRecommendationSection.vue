<template>
  <section class="recommended-courses">
    <div class="section-container">
      <div class="recommended-courses__header">
        <div>
          <div class="recommended-courses__eyebrow">{{ $t('recommendedEyebrow') }}</div>
          <h2 class="recommended-courses__title">{{ $t('recommendedTitle') }}</h2>
        </div>
        <q-btn
          flat
          no-caps
          color="primary"
          icon-right="chevron_right"
          :label="$t('viewAll')"
          to="/short-courses"
        />
      </div>

      <div class="row q-col-gutter-lg">
        <div v-for="course in courses" :key="course.id" class="col-xs-12 col-sm-6 col-md-3">
          <BaseCourseCard :course="course" @click="emit('courseClick', course)" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BaseCourseCard from 'components/base/BaseCourseCard.vue';
import type { Course } from 'src/types/course';

interface Props {
  courses: Course[];
}

defineProps<Props>();

const emit = defineEmits<{
  courseClick: [course: Course];
}>();
</script>

<style lang="scss" scoped>
.recommended-courses {
  background: #f3f7f6;
  padding: 56px 0 64px;
  border-top: 1px solid rgba(35, 78, 112, 0.08);

  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 24px;
  }

  &__eyebrow {
    color: #6b7280;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  &__title {
    margin: 4px 0 0;
    color: #172033;
    font-size: 1.45rem;
    font-weight: 800;
    line-height: 1.35;
  }
}

@media (max-width: 767px) {
  .recommended-courses__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
