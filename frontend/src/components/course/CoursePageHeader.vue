<template>
  <div class="course-page-header">
    <div class="course-page-header__inner section-container">
      <CourseBreadcrumb :course-id="courseId" :course-title="courseTitle" :current="current" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CourseBreadcrumb from './CourseBreadcrumb.vue';

interface Props {
  courseId: string;
  courseTitle: string;
  current?: string;
  withBack?: boolean;
}

withDefaults(defineProps<Props>(), { current: '', withBack: false });
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
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}
</style>
