<template>
  <q-page class="bg-grey-1 course-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
      class="learning-layout"
    >
      <q-page-container>
        <CoursePageHeader
          :course-id="String($route.params.id)"
          :course-title="courseTitle"
          :current="`${$t('learning.videoLesson')} ${lessonTitle}`"
          with-back
        />
        <div
          class="content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 64px; padding-bottom: 64px"
        >
          <!-- Video Content -->
          <div class="video-content-wrapper row">
            <div class="col-12">
              <div class="row items-center justify-between q-mb-xl">
                <div class="row items-center">
                  <div class="title-accent bg-primary q-mr-md"></div>
                  <div>
                    <h2 class="text-h5 text-weight-bolder text-dark q-my-none">
                      {{ $t('learning.videoLesson') }} {{ lessonTitle }}
                    </h2>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('learning.manageVideo') || 'เรียนรู้ผ่านสื่อวิดีโอคุณภาพสูง' }}
                    </div>
                  </div>
                </div>
                <q-btn
                  unelevated
                  :color="isCompleted ? 'positive' : 'grey-4'"
                  :icon="isCompleted ? 'check_circle' : 'panorama_fish_eye'"
                  :label="isCompleted ? $t('learning.completed') : $t('learning.markAsDone')"
                  no-caps
                  class="done-btn shadow-2"
                  @click="toggleDone"
                />
              </div>

              <!-- Video Player -->
              <div class="video-player-card shadow-10 q-mb-xl overflow-hidden">
                <q-video :ratio="16 / 9" :src="videoUrl" class="full-width" />
              </div>

              <!-- Activity Navigation -->
              <div
                class="activity-navigation row items-center justify-between q-mt-xl border-top-faint q-pt-lg"
              >
                <div
                  v-if="nav.prev"
                  class="nav-item cursor-pointer text-left col-5"
                  @click="navigateToActivity(nav.prev!)"
                >
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="chevron_left" size="sm" class="text-grey-6" />
                    <div>
                      <div
                        class="text-caption text-grey-6 uppercase text-weight-bold letter-spacing-1"
                      >
                        {{ $t('quiz.prevActivity') }}
                      </div>
                      <div class="text-subtitle2 text-dark">{{ nav.prev.title }}</div>
                    </div>
                  </div>
                </div>
                <div v-else class="col-5"></div>

                <div
                  v-if="nav.next"
                  class="nav-item cursor-pointer text-right col-5"
                  @click="navigateToActivity(nav.next!)"
                >
                  <div class="row items-center justify-end q-gutter-sm">
                    <div>
                      <div
                        class="text-caption text-grey-6 uppercase text-weight-bold letter-spacing-1"
                      >
                        {{ $t('quiz.nextActivity') }}
                      </div>
                      <div class="text-subtitle2 text-dark">{{ nav.next.title }}</div>
                    </div>
                    <q-icon name="chevron_right" size="sm" class="text-grey-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
// 1. Imports
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { getNavigation, type Lesson } from 'src/data/course-structure';
import { useUiStore } from 'src/stores/ui-store';
import { useCourseStore } from 'src/stores/course-store';

// 4. Logic/State Init
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const progressStore = useCourseProgressStore();
const courseStore = useCourseStore();
const uiStore = useUiStore();

// 5. Reactive State

// 6. Computed
const isFullscreen = computed<boolean>({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const videoId = computed<string>(() =>
  Array.isArray(route.params.videoId)
    ? (route.params.videoId[0] ?? '')
    : (route.params.videoId ?? ''),
);

const lessonTitle = computed<string>(() => decodeURIComponent(videoId.value || ''));

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return courseStore.getCourseDetailById(courseId.value);
});

const courseTitle = computed<string>(() => currentCourse.value?.title || 'Course');

const isCompleted = computed<boolean>(() => {
  if (!courseId.value || !lessonTitle.value) return false;
  return progressStore.isLessonCompleted(courseId.value, lessonTitle.value);
});

