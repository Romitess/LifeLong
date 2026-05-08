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
        <!-- Wrap everything in section-container to match main-page padding (max-width 1400px, 24px sides) -->
        <div
          class="content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 64px; padding-bottom: 64px"
        >
          <!-- Course Content -->
          <div class="course-content-wrapper">
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

const leftDrawerOpen = ref(false);
const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});

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

.nav-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
}

.nav-actions__language {
  flex: 0 0 auto;
}

.nav-user-group {
  display: grid;
  grid-template-columns: minmax(0, 172px) 36px 36px;
  align-items: center;
  flex: 0 0 auto;
  column-gap: 10px;
  justify-content: end;
  height: 46px;
  min-height: 46px;
  width: auto;
  padding: 4px 10px 4px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-profile-summary {
  justify-self: start;
  width: 100%;
  min-width: 0;
}

.nav-profile-name {
  display: block;
  width: 100%;
  font-size: 0.8rem;
  font-weight: 700;
  color: #3d2600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.nav-profile-role {
  display: block;
  width: 100%;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(61, 38, 0, 0.55);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.nav-profile-avatar {
  outline: 2.5px solid #ffffff;
  outline-offset: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden !important;
  border-radius: 50% !important;
  flex-shrink: 0;
}

.profile-menu-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.nav-notification-btn {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  min-height: 36px;
  color: #5c3d00 !important;
  background: rgba(255, 255, 255, 0.72) !important;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    background: #ffffff !important;
    box-shadow: 0 6px 16px rgba(17, 24, 39, 0.1);
  }
}

.nav-notification-badge {
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 17px;
}

.profile-action-menu {
  border-radius: 14px;
  box-shadow: 0 16px 38px rgba(17, 24, 39, 0.16);
}

.profile-action-card {
  width: 238px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #ffffff;
}

.profile-action-card__header {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: linear-gradient(180deg, rgba(247, 208, 70, 0.16), rgba(255, 255, 255, 0));
}

.profile-action-card__avatar {
  outline: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.1);
  background: $primary;
}
.profile-action-card__identity {
  min-width: 0;
}
.profile-action-card__name {
  overflow: hidden;
  color: #3d2600;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-action-card__role {
  overflow: hidden;
  margin-top: 2px;
  color: rgba(61, 38, 0, 0.58);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-action-card__list {
  padding: 6px;
}

.profile-action-card__item {
  min-height: 38px;
  border-radius: 10px;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 700;
  &:hover {
    color: #3d2600;
    background: rgba(247, 208, 70, 0.14);
  }
}

.profile-action-card__item-icon {
  min-width: 34px;
  padding-right: 8px;
  color: $primary;
}

.profile-action-card__item--danger {
  color: #b91c1c;
  .profile-action-card__item-icon {
    color: #dc2626;
  }
  &:hover {
    color: #991b1b;
    background: rgba(220, 38, 38, 0.08);
  }
}

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
