<template>
  <q-page class="unsupported-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="activityTitle"
      with-back
    />

    <div class="content-area section-container">
      <div class="unsupported-wrap">
        <BaseContentCard class="text-center q-py-xl">
          <q-icon :name="moduleConfig.icon" size="52px" color="primary" />
          <div class="text-h6 text-weight-bold text-grey-9 q-mt-md q-mb-xs">
            {{ activityTitle }}
          </div>
          <q-chip dense color="grey-2" text-color="grey-8" class="q-mb-md">
            {{ moduleConfig.label }} ({{ modname }})
          </q-chip>
          <p class="unsupported-reason text-grey-7 q-mx-auto q-mb-lg">
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
        </BaseContentCard>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import BaseButton from 'components/base/BaseButton.vue';
import BaseContentCard from 'components/base/BaseContentCard.vue';
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

.unsupported-wrap {
  max-width: 720px;
  margin: 0 auto;
}

.unsupported-reason {
  max-width: 540px;
  line-height: 1.7;
}
</style>
