<template>
  <section class="recommended-courses">
    <div class="section-container">
      <q-card flat bordered class="recommended-card">
        <q-card-section class="recommended-card__body">
          <div class="recommended-courses__header">
            <div class="recommended-courses__heading">
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
        </q-card-section>
      </q-card>
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
  background: transparent;
  padding: 0 0 40px;
}

.recommended-card {
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;

  &__body {
    padding: 28px;
  }
}

.recommended-courses {
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

  .recommended-card__body {
    padding: 18px;
  }
}
</style>
