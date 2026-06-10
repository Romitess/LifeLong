<template>
  <q-page class="course-page">
    <!-- Sidebar overlay (mobile) -->
    <Transition name="fade">
      <div
        v-if="leftDrawerOpen"
        class="sidebar-overlay"
        aria-hidden="true"
        @click="leftDrawerOpen = false"
      />
    </Transition>

    <!-- Sliding sidebar panel -->
    <Transition name="slide-sidebar">
      <aside v-if="leftDrawerOpen" class="course-sidebar" aria-label="Course navigation">
        <div class="course-sidebar__header">
          <BaseButton
            flat
            round
            dense
            icon="chevron_left"
            color="grey-7"
            @click="leftDrawerOpen = false"
            aria-label="Close sidebar"
          />
        </div>
        <SidebarNavigation />
      </aside>
    </Transition>

    <!-- Main content -->
    <div class="course-main" :class="{ 'course-main--shifted': leftDrawerOpen && !isMobile }">
      <!-- Breadcrumb bar -->
      <CoursePageHeader :course-id="courseId" :course-title="courseTitle" with-back />

      <!-- Page content -->
      <div class="content-area section-container content-standard">
        <div class="course-content-wrapper">
          <div class="row justify-end q-mb-md">
            <BaseButton
              color="primary"
              no-caps
              :icon="allExpanded ? 'expand_less' : 'expand_more'"
              :label="allExpanded ? $t('learning.collapseAll') : $t('learning.expandAll')"
              @click="toggleAll"
              class="expand-btn-modern"
            />
          </div>

          <!-- Loading state -->
          <BaseSpinner v-if="moodleContentsLoading" />

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
                <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
                <div
                  v-if="module.summary"
                  class="chapter-summary q-px-xl q-pt-lg"
                  v-html="sanitizeHtml(module.summary)"
                />

                <!-- Nested subsections (หัวข้อย่อย) — collapsible -->
                <q-expansion-item
                  v-for="(sub, subIdx) in module.subsections"
                  :key="`sub-${subIdx}`"
                  default-opened
                  dense
                  class="subsection-item"
                  header-class="subsection-header"
                  expand-icon-class="text-grey-6"
                >
                  <template v-slot:header>
                    <q-item-section avatar class="subsection-header__avatar">
                      <q-icon name="subdirectory_arrow_right" size="18px" color="amber-8" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="subsection-title-text">{{ sub.title }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <span class="subsection-count">{{ sub.lessons.length }} รายการ</span>
                    </q-item-section>
                  </template>

                  <q-list v-if="sub.lessons.length" separator>
                    <q-item
                      v-for="(lesson, lIdx) in sub.lessons"
                      :key="`sub-${subIdx}-${lIdx}`"
                      clickable
                      v-ripple
                      class="lesson-row lesson-row--nested q-py-md q-px-xl"
                      @click="navigateToLesson(lesson)"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="getLessonIcon(lesson)"
                          :color="lesson.isCompleted ? 'positive' : 'grey-5'"
                          size="sm"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-subtitle1">
                          {{ lesson.title }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <!-- quiz/assign: read-only status badge -->
                        <BaseButton
                          v-if="
                            (lesson.moodleModname === 'quiz' ||
                              lesson.moodleModname === 'assign') &&
                            lesson.isCompleted
                          "
                          color="positive"
                          icon="check_circle"
                          label="เสร็จแล้ว"
                          no-caps
                          dense
                          disable
                          class="mark-done-btn"
                        />
                        <!-- other lessons: toggleable -->
                        <BaseButton
                          v-else-if="
                            lesson.moodleModname !== 'quiz' && lesson.moodleModname !== 'assign'
                          "
                          :outline="!lesson.isCompleted"
                          :color="lesson.isCompleted ? 'positive' : 'grey-7'"
                          :icon="lesson.isCompleted ? 'check_circle' : 'check_circle_outline'"
                          :label="lesson.isCompleted ? 'เสร็จแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'"
                          no-caps
                          dense
                          class="mark-done-btn"
                          @click.stop="
                            progressStore.toggleLessonCompletion(courseId || '', lesson.title)
                          "
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="subsection-empty">ยังไม่มีเนื้อหาในหัวข้อย่อยนี้</div>
                </q-expansion-item>

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
                        :name="getLessonIcon(lesson)"
                        :color="lesson.isCompleted ? 'positive' : 'grey-5'"
                        size="sm"
                      />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-subtitle1 text-dark text-weight-medium">
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
                      <!-- quiz/assign: read-only status badge -->
                      <BaseButton
                        v-if="
                          (lesson.moodleModname === 'quiz' || lesson.moodleModname === 'assign') &&
                          lesson.isCompleted
                        "
                        color="positive"
                        icon="check_circle"
                        label="เสร็จแล้ว"
                        no-caps
                        dense
                        disable
                        class="mark-done-btn"
                      />
                      <!-- other lessons: toggleable -->
                      <BaseButton
                        v-else-if="
                          lesson.moodleModname !== 'quiz' && lesson.moodleModname !== 'assign'
                        "
                        :outline="!lesson.isCompleted"
                        :color="lesson.isCompleted ? 'positive' : 'grey-7'"
                        :icon="lesson.isCompleted ? 'check_circle' : 'check_circle_outline'"
                        :label="lesson.isCompleted ? 'เสร็จแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'"
                        no-caps
                        dense
                        class="mark-done-btn"
                        @click.stop="
                          progressStore.toggleLessonCompletion(courseId || '', lesson.title)
                        "
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import DOMPurify from 'dompurify';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import SidebarNavigation from 'components/navigation/sidebar-navigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import { getCourseStructure, type CourseModule, type Lesson } from 'src/data/course-structure';
import { useCourseStore } from 'src/stores/course-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useMoodleSso } from 'src/composables/use-moodle-sso';
import { useMoodleCourseContents } from 'src/composables/use-moodle-course-contents';
import { getMoodleModuleTypeConfig } from 'src/utils/moodle-module-registry';

interface CourseModuleState extends CourseModule {
  expanded: boolean;
}

// Fallback icon by lesson type for mock structures that have no modname-derived icon.
const LESSON_TYPE_ICON: Record<Lesson['type'], string> = {
  video: 'play_circle',
  quiz: 'help_outline',
  article: 'article',
};

function getLessonIcon(lesson: Lesson): string {
  return lesson.icon || LESSON_TYPE_ICON[lesson.type] || 'article';
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

const $q = useQuasar();
const isMobile = computed(() => $q.screen.lt.md);
const router = useRouter();
const route = useRoute();
const progressStore = useCourseProgressStore();
const courseStore = useCourseStore();
const authStore = useAuthStore();
const registrationStore = useCourseRegistrationStore();
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

const courseTitle = computed<string>(() => {
  const titleFromCourse = currentCourse.value?.title;
  if (titleFromCourse) return titleFromCourse;

  const titleFromQuery = getQueryString(route.query.courseTitle);
  return titleFromQuery || 'Course Learning';
});

const enrollId = computed<number | null>(() => {
  const reg = registrationStore.myRegistrations.find((r) => r.courseId === courseId.value);
  return reg?.enrollId ?? null;
});

const resolvedMoodleCourseId = computed<number | null>(() => {
  const fromCourse = currentCourse.value?.moodleId;
  if (fromCourse) return fromCourse;
  const fromQuery = Number(getQueryString(route.query.moodleCourseId));
  return fromQuery > 0 ? fromQuery : null;
});

const courseModulesWithProgress = computed(() => {
  const cid = courseId.value;
  if (!cid) return [];

  return courseModules.value.map((module) => {
    let total = 0;
    let completedCount = 0;
    const mark = (lesson: Lesson): Lesson & { isCompleted: boolean } => {
      const isCompleted = progressStore.isLessonCompleted(cid, lesson.title);
      total++;
      if (isCompleted) completedCount++;
      return { ...lesson, isCompleted };
    };

    const lessonsWithProgress = module.lessons.map(mark);
    const subsectionsWithProgress = (module.subsections ?? []).map((sub) => ({
      ...sub,
      lessons: sub.lessons.map(mark),
    }));

    const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
      ...module,
      lessons: lessonsWithProgress,
      subsections: subsectionsWithProgress,
      progress,
    };
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
  const moduleConfig = getMoodleModuleTypeConfig(lesson.moodleModname);

  // Moodle quiz → native in-app quiz engine
  if (lesson.moodleModuleId && lesson.moodleModname === 'quiz' && resolvedMoodleCourseId.value) {
    const q: Record<string, string> = {
      title: lesson.title,
      moodleCourseId: String(resolvedMoodleCourseId.value),
    };
    if (enrollId.value != null) q.enrollId = String(enrollId.value);
    await router.push({
      path: `/course/${courseIdValue}/moodle-quiz/${lesson.moodleModuleId}`,
      query: q,
    });
    return;
  }

  // Moodle assignment → native in-app submission page
  if (lesson.moodleModuleId && lesson.moodleModname === 'assign' && resolvedMoodleCourseId.value) {
    const q: Record<string, string> = {
      title: lesson.title,
      moodleCourseId: String(resolvedMoodleCourseId.value),
    };
    if (enrollId.value != null) q.enrollId = String(enrollId.value);
    await router.push({
      path: `/course/${courseIdValue}/moodle-assign/${lesson.moodleModuleId}`,
      query: q,
    });
    return;
  }

  // Moodle feedback → native in-app questionnaire flow
  if (
    lesson.moodleModuleId &&
    lesson.moodleModname === 'feedback' &&
    resolvedMoodleCourseId.value
  ) {
    await router.push({
      path: `/course/${courseIdValue}/moodle-feedback/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(resolvedMoodleCourseId.value) },
    });
    return;
  }

  // Moodle forum → native in-app discussion board (list + thread)
  if (lesson.moodleModuleId && lesson.moodleModname === 'forum' && resolvedMoodleCourseId.value) {
    await router.push({
      path: `/course/${courseIdValue}/moodle-forum/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(resolvedMoodleCourseId.value) },
    });
    return;
  }

  // Content-type modules → dedicated in-app content page (native render, no Moodle redirect)
  if (
    lesson.moodleModuleId &&
    lesson.moodleModname &&
    moduleConfig.decision === 'native' &&
    resolvedMoodleCourseId.value
  ) {
    await router.push({
      path: `/course/${courseIdValue}/learn/${lesson.moodleModuleId}`,
      query: {
        title: lesson.title,
        modname: lesson.moodleModname,
        moodleCourseId: String(resolvedMoodleCourseId.value),
      },
    });
    return;
  }

  // Unsupported Moodle modules stay in-app with the real module type and an explicit Moodle button.
  if (
    lesson.moodleModuleId &&
    lesson.moodleModname &&
    moduleConfig.decision === 'unsupported' &&
    resolvedMoodleCourseId.value
  ) {
    await router.push({
      path: `/course/${courseIdValue}/moodle-unsupported/${lesson.moodleModuleId}`,
      query: {
        title: lesson.title,
        modname: lesson.moodleModname,
        moodleUrl: lesson.moodleUrl ?? '',
        moodleCourseId: String(resolvedMoodleCourseId.value),
      },
    });
    return;
  }

  // Legacy/mock Moodle links without a mapped module id still open via SSO.
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

onMounted(() => {
  courseStore.init();
});

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
$sidebar-width: 300px;
$sidebar-transition: 0.28s cubic-bezier(0.4, 0, 0.2, 1);

// Chapter summary (type/hours from Moodle section summary)
.chapter-summary {
  color: #5a5a5a;
  font-size: 0.9rem;
  line-height: 1.6;

  :deep(p) {
    margin: 0 0 6px;
    color: #888;
    font-size: 0.8rem;
  }
  :deep(ul) {
    margin: 0;
    padding-left: 18px;
  }
  :deep(li) {
    margin: 2px 0;
  }
}

// Nested subsection (หัวข้อย่อย) — collapsible
.subsection-item {
  margin: 6px 16px 6px 28px;
  border-left: 3px solid rgba(247, 208, 70, 0.55);
  border-radius: 0 10px 10px 0;
  background: rgba(247, 208, 70, 0.04);
  overflow: hidden;

  :deep(.subsection-header) {
    min-height: 48px;
    padding: 6px 16px;
    border-radius: 0;
  }
  .subsection-header__avatar {
    min-width: auto;
    padding-right: 10px;
  }
  .subsection-title-text {
    font-weight: 600;
    font-size: 0.9rem;
    color: #1a1a1a;
  }
  .subsection-count {
    font-size: 0.72rem;
    color: #999;
    white-space: nowrap;
  }
  .subsection-empty {
    padding: 6px 24px 12px 46px;
    font-size: 0.82rem;
    color: #aaa;
  }
  .lesson-row--nested {
    padding-left: 40px !important;
    background: #fff;
  }
}

// ── Page shell ──────────────────────────────────────────────
.course-page {
  min-height: calc(100vh - 64px);
  background-color: transparent;
  position: relative;
}

// ── Sidebar overlay (mobile backdrop) ───────────────────────
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 199;
}

// ── Sliding sidebar panel ────────────────────────────────────
.course-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: $sidebar-width;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 200;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    display: flex;
    justify-content: flex-end;
    padding: 8px 8px 0;
    flex-shrink: 0;
  }
}

// ── Main content area ────────────────────────────────────────
.course-main {
  transition: margin-left $sidebar-transition;

  &--shifted {
    @media (min-width: 1024px) {
      margin-left: $sidebar-width;
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

.mark-done-btn {
  min-height: 32px !important;
  padding: 4px 12px !important;
  font-size: 12px !important;
  border-radius: 8px !important;
  white-space: nowrap;
}

// ── Vue transitions ──────────────────────────────────────────
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: transform $sidebar-transition;
}
.slide-sidebar-enter-from,
.slide-sidebar-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
