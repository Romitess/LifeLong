<template>
  <q-page class="bg-grey-1 grades-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
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

      <!-- Sidebar Drawer -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <div
          class="q-pb-xl content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 50px"
        >
          <div class="row justify-center">
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
                <q-breadcrumbs-el
                  :label="courseTitle"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${courseId}/learn`)"
                />
                <q-breadcrumbs-el
                  :label="$t('sidebar.grades')"
                  class="text-weight-bold text-dark q-px-sm"
                />
              </q-breadcrumbs>

              <!-- User Profile Summary -->
              <div class="row items-center q-mb-xl profile-summary-card">
                <q-avatar
                  size="64px"
                  color="blue-grey-1"
                  text-color="blue-grey-9"
                  class="text-weight-bold shadow-1"
                >
                  {{ userInitials }}
                </q-avatar>
                <div class="q-ml-lg">
                  <div class="text-h5 text-weight-bolder text-blue-grey-10">
                    {{ authStore.user?.firstNameEn }} {{ authStore.user?.lastNameEn }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase letter-spacing-1">
                    {{ $t('grades.studentDashboard') }}
                  </div>
                </div>
              </div>

              <!-- Grades Card -->
              <q-card flat bordered class="grades-card shadow-1">
                <q-card-section class="q-pa-none">
                  <q-markup-table flat class="grades-table">
                    <thead>
                      <tr>
                        <th class="text-left">{{ $t('grades.item') }}</th>
                        <th class="text-center">{{ $t('grades.weight') }}</th>
                        <th class="text-center">{{ $t('grades.grade') }}</th>
                        <th class="text-center">{{ $t('grades.range') }}</th>
                        <th class="text-center">{{ $t('grades.percentage') }}</th>
                        <th class="text-center">{{ $t('grades.contribution') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Course Header Row -->
                      <tr class="course-header-row">
                        <td colspan="6">
                          <div class="row items-center">
                            <q-icon name="expand_more" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold"
                              >{{ currentCourse?.code }} {{ courseTitle }}</span
                            >
                          </div>
                        </td>
                      </tr>

                      <!-- Grade Rows -->
                      <tr v-for="(item, index) in gradeItems" :key="index">
                        <td class="text-left">
                          <div class="row no-wrap items-center">
                            <div class="item-icon-container q-mr-md">
                              <q-icon name="assignment" size="20px" color="blue-grey-4" />
                            </div>
                            <div>
                              <div class="text-caption text-grey-5">{{ $t('grades.quiz') }}</div>
                              <div class="text-weight-bold text-blue-grey-9">{{ item.title }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center text-grey-7">{{ item.weight }} %</td>
                        <td class="text-center text-weight-bold text-primary">
                          {{ item.grade || '-' }}
                        </td>
                        <td class="text-center text-grey-7">{{ item.range }}</td>
                        <td class="text-center">
                          <div class="column items-center">
                            <span class="text-weight-medium">{{ item.percentage }} %</span>
                            <q-linear-progress
                              :value="Number(item.percentage) / 100"
                              color="primary"
                              class="q-mt-xs"
                              style="width: 60px"
                              rounded
                            />
                          </div>
                        </td>
                        <td class="text-center text-grey-7">{{ item.contribution }} %</td>
                      </tr>

                      <!-- Aggregation Row -->
                      <tr class="aggregation-row">
                        <td class="text-left">
                          <div class="row items-center">
                            <div class="aggregation-icon q-mr-md">
                              <q-icon name="functions" size="20px" color="primary" />
                            </div>
                            <div>
                              <div class="text-caption text-primary text-weight-bold">
                                {{ $t('grades.aggregation') }}
                              </div>
                              <div class="text-h6 text-weight-bolder text-dark">
                                {{ $t('grades.courseTotal') }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">-</td>
                        <td class="text-center text-h6 text-weight-bolder text-primary">
                          {{ totalScore.toFixed(2) }}
                        </td>
                        <td class="text-center text-grey-7">0-{{ totalWeight }}</td>
                        <td class="text-center">
                          <div class="column items-center">
                            <span class="text-h6 text-weight-bolder"
                              >{{ totalPercentage.toFixed(2) }} %</span
                            >
                            <q-linear-progress
                              :value="totalPercentage / 100"
                              color="positive"
                              class="q-mt-xs"
                              style="width: 100px; height: 6px"
                              rounded
                            />
                          </div>
                        </td>
                        <td class="text-center">-</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card-section>
              </q-card>
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
import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import { getCourseDetailById } from 'src/data/mock-courses';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { getFlatLessons, getCourseStructure } from 'src/data/course-structure';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';

const route = useRoute();
const authStore = useAuthStore();
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

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});

const courseTitle = computed(() => currentCourse.value?.title || 'Course');

const userInitials = computed(() => {
  if (!authStore.user) return '??';
  const f = authStore.user.firstNameEn?.[0] || '';
  const l = authStore.user.lastNameEn?.[0] || '';
  return (f + l).toUpperCase() || '??';
});

const quizLessons = computed(() => {
  const structure = getCourseStructure(courseId.value);
  return getFlatLessons(structure).filter((l) => l.type === 'quiz');
});

const gradeItems = computed(() => {
  const quizzes = quizLessons.value;
  if (quizzes.length === 0) return [];

  // Distribute 100% weight across all quizzes
  const weightPerQuiz = 100 / quizzes.length;

  return quizzes.map((quiz) => {
    const bestScore = progressStore.getBestScore(courseId.value || '', quiz.title);
    // Note: In a real app, total questions would come from a database.
    // For our mock, we'll assume 5 for pre-test and 2 for others as defined in course-quiz-page.
    const totalQ = quiz.title.includes('Pre-test') ? 4 : quiz.title.includes('แบบฝึกหัด') ? 2 : 1;

    const percentageNum = bestScore !== null ? (bestScore / totalQ) * 100 : 0;
    const weightNum = weightPerQuiz;
    const contributionNum = (percentageNum * weightNum) / 100;

    return {
      title: quiz.title,
      weight: weightNum.toFixed(2),
      grade: bestScore !== null ? bestScore.toFixed(2) : null,
      range: `0-${totalQ}`,
      percentage: percentageNum.toFixed(2),
      contribution: contributionNum.toFixed(2),
    };
  });
});

const totalScore = computed(() => {
  return gradeItems.value.reduce((acc, item) => acc + (item.grade ? parseFloat(item.grade) : 0), 0);
});

const totalWeight = computed(() => {
  // Sum of all max scores
  return quizLessons.value.reduce((acc, quiz) => {
    // In a real app, this would come from a quiz definition.
    // Mocking logic to stay consistent with other pages
    const totalQ = quiz.title.includes('Pre-test') ? 4 : quiz.title.includes('แบบฝึกหัด') ? 2 : 1;
    return acc + totalQ;
  }, 0);
});

const totalPercentage = computed(() => {
  if (gradeItems.value.length === 0) return 0;
  return gradeItems.value.reduce((acc, item) => acc + parseFloat(item.contribution), 0);
});
</script>

<style lang="scss" scoped>
.grades-page {
  height: calc(100vh - 72px);
  overflow: hidden;
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

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
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

.profile-summary-card {
  padding: 12px;
  border-radius: 20px;
  transition: all 0.3s ease;

  .q-avatar {
    border: 3px solid white;
  }
}

.grades-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

.grades-table {
  thead th {
    background-color: #fafbfc;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 16px;
  }

  tbody tr {
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #f8fafc;
    }
  }

  td {
    padding: 20px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
}

.course-header-row {
  background-color: #f1f5f9;
  td {
    padding: 12px 16px;
    color: #334155;
    font-size: 0.95rem;
  }
}

.item-icon-container {
  width: 40px;
  height: 40px;
  background-color: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aggregation-row {
  background-color: #f8fafc;
  td {
    padding: 24px 16px;
    border-top: 2px solid #e2e8f0;
  }
}

.aggregation-icon {
  width: 48px;
  height: 48px;
  background-color: rgba($primary, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-spacing-1 {
  letter-spacing: 1px;
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
