<template>
  <q-page class="bg-grey-1 course-page overflow-hidden">
    <q-layout view="lHh Lpr lFf" container style="height: 100vh" class="learning-layout">
      <!-- Sidebar Navigation (Drawer) -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <div class="course-breadcrumb-bar">
          <div class="course-breadcrumb-inner section-container">
            <nav class="breadcrumb-nav" aria-label="Course breadcrumb">
              <RouterLink to="/course-home" class="breadcrumb-el">
                <q-icon name="home" size="18px" />
                <span>หน้าแรก</span>
              </RouterLink>
              <q-icon name="chevron_right" size="16px" color="grey-4" />
              <span class="breadcrumb-el breadcrumb-el--current">{{ courseTitle }}</span>
            </nav>
          </div>
        </div>

        <div class="content-area section-container content-standard">
          <!-- Course Content -->
          <div class="course-content-wrapper">
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

            <!-- Loading state -->
            <div v-if="moodleContentsLoading" class="row justify-center q-py-xl">
              <q-spinner color="primary" size="40px" />
            </div>

            <q-list v-else class="course-list-modern">
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
                        <q-item-label
                          v-if="lesson.duration"
                          caption
                          class="row items-center q-mt-xs text-grey-6"
                        >
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
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import SidebarNavigation from 'components/navigation/sidebar-navigation.vue';
import { getCourseStructure, type CourseModule, type Lesson } from 'src/data/course-structure';
import { useCourseStore } from 'src/stores/course-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useMoodleSso } from 'src/composables/use-moodle-sso';
import { useMoodleCourseContents } from 'src/composables/use-moodle-course-contents';

interface CourseModuleState extends CourseModule {
  expanded: boolean;
}

const router = useRouter();
const route = useRoute();
const progressStore = useCourseProgressStore();
const courseStore = useCourseStore();
const authStore = useAuthStore();
const { getMoodleActivityUrl } = useMoodleSso();
const {
  sections: moodleSections,
  loading: moodleContentsLoading,
  fetchSections,
} = useMoodleCourseContents();

const leftDrawerOpen = ref(false);
const courseModules = ref<CourseModuleState[]>([]);

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return courseStore.getCourseDetailById(courseId.value);
});

const courseTitle = computed<string>(() => currentCourse.value?.title || 'Course Learning');

const courseModulesWithProgress = computed(() => {
  const cid = courseId.value;
  if (!cid) return [];

  return courseModules.value.map((module) => {
    const total = module.lessons.length;
    let completedCount = 0;

    const lessonsWithProgress = module.lessons.map((lesson) => {
      const isCompleted = progressStore.isLessonCompleted(cid, lesson.title);
      if (isCompleted) completedCount++;
      return { ...lesson, isCompleted };
    });

    const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return { ...module, lessons: lessonsWithProgress, progress };
  });
});

const allExpanded = computed<boolean>(() => courseModules.value.every((m) => m.expanded));

const toggleAll = (): void => {
  const targetState = !allExpanded.value;
  courseModules.value.forEach((m) => {
    m.expanded = targetState;
  });
};

const navigateToLesson = async (lesson: Lesson): Promise<void> => {
  const courseIdValue = courseId.value;
  if (!courseIdValue) return;

  // Moodle assignment or quiz → in-app activity page
  if (
    lesson.moodleModuleId &&
    (lesson.moodleModname === 'assign' || lesson.moodleModname === 'quiz')
  ) {
    const query: Record<string, string> = {
      title: encodeURIComponent(lesson.title),
      modname: lesson.moodleModname,
    };
    if (lesson.moodleUrl) query.moodleUrl = lesson.moodleUrl;
    const moodleId = currentCourse.value?.moodleId;
    if (moodleId) query.moodleCourseId = String(moodleId);

    await router.push({
      path: `/course/${courseIdValue}/assign/${lesson.moodleModuleId}`,
      query,
    });
    return;
  }

  // Other Moodle activities → open in new tab via SSO
  if (lesson.moodleUrl) {
    const moodleId = currentCourse.value?.moodleId;
    const username = authStore.user?.username || authStore.user?.email || '';

    if (moodleId && username) {
      const ssoUrl = await getMoodleActivityUrl(moodleId, username, lesson.moodleUrl);
      if (ssoUrl) {
        window.open(ssoUrl, '_blank');
        return;
      }
    }
    window.open(lesson.moodleUrl, '_blank');
    return;
  }

  const lessonId = encodeURIComponent(lesson.title);
  if (lesson.type === 'video') {
    await router.push(`/course/${courseIdValue}/video/${lessonId}`);
  } else if (lesson.type === 'quiz') {
    await router.push(`/course/${courseIdValue}/quiz/${lessonId}`);
  }
};

function getQueryString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

watch(
  [courseId, () => currentCourse.value?.moodleId] as const,
  async ([newId, newMoodleId], oldVal) => {
    if (!newId) return;

    const oldId = oldVal?.[0];
    if (newId !== oldId) {
      courseModules.value = getCourseStructure(newId).map((m) => ({ ...m, expanded: false }));
    }

    const moodleId = newMoodleId || Number(getQueryString(route.query.moodleCourseId)) || null;

    if (!moodleId) return;

    await fetchSections(moodleId);
    if (moodleSections.value.length > 0) {
      courseModules.value = moodleSections.value.map((m) => ({ ...m, expanded: false }));
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.course-page {
  height: calc(100vh - 64px);
  overflow: hidden;
  background-color: #f8f6f1;
}

// Breadcrumb Bar
.course-breadcrumb-bar {
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 10px 0;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.course-breadcrumb-inner {
  display: flex;
  align-items: center;
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-el {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  text-decoration: none;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--q-primary);
    background: rgba(247, 208, 70, 0.12);
  }

  &--current {
    color: #1a1a1a;
    font-weight: 700;
    cursor: default;

    &:hover {
      background: transparent;
      color: #1a1a1a;
    }
  }
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.content-area {
  padding-top: 64px;
  padding-bottom: 64px;
}

.content-standard {
  max-width: 1280px;
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
</style>
