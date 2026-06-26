<template>
  <q-scroll-area class="fit sidebar-nav">
    <div class="q-pa-md">
      <!-- Header -->
      <div class="nav-header row items-center q-mb-lg">
        <q-icon name="explore" size="24px" color="primary" class="q-mr-sm" />
        <div class="text-h6 text-weight-bolder text-dark uppercase letter-spacing-1">
          {{ $t('sidebar.navigation') }}
        </div>
      </div>

      <q-list class="nav-list">
        <!-- Site Home -->
        <q-item clickable v-ripple class="nav-item q-mb-xs" to="/course-home">
          <q-item-section avatar>
            <q-icon name="home" color="grey-7" size="22px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-grey-8">{{
              $t('sidebar.siteHome')
            }}</q-item-label>
          </q-item-section>
        </q-item>

        <!-- Site Info Section -->
        <q-expansion-item
          expand-separator
          :label="$t('sidebar.siteInfo')"
          class="nav-group"
          header-class="nav-group-header"
          default-opened
          icon="info"
        >
          <q-list class="sub-list">
            <q-item clickable v-ripple class="nav-item sub-item">
              <q-item-section>Site blogs</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="nav-item sub-item">
              <q-item-section>Site badges</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="nav-item sub-item">
              <q-item-section>Tags</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>

        <!-- My Courses (List Section) -->
        <q-expansion-item
          expand-separator
          :label="$t('sidebar.myCourses')"
          class="nav-group"
          header-class="nav-group-header"
          default-opened
          icon="school"
        >
          <q-list class="sub-list">
            <q-expansion-item
              v-for="course in myCourses"
              :key="course.id"
              class="course-expansion"
              header-class="course-expansion-header"
              default-opened
              dense
            >
              <template v-slot:header>
                <q-item-section>
                  <q-item-label class="course-text text-weight-bold">
                    {{ course.code }} {{ course.title }}
                  </q-item-label>
                </q-item-section>
              </template>

              <q-list class="course-details-list">
                <q-item
                  clickable
                  v-ripple
                  tag="a"
                  :href="resolveFullUrl(`/course/${course.id}/learn`)"
                  class="course-detail-item"
                  @click.prevent="onSidebarNavClick(`/course/${course.id}/learn`, $event)"
                >
                  <q-item-section avatar>
                    <q-icon name="task_alt" size="18px" />
                  </q-item-section>
                  <q-item-section>{{ $t('sidebar.competencies') }}</q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  tag="a"
                  :href="resolveFullUrl(`/course/${course.id}/grades`)"
                  class="course-detail-item"
                  @click.prevent="onSidebarNavClick(`/course/${course.id}/grades`, $event)"
                >
                  <q-item-section avatar>
                    <q-icon name="grid_on" size="18px" />
                  </q-item-section>
                  <q-item-section>{{ $t('sidebar.grades') }}</q-item-section>
                </q-item>

                <!-- Course Modules -->
                <q-expansion-item
                  v-for="(module, mIdx) in course.modules"
                  :key="mIdx"
                  dense
                  header-class="module-expansion-header"
                  class="module-expansion"
                  :class="{ 'active-module': module.isActive }"
                  :default-opened="module.isActive"
                  hide-expand-icon
                >
                  <template v-slot:header>
                    <q-item-section avatar>
                      <q-icon
                        :name="module.isActive ? 'expand_more' : 'chevron_right'"
                        size="18px"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label
                        :class="{
                          'text-primary text-weight-bold': module.isActive,
                        }"
                      >
                        {{ module.title }}
                      </q-item-label>
                    </q-item-section>
                  </template>
                  <q-list class="lesson-sub-list">
                    <q-item
                      v-for="(lesson, lIdx) in module.lessonsWithState"
                      :key="lIdx"
                      clickable
                      v-ripple
                      tag="a"
                      :href="resolveFullUrl(getLessonPath(lesson, course.id))"
                      class="lesson-sub-item"
                      @click.prevent="navigateToLesson(lesson, course.id, $event)"
                      :active="lesson.isActive"
                    >
                      <q-item-section avatar>
                        <q-icon
                          :name="getLessonIcon(lesson.type)"
                          size="14px"
                          :color="lesson.isActive ? 'primary' : 'grey-6'"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="lesson-title">{{ lesson.title }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { getCourseStructure, type Lesson } from 'src/data/course-structure';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import { computed } from 'vue';

const route = useRoute();
const router = useRouter();
const { myRegisteredCourseEntries } = useMyRegisteredCourses();

const currentRouteCourseId = computed(() => String(route.params.id));
const activeLessonTitle = computed(() => {
  return decodeURIComponent(
    (route.params.videoId as string) || (route.params.quizId as string) || '',
  );
});

const myCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => {
    const course = entry.course;
    const modules = getCourseStructure(course.id);

    const modulesWithState = modules.map((module) => {
      const isCourseActive = course.id === currentRouteCourseId.value;
      const isModActive =
        isCourseActive && module.lessons.some((l) => l.title === activeLessonTitle.value);

      return {
        ...module,
        isActive: isModActive,
        lessonsWithState: module.lessons.map((lesson) => ({
          ...lesson,
          isActive: isCourseActive && lesson.title === activeLessonTitle.value,
        })),
      };
    });

    return {
      ...course,
      modules: modulesWithState,
    };
  });
});

