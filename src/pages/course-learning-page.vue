<template>
  <q-page class="bg-grey-1 course-page overflow-hidden">
    <!-- Course Toolbar -->
    <CourseLayout @toggleDrawer="leftDrawerOpen = !leftDrawerOpen" />

    <!-- Inner layout for sidebar drawer + content -->
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
      class="learning-layout"
    >
      <!-- Sidebar Navigation (Drawer) -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <div class="content-area" :class="contentAreaClass" :style="contentAreaStyle">
          <div v-if="moodleUrl" class="moodle-wrapper">
            <iframe
              class="moodle-frame"
              :src="moodleUrl"
              title="Moodle course content"
              allow="fullscreen; clipboard-write"
            />
          </div>

          <!-- Course Content -->
          <div v-else class="course-content-wrapper">
            <!-- Breadcrumbs -->
            <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
              <template v-slot:separator>
                <q-icon size="1.4em" name="chevron_right" color="grey-4" />
              </template>
              <q-breadcrumbs-el
                label="หน้าแรก"
                icon="home"
                to="/course-home"
                class="breadcrumb-link"
              />
              <q-breadcrumbs-el :label="courseTitle" class="text-weight-bold text-dark q-px-sm" />
            </q-breadcrumbs>

            <div class="row items-center justify-between q-mb-xl">
              <div class="row items-center">
                <div class="title-accent bg-primary q-mr-md"></div>
                <div>
                  <h2 class="text-h5 text-weight-bolder text-dark q-my-none">
                    {{ $t('learning.content') }}
                  </h2>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ $t('learning.manageContent') || 'จัดการเนื้อหาบทเรียนและการเรียนรู้ของคุณ' }}
                  </div>
                </div>
              </div>
              <q-btn
                unelevated
                color="primary"
                no-caps
                :icon="allExpanded ? 'expand_less' : 'expand_more'"
                :label="allExpanded ? $t('learning.collapseAll') : $t('learning.expandAll')"
                @click="toggleAll"
                class="expand-btn-modern shadow-2"
              />
            </div>

            <q-list class="course-list-modern">
              <q-expansion-item
                v-for="(module, index) in courseModulesWithProgress"
                :key="index"
                v-model="courseModules[index]!.expanded"
                class="module-item-modern q-mb-md"
                header-class="module-header-modern q-pa-lg"
                expand-icon-class="text-primary"
              >
                <template v-slot:header>
                  <q-item-section avatar>
                    <div
                      class="module-icon-box"
                      :class="`bg-${module.color || 'primary'}-1 text-${module.color || 'primary'}`"
                    >
                      <q-icon :name="module.icon || 'folder_open'" size="22px" />
                    </div>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-h6 text-weight-bold text-dark">{{
                      module.title
                    }}</q-item-label>
                    <q-item-label
                      caption
                      v-if="module.subtitle"
                      class="text-grey-6 text-subtitle2 q-mt-xs"
                    >
                      {{ module.subtitle }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row items-center q-gutter-sm">
                      <span class="text-caption text-grey-6 gt-xs"
                        >{{ module.lessons.length }} {{ $t('learning.lessons') }}</span
                      >
                      <q-circular-progress
                        v-if="module.progress !== undefined"
                        :value="module.progress"
                        size="28px"
                        :thickness="0.3"
                        :color="module.progress === 100 ? 'positive' : 'primary'"
                        track-color="grey-2"
                      />
                    </div>
                  </q-item-section>
                </template>

                <div class="lessons-container bg-white">
                  <q-list separator>
                    <q-item
                      v-for="(lesson, lIndex) in module.lessons"
                      :key="lIndex"
                      clickable
                      v-ripple
                      class="lesson-row q-py-lg q-px-xl"
                      @click="navigateToLesson(lesson)"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="
                            lesson.type === 'video'
                              ? 'play_circle'
                              : lesson.type === 'quiz'
                                ? 'help_outline'
                                : 'article'
                          "
                          :color="lesson.isCompleted ? 'positive' : 'grey-5'"
                          size="sm"
                        />
                      </q-item-section>

                      <q-item-section>
                        <q-item-label
                          class="text-subtitle1"
                          :class="{
                            'text-grey-5 text-strike': lesson.isCompleted,
                            'text-dark text-weight-medium': !lesson.isCompleted,
                          }"
                        >
                          {{ lesson.title }}
                        </q-item-label>
                        <q-item-label caption class="row items-center q-mt-xs text-grey-6">
                          <q-icon name="history" size="14px" class="q-mr-xs" />
                          {{ lesson.duration }}
                        </q-item-label>
                      </q-item-section>

                      <q-item-section side>
                        <q-btn
                          flat
                          round
                          dense
                          :icon="lesson.isCompleted ? 'check_circle' : 'panorama_fish_eye'"
                          :color="lesson.isCompleted ? 'positive' : 'grey-4'"
                          @click.stop="
                            progressStore.toggleLessonCompletion(courseId || '', lesson.title)
                          "
                          size="sm"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-expansion-item>
            </q-list>
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import SidebarNavigation from 'components/navigation/sidebar-navigation.vue';
import CourseLayout from 'layouts/course-layout.vue';
import { getCourseDetailById } from 'src/data/mock-courses';
import { getCourseStructure, type CourseModule, type Lesson } from 'src/data/course-structure';
import { useUiStore } from 'src/stores/ui-store';

