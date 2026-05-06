<template>
  <q-page class="bg-grey-1 course-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 68px)"
      class="learning-layout"
    >
      <!-- Course Toolbar (Header) -->
      <q-header elevated class="nav-bar text-white">
        <div class="section-container">
          <div class="row items-center no-wrap">
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
                        <q-item-section avatar
                          ><q-avatar
                            :icon="course.cover.icon"
                            :color="course.id === courseId ? 'primary' : 'grey-2'"
                            :text-color="course.id === courseId ? 'white' : 'grey-7'"
                            size="32px"
                        /></q-item-section>
                        <q-item-section
                          ><q-item-label lines="1" class="text-weight-bold">{{
                            course.title
                          }}</q-item-label
                          ><q-item-label caption>{{ course.code }}</q-item-label></q-item-section
                        >
                        <q-item-section side v-if="course.id === courseId"
                          ><q-icon name="check_circle" color="primary" size="20px"
                        /></q-item-section>
                      </q-item>
                      <q-item
                        v-if="registeredCourses.length === 0"
                        class="text-grey-6 text-center q-pa-md"
                        >{{ $t('profile.courses.empty') }}</q-item
                      >
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
                  >มุมมองมาตรฐาน</q-tooltip
                >
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
                  >มุมมองเต็มหน้าจอ</q-tooltip
                >
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
          <!-- Video Content -->
          <div class="video-content-wrapper row justify-center">
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
              <!-- Breadcrumbs -->
              <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
                <template v-slot:separator>
                  <q-icon size="1.4em" name="chevron_right" color="grey-4" />
                </template>
                <q-breadcrumbs-el
                  :label="$t('learning.home')"
                  icon="home"
                  to="/course-home"
                  class="breadcrumb-link"
                />
                <!-- <q-breadcrumbs-el
                  :label="$t('learning.thisCourse')"
                  icon="school"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                /> -->
                <q-breadcrumbs-el
                  :label="courseTitle"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${String($route.params.id)}/learn`)"
                />
                <q-breadcrumbs-el
                  :label="`${$t('learning.videoLesson')} ${lessonTitle}`"
                  class="text-weight-bold text-dark q-px-sm"
                />
              </q-breadcrumbs>
              <div class="row items-center justify-between q-mb-lg">
                <h1 class="text-h5 text-weight-bolder text-dark q-my-none lh-sm">
                  {{ $t('learning.videoLesson') }} {{ lessonTitle }}
                </h1>
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
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import { getCourseDetailById } from 'src/data/mock-courses';
import { getNavigation, type Lesson } from 'src/data/course-structure';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
// const router = useRouter();
const $q = useQuasar();
const progressStore = useCourseProgressStore();
const { myRegisteredCourseEntries } = useMyRegisteredCourses();
const leftDrawerOpen = ref(false);
const myCoursesMenu = ref(false);
const thisCourseMenu = ref(false);
const activeNav = ref('this-course');
import { useUiStore } from 'src/stores/ui-store';
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

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const registeredCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});
const videoId = computed(() =>
  Array.isArray(route.params.videoId) ? route.params.videoId[0] : route.params.videoId,
);

const lessonTitle = computed(() => decodeURIComponent(videoId.value || ''));

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});
const courseTitle = computed(() => currentCourse.value?.title || 'Course');

const isCompleted = computed(() => {
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
  height: calc(100vh - 68px);
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

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #e3f2fd;
    color: var(--q-primary);
  }
}

.learning-layout {
  background-color: transparent;
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