const getLessonPath = (lesson: Lesson, cid?: string) => {
  const courseId = cid || String(route.params.id);
  if (!courseId || courseId === 'undefined') return '';

  if (lesson.type === 'quiz') {
    return `/course/${courseId}/quiz/${encodeURIComponent(lesson.title)}`;
  }
  return `/course/${courseId}/video/${encodeURIComponent(lesson.title)}`;
};

const navigateToLesson = (lesson: Lesson, cid?: string, event?: Event) => {
  if (event && isNewTabClick(event)) {
    return;
  }

  const path = getLessonPath(lesson, cid);
  if (path) {
    void router.push(path);
  }
};

const getLessonIcon = (type: string) => {
  switch (type) {
    case 'video':
      return 'play_circle';
    case 'quiz':
      return 'assignment';
    case 'article':
      return 'description';
    default:
      return 'circle';
  }
};

function onSidebarNavClick(path: string, event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  void router.push(path);
}
</script>

<style lang="scss" scoped>
.sidebar-nav {
  background-color: #ffffff;
}

.nav-header {
  padding: 8px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 24px !important;

  .text-h6 {
    font-size: 0.9rem;
    color: #666;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
}

.nav-list {
  .nav-item {
    border-radius: 10px;
    transition: all 0.2s ease;
    min-height: 44px;

    &:hover {
      background-color: rgba($primary, 0.05);
      .q-icon {
        color: $primary !important;
      }
      .text-grey-8 {
        color: $primary !important;
      }
    }

    .q-item__section--avatar {
      min-width: 40px;
    }
  }
}

.nav-group {
  margin-bottom: 8px;

  :deep(.nav-group-header) {
    border-radius: 10px;
    font-weight: 700;
    font-size: 0.95rem;
    color: #333;
    min-height: 48px;

    .q-item__section--avatar {
      min-width: 40px;
    }

    &:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  }
}

.sub-list {
  padding-left: 8px;
  margin-left: 20px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.sub-item {
  font-size: 0.9rem;
  color: #666;
  padding-left: 16px;
  min-height: 36px;
  margin-top: 2px;

  &:hover {
    color: $primary;
  }
}

.course-expansion {
  :deep(.course-expansion-header) {
    padding-left: 8px;
    padding-right: 8px;
    border-radius: 8px;

    .q-item__section--main {
      font-size: 0.88rem;
      color: #333;
      line-height: 1.4;
    }
  }
}

.course-details-list {
  padding-left: 4px;
}

.course-detail-item {
  min-height: 36px;
  border-radius: 8px;
  margin-top: 2px;
  font-size: 0.85rem;
  color: #555;
  padding-left: 12px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
    color: $primary;
  }

  .q-item__section--avatar {
    min-width: 32px;
    color: #666;
  }
}

.module-item {
  .q-icon {
    color: #999;
  }
}

.ellipsis-2-lines {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.module-expansion {
  :deep(.module-expansion-header) {
    font-size: 0.88rem;
    color: #333;
    padding-left: 8px;
    min-height: 44px;
    border-radius: 12px;
    margin-top: 4px;

    &:hover {
      background-color: rgba($primary, 0.05);
      color: $primary;
      .q-icon {
        color: $primary;
      }
    }

    .q-item__section--avatar {
      min-width: 32px;
      color: #666;
    }

    &.q-expansion-item__header--expanded {
      .q-item__section--avatar .q-icon {
        color: $primary;
      }
    }
  }

  &.active-module {
    :deep(.module-expansion-header) {
      background-color: rgba($primary, 0.08);
      color: $primary;
      font-weight: bold;
    }
  }
}

.lesson-sub-list {
  padding-left: 20px;
  margin-left: 15px;
  border-left: 1px solid rgba(0, 0, 0, 0.05);
}

.lesson-sub-item {
  min-height: 32px;
  font-size: 0.8rem;
  border-radius: 6px;
  margin: 2px 0;
  color: #666;

  &:hover {
    color: $primary;
    background-color: rgba($primary, 0.03);
  }

  &.q-manual-focusable--active,
  &.active {
    color: $primary;
    background-color: rgba($primary, 0.05);
    font-weight: 500;
  }

  .q-item__section--avatar {
    min-width: 24px;
  }

  .lesson-title {
    line-height: 1.4;
  }
}
</style>
