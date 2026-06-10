<template>
  <q-page class="unsupported-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="activityTitle"
      with-back
    />

    <div class="content-area section-container">
      <div class="unsupported-panel">
        <q-icon :name="moduleConfig.icon" size="52px" color="primary" />
        <h1 class="unsupported-panel__title">{{ activityTitle }}</h1>
        <q-chip dense color="grey-2" text-color="grey-8" class="q-mb-md">
          {{ moduleConfig.label }} ({{ modname }})
        </q-chip>
        <p class="unsupported-panel__reason">
          {{ moduleConfig.reason || 'กิจกรรมชนิดนี้ยังไม่รองรับการเปิดในแอป' }}
        </p>
        <BaseButton
          color="primary"
          no-caps
          icon="open_in_new"
          label="เปิดใน Moodle"
          :loading="opening"
          :disable="!moodleUrl"
          @click="openInMoodle"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import BaseButton from 'components/base/BaseButton.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useMoodleSso } from 'src/composables/use-moodle-sso';
import { getMoodleModuleTypeConfig } from 'src/utils/moodle-module-registry';

const route = useRoute();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const { getMoodleActivityUrl } = useMoodleSso();
const opening = ref(false);

function queryStr(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});
const currentCourse = computed(() =>
  courseId.value ? courseStore.getCourseDetailById(courseId.value) : null,
);
const courseTitle = computed<string>(() => currentCourse.value?.title || 'รายวิชา');
const activityTitle = computed<string>(() => queryStr(route.query.title) || 'กิจกรรม Moodle');
const modname = computed<string>(() => queryStr(route.query.modname) || 'unknown');
const moodleUrl = computed<string>(() => queryStr(route.query.moodleUrl));
const moodleCourseId = computed<number | null>(() => {
  const fromCourse = currentCourse.value?.moodleId;
  if (fromCourse) return fromCourse;
  const fromQuery = Number(queryStr(route.query.moodleCourseId));
  return fromQuery > 0 ? fromQuery : null;
});
const moduleConfig = computed(() => getMoodleModuleTypeConfig(modname.value));

async function openInMoodle(): Promise<void> {
  if (!moodleUrl.value) return;
  opening.value = true;
  try {
    const username = authStore.user?.username || authStore.user?.email || '';
    const ssoUrl =
      moodleCourseId.value && username
        ? await getMoodleActivityUrl(moodleCourseId.value, username, moodleUrl.value)
        : null;
    window.open(ssoUrl || moodleUrl.value, '_blank');
  } finally {
    opening.value = false;
  }
}
</script>

<style lang="scss" scoped>
.unsupported-page {
  min-height: calc(100vh - 64px);
}

.unsupported-panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  background: #fff;
}

.unsupported-panel__title {
  margin: 16px 0 8px;
  font-size: 1.45rem;
  line-height: 1.25;
  font-weight: 700;
  color: #1f2937;
}

.unsupported-panel__reason {
  max-width: 540px;
  margin: 0 auto 24px;
  color: #667085;
  line-height: 1.7;
}
</style>