const router = useRouter();
const route = useRoute();
const progressStore = useCourseProgressStore();

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});

const courseTitle = computed(() => currentCourse.value?.title || 'Course Learning');
const moodleUrl = computed(() => {
  const value = route.query.moodleUrl;
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
});

const leftDrawerOpen = ref(false);
const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});
const contentAreaClass = computed(() => [
  isFullscreen.value ? 'content-fullscreen' : 'section-container content-standard',
  { 'content-area--moodle': Boolean(moodleUrl.value) },
]);
const contentAreaStyle = computed(() => ({
  paddingTop: moodleUrl.value ? '0' : '64px',
  paddingBottom: moodleUrl.value ? '0' : '64px',
}));

interface CourseModuleState extends CourseModule {
  expanded: boolean;
}

const courseModules = ref<CourseModuleState[]>([]);

watch(
  courseId,
  (newId) => {
    if (newId) {
      courseModules.value = getCourseStructure(newId).map((m) => ({
        ...m,
        expanded: false,
      }));
    }
  },
  { immediate: true },
);

const courseModulesWithProgress = computed(() => {
  const cid = courseId.value;
  if (!cid) return [];

  return courseModules.value.map((module) => {
    const total = module.lessons.length;
    let completedCount = 0;

    const lessonsWithProgress = module.lessons.map((lesson) => {
      const isCompleted = progressStore.isLessonCompleted(cid, lesson.title);
      if (isCompleted) completedCount++;
      return {
        ...lesson,
        isCompleted,
      };
    });

    const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
      ...module,
      lessons: lessonsWithProgress,
      progress,
    };
  });
});

const allExpanded = computed(() => {
  return courseModules.value.every((m) => m.expanded);
});

const toggleAll = () => {
  const targetState = !allExpanded.value;
  courseModules.value.forEach((m) => {
    m.expanded = targetState;
  });
};

const navigateToLesson = async (lesson: Lesson) => {
  const courseIdValue = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  if (!courseIdValue) return;

  const lessonId = encodeURIComponent(lesson.title);

  if (lesson.type === 'video') {
    await router.push(`/course/${courseIdValue}/video/${lessonId}`);
  } else if (lesson.type === 'quiz') {
    await router.push(`/course/${courseIdValue}/quiz/${lessonId}`);
  }
};
</script>

<style lang="scss" scoped>
.course-page {
  height: 100vh;
  overflow: hidden;
  background-color: #f8f6f1;

  // The toolbar is now outside q-layout, so q-page must fill 100vh
  display: flex;
  flex-direction: column;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

// View Mode
.content-area {
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.content-area--moodle {
  max-width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.moodle-wrapper {
  width: 100%;
  height: calc(100vh - 72px);
  min-height: 520px;
  background: #fff;
}

.moodle-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.content-fullscreen {
  padding-left: 32px;
  padding-right: 32px;
  max-width: 100% !important;
  margin: 0 !important;
}

.menu-toggle-btn {
  color: #5c3d00;
  transition:
    color 0.2s ease,
    background 0.2s ease;

  &:hover {
    color: #3d2600;
    background: rgba(255, 255, 255, 0.4) !important;
  }
}

.view-toggle-group {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  padding: 4px;
}

.view-btn-active {
  background: rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px !important;
}

.view-btn-inactive {
  color: rgba(255, 255, 255, 0.65) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;

  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.12) !important;
  }
}

// Breadcrumbs
.modern-breadcrumbs {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.01em;

  .breadcrumb-link {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: inherit;

    &:hover {
      color: var(--q-primary) !important;
      background: rgba(var(--q-primary), 0.08);
    }
  }

  .q-breadcrumbs__el-icon {
    margin-right: 8px;
    font-size: 1.2rem;
  }
}

// Content Layout
.title-accent {
  width: 8px;
  height: 40px;
  border-radius: 4px;
}

// Modern Header
.course-header-modern {
  background: linear-gradient(135deg, #1a237e 0%, #303f9f 100%);
  border-radius: 32px;
  padding: 60px;
  box-shadow: 0 20px 50px rgba(26, 35, 126, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
}

.header-visual {
  .avatar-glow {
    position: relative;
    &::after {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      z-index: 0;
      animation: pulse 3s infinite;
    }
  }
  .q-avatar {
    z-index: 1;
    border: 6px solid rgba(255, 255, 255, 0.2);
  }
}

.header-title {
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.progress-circle {
  background: rgba(255, 255, 255, 0.05);
  padding: 5px;
  border-radius: 50%;
}

// Content Layout
.title-accent {
  width: 8px;
  height: 40px;
  border-radius: 4px;
}

.expand-btn-modern {
  border-radius: 12px;
  padding: 8px 24px;
  font-weight: 700;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba($primary, 0.3);
  }
}

// Modern Accordion
.module-item-modern {
  border-radius: 20px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
    border-color: rgba($primary, 0.2);
  }

  &.q-expansion-item--expanded {
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: rgba($primary, 0.1);
  }
}

.module-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.module-item-modern:hover .module-icon-box {
  transform: rotate(-5deg) scale(1.1);
}

.lesson-row {
  border-left: 4px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba($primary, 0.02);
    border-left-color: $primary;
    padding-left: 56px;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.2;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}

.shadow-15 {
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.border-radius-10 {
  border-radius: 10px;
}
</style>
