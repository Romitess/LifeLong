<template>
  <div class="course-page-header">
    <div class="course-page-header__inner section-container">
      <q-btn
        v-if="withBack"
        flat
        round
        dense
        icon="arrow_back"
        color="grey-7"
        aria-label="ย้อนกลับ"
        class="course-page-header__back"
        @click="goBack"
      />
      <CourseBreadcrumb :course-id="courseId" :course-title="courseTitle" :current="current" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import CourseBreadcrumb from './CourseBreadcrumb.vue';

interface Props {
  courseId: string;
  courseTitle: string;
  current?: string;
  withBack?: boolean;
}

const props = withDefaults(defineProps<Props>(), { current: '', withBack: false });

const router = useRouter();

// Back = the breadcrumb node before the current leaf:
//  - sub-page (has `current`) → course learn page
//  - learn page (no `current`) → "วิชาของฉัน"
function goBack(): void {
  void router.push(props.current ? `/course/${props.courseId}/learn` : '/profile/courses');
}
</script>

<style lang="scss" scoped>
.course-page-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);

  &__inner {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
  }

  &__back {
    flex-shrink: 0;
  }
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}
</style>
