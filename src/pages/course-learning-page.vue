<template>
  <q-page class="bg-grey-1 course-page overflow-hidden">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
      class="learning-layout"
    >
      <!-- Course Toolbar (Header) - Synced with Main Layout -->
      <q-header elevated class="nav-bar text-white">
        <div class="section-container">
          <div class="row items-center no-wrap">
            <!-- Left: Menu toggle + Tabs -->
            <div class="row items-center no-wrap col">
              <div
                class="menu-toggle-btn cursor-pointer row items-center justify-center"
                @click="leftDrawerOpen = !leftDrawerOpen"
              >
                <q-icon name="menu" size="20px" />
              </div>

              <q-tabs
                v-model="activeNav"
                align="left"
                active-color="white"
                indicator-color="white"
                dense
                no-caps
                class="nav-tabs"
              >
                <q-tab
                  name="home"
                  icon="home"
                  :label="$t('learning.home')"
                  class="nav-tab"
                  @click="$router.push('/course-home')"
                />

                <q-tab
                  name="my-courses"
                  icon="auto_stories"
                  :label="$t('learning.myCourses')"
                  class="nav-tab"
                  @mouseenter="openMenu"
                  @mouseleave="closeMenu"
                >
                  <q-menu
                    v-model="myCoursesMenu"
                    @mouseenter="openMenu"
                    @mouseleave="closeMenu"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    fit
                    class="my-courses-dropdown shadow-10"
                    :offset="[0, 8]"
                  >
                    <q-list style="min-width: 320px" class="q-py-sm">
                      <div class="text-overline q-px-md q-pb-sm text-grey-6 letter-spacing-1">
                        {{ $t('profile.courses.registeredTitle') }}
                      </div>
                      <q-item
                        v-for="course in registeredCourses"
                        :key="course.id"
                        clickable
                        v-ripple
                        @click="$router.push(`/course/${course.id}/learn`)"
                        class="course-menu-item q-mx-sm border-radius-10"
                        :active="course.id === courseId"
                        active-class="bg-blue-1 text-primary"
                      >
                        <q-item-section avatar>
                          <q-avatar
                            :icon="course.cover.icon"
                            :color="course.id === courseId ? 'primary' : 'grey-2'"
                            :text-color="course.id === courseId ? 'white' : 'grey-7'"
                            size="32px"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label lines="1" class="text-weight-bold">{{
                            course.title
                          }}</q-item-label>
                          <q-item-label caption>{{ course.code }}</q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="course.id === courseId">
                          <q-icon name="check_circle" color="primary" size="20px" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="registeredCourses.length === 0"
                        class="text-grey-6 text-center q-pa-md"
                      >
                        {{ $t('profile.courses.empty') }}
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-tab>

                <q-tab
                  name="this-course"
                  icon="school"
                  :label="$t('learning.thisCourse')"
                  class="nav-tab"
                  @mouseenter="openThisCourseMenu"
                  @mouseleave="closeThisCourseMenu"
                >
                  <q-menu
                    v-model="thisCourseMenu"
                    @mouseenter="openThisCourseMenu"
                    @mouseleave="closeThisCourseMenu"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                    class="this-course-dropdown shadow-12"
                    :offset="[0, 0]"
                    square
                  >
                    <q-list style="min-width: 220px" class="q-py-sm">
                      <!-- Sections with sub-arrow -->
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="format_list_numbered" size="20px" color="grey-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.sections')
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-icon name="chevron_right" size="18px" color="grey-5" />
                        </q-item-section>
                      </q-item>

                      <!-- Participants -->
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="groups" size="20px" color="deep-purple-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.participants')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Grades -->
                      <q-item
                        clickable
                        v-ripple
                        class="this-course-menu-item"
                        @click="$router.push(`/course/${courseId}/grades`)"
                      >
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="grid_on" size="20px" color="teal-6" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.grades')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Forum -->
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="forum" size="20px" color="blue-grey-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.forum')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Content -->
                      <q-item
                        clickable
                        v-ripple
                        class="this-course-menu-item"
                        @click="$router.push(`/course/${courseId}/learn`)"
                      >
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="description" size="20px" color="orange-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.content')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <!-- Quiz -->
                      <q-item clickable v-ripple class="this-course-menu-item">
                        <q-item-section avatar class="this-course-icon-section">
                          <q-icon name="manage_accounts" size="20px" color="deep-orange-5" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            $t('thisCourse.quiz')
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-tab>

                <q-tab
                  name="lll-system"
                  icon="stars"
                  :label="$t('learning.systemTitle')"
                  class="nav-tab"
                  @click="$router.push('/profile')"
                />
              </q-tabs>
            </div>

            <!-- Right: View Mode Toggle -->
            <div class="view-toggle-group row items-center q-gutter-xs q-pr-sm">
              <q-btn
                :flat="isFullscreen"
                :unelevated="!isFullscreen"
                round
                dense
                icon="view_agenda"
                size="sm"
                :class="!isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
                @click="isFullscreen = false"
              >
                <q-tooltip
                  anchor="bottom middle"
                  self="top middle"
                  :offset="[0, 8]"
                  class="bg-dark text-white text-caption"
                >
                  มุมมองมาตรฐาน
                </q-tooltip>
              </q-btn>
              <q-btn
                :flat="!isFullscreen"
                :unelevated="isFullscreen"
                round
                dense
                icon="fullscreen"
                size="sm"
                :class="isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
                @click="isFullscreen = true"
              >
                <q-tooltip
                  anchor="bottom middle"
                  self="top middle"
                  :offset="[0, 8]"
                  class="bg-dark text-white text-caption"
                >
                  มุมมองเต็มหน้าจอ
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </q-header>

      <!-- Sidebar Navigation (Drawer) -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <div
          class="q-pb-xl content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 50px"
        >
          <!-- Course Content -->
          <div class="course-content-wrapper row justify-center">
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
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
                <!-- <q-breadcrumbs-el
                  label="This course"
                  icon="school"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${courseId}/learn`)"
                /> -->
                <q-breadcrumbs-el :label="courseTitle" class="text-weight-bold text-dark q-px-sm" />
              </q-breadcrumbs>

              <div class="row items-center justify-between q-mb-xl">
                <div class="row items-center">
                  <div class="title-accent bg-primary q-mr-md"></div>
                  <h2 class="text-h4 text-weight-bolder text-dark q-my-none">
                    {{ $t('learning.content') }}
                  </h2>
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
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import { getCourseDetailById } from 'src/data/mock-courses';
import { getCourseStructure, type CourseModule, type Lesson } from 'src/data/course-structure';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import { useUiStore } from 'src/stores/ui-store';

const router = useRouter();
const route = useRoute();
const progressStore = useCourseProgressStore();
const { myRegisteredCourseEntries } = useMyRegisteredCourses();

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const registeredCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});

const courseTitle = computed(() => currentCourse.value?.title || 'Course Learning');

const activeNav = ref('this-course');
const leftDrawerOpen = ref(false);
const myCoursesMenu = ref(false);
const thisCourseMenu = ref(false);

const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});

let menuTimer: ReturnType<typeof setTimeout> | null = null;

const openMenu = () => {
  if (menuTimer) clearTimeout(menuTimer);
  myCoursesMenu.value = true;
};

const closeMenu = () => {
  menuTimer = setTimeout(() => {
    myCoursesMenu.value = false;
  }, 150);
};

let thisCourseMenuTimer: ReturnType<typeof setTimeout> | null = null;

const openThisCourseMenu = () => {
  if (thisCourseMenuTimer) clearTimeout(thisCourseMenuTimer);
  thisCourseMenu.value = true;
};

const closeThisCourseMenu = () => {
  thisCourseMenuTimer = setTimeout(() => {
    thisCourseMenu.value = false;
  }, 150);
};

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
  height: calc(100vh - 72px);
  overflow: hidden;
  background-color: #f8f9fa;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

// View Mode
.content-area {
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-standard {
  // inherits section-container max-width
}

.content-fullscreen {
  padding-left: 32px;
  padding-right: 32px;
  max-width: 100% !important;
  margin: 0 !important;
}

.view-toggle-group {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(4px);
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
.menu-toggle-btn {
  color: rgba(255, 255, 255, 0.8);
  min-height: 48px;
  padding: 0 16px; /* ระยะซ้ายขวาให้สมดุลกับแท็บอื่น */
  margin-right: 8px;
  transition: color 0.2s ease;

  &:hover {
    color: white; /* สว่างขึ้นตอนเมาส์ชี้ เหมือนปุ่มหน้าแรก */
  }
}
.nav-bar {
  background-color: var(--q-primary);
  min-height: 48px;
}

.nav-tabs {
  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    padding: 0 20px;
    min-width: 118px;
    min-height: 48px;
    font-size: 0.9rem;
    transition: color 0.2s ease;

    &.q-tab--active {
      color: white;
      font-weight: 700;
    }

    &:hover {
      color: white;
    }

    .q-icon {
      font-size: 1rem;
    }
  }
}

// ── This Course Dropdown ────────────────────────────────────
.this-course-dropdown {
  border-top: 3px solid var(--q-primary);
  border-radius: 0 0 12px 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden;
}

.this-course-menu-item {
  min-height: 48px;
  padding: 6px 16px;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(var(--q-primary-rgb, 26, 115, 232), 0.07);
    .q-item__label {
      color: var(--q-primary);
    }
  }
}

.this-course-icon-section {
  min-width: 36px !important;
  padding-right: 4px;
}

// ── Category Menu ───────────────────────────────────────────
.category-mega-menu {
  min-width: 960px;
  max-width: 95vw;
  border-top: 4px solid var(--q-primary);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.category-menu-content {
  background: white;
  padding: 32px;
}

.category-item {
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 4px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background: rgba(var(--q-primary), 0.08);
    transform: translateX(4px);
    .text-subtitle1 {
      color: var(--q-primary) !important;
    }
  }
}

.category-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  font-weight: 700;
  min-width: 28px;
  text-align: center;
}

.course-toolbar {
  backdrop-filter: blur(8px);
  z-index: 100;
}

.learning-layout {
  background-color: transparent;
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

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #e3f2fd;
    color: var(--q-primary);
  }
}

.border-radius-10 {
  border-radius: 10px;
}

@media (max-width: 959px) {
  .course-header-modern {
    padding: 40px 24px;
    text-align: center;
    .header-content {
      flex-direction: column;
    }
    .header-visual {
      margin-right: 0 !important;
      margin-bottom: 30px;
    }
    .header-text .row {
      justify-content: center;
    }
  }
}
</style>