// Mock video mapping based on lesson title
const videoMapping: Record<string, string> = {
  // Canva AI
  'AI เข้ามาเปลี่ยนวงการออกแบบอย่างไร?': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Canva AI คืออะไร?': 'https://www.youtube.com/embed/P6FORpg0KVo',
  ภาพรวมของคอร์สเรียน: 'https://www.youtube.com/embed/2M-fC86vR2A',
  'Magic Design สำหรับโซเชียลมีเดีย': 'https://www.youtube.com/embed/Rk6_hdRtJOE',
  'Magic Studio ภาพรวม': 'https://www.youtube.com/embed/V6_yF8zNf-Y',
  'Text to Image สร้างภาพจากจินตนาการ': 'https://www.youtube.com/embed/S_8_fU6z17A',

  // Gemstones
  ความสำคัญของดวงดาวและธาตุ: 'https://www.youtube.com/embed/zH3_UByXpS8',
  ดาวนพเคราะห์และกำลังวัน: 'https://www.youtube.com/embed/P6FORpg0KVo',
  ความรู้พื้นฐานเรื่องอัญมณี: 'https://www.youtube.com/embed/V6_yF8zNf-Y',
  'นพเก้า: อัญมณีมงคลของไทย': 'https://www.youtube.com/embed/S_8_fU6z17A',
  อัญมณีเสริมดวงตามราศีเกิด: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  การเลือกอัญมณีให้เหมาะกับวันเกิด: 'https://www.youtube.com/embed/Rk6_hdRtJOE',

  // Recraft
  'Overview of Recraft.ai Features': 'https://www.youtube.com/embed/V6_yF8zNf-Y',
  'Understanding Vector Generation': 'https://www.youtube.com/embed/S_8_fU6z17A',
  'Writing Prompts for Illustration Styles': 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'Controlling Color and Detail with AI': 'https://www.youtube.com/embed/Rk6_hdRtJOE',
  'Exporting from Recraft to Illustrator': 'https://www.youtube.com/embed/P6FORpg0KVo',
  'Optimizing Paths and Layers': 'https://www.youtube.com/embed/2M-fC86vR2A',
};

const videoUrl = computed(() => {
  return videoMapping[lessonTitle.value] || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
});

const toggleDone = () => {
  if (!courseId.value || !lessonTitle.value) return;

  progressStore.toggleLessonCompletion(courseId.value, lessonTitle.value);

  if (isCompleted.value) {
    $q.notify({
      type: 'positive',
      message: 'ยินดีด้วย! คุณเรียนจบแล้ว',
      position: 'top',
      timeout: 2000,
    });
  }
};

const nav = computed(() => getNavigation(lessonTitle.value, courseId.value));

const navigateToActivity = (lesson: Lesson) => {
  const lessonId = encodeURIComponent(lesson.title);
  if (lesson.type === 'video') {
    void router.push(`/course/${courseId.value}/video/${lessonId}`);
  } else if (lesson.type === 'quiz') {
    void router.push(`/course/${courseId.value}/quiz/${lessonId}`);
  } else {
    // For articles or other types, go back to learn page or handle accordingly
    void router.push(`/course/${courseId.value}/learn`);
  }
};
</script>

<style lang="scss" scoped>
.course-page {
  height: calc(100vh - 72px);
  overflow: hidden;
  background-color: #f8f9fa;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.title-accent {
  width: 8px;
  height: 40px;
  border-radius: 4px;
}

.learning-layout {
  background-color: transparent;
}

.video-player-card {
  border-radius: 24px;
  background: #000;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.done-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 700;
}

.nav-item {
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
    .q-icon {
      color: var(--q-primary) !important;
      transform: translateX(-4px);
    }
  }

  &.text-right:hover .q-icon {
    transform: translateX(4px);
  }
}

.border-top-faint {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.lh-sm {
  line-height: 1.3;
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #fff8ed;
    color: #f5a623;
  }
}

.border-radius-10 {
  border-radius: 10px;
}
</style>
